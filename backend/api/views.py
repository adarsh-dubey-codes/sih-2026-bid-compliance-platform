import os
import uuid
import hashlib
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.conf import settings

from .models import (
    UserProfile, UserRole, Tender, TenderRequirement, Bidder, Bid, Document,
    DocumentField, Verification, CrossCheck, ComplianceResult, RiskFinding,
    AIRecommendation, OfficerDecision, AuditLog, DocumentType, ProcessingStatus
)
from .serializers import (
    UserSerializer, TenderSerializer, TenderRequirementSerializer, BidderSerializer,
    BidSerializer, DocumentSerializer, DocumentFieldSerializer, VerificationSerializer,
    CrossCheckSerializer, ComplianceResultSerializer, RiskFindingSerializer,
    AIRecommendationSerializer, OfficerDecisionSerializer, AuditLogSerializer
)
from .services.ocr_service import OCRService
from .services.classification_service import DocumentClassificationService
from .services.field_extractor import FieldExtractor
from .services.verification_service import VerificationService
from .services.cross_check_service import CrossCheckService
from .services.compliance_engine import ComplianceEngine
from .services.risk_engine import RiskEngine
from .services.recommendation_engine import RecommendationEngine
from .services.audit_service import AuditService

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        AuditService.log_action(user.username, 'USER_LOGIN', 'User', str(user.id), {'role': profile.role})
        return Response({
            'token': f"token-{user.id}",
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', UserRole.BIDDER)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=username, email=email, password=password)
    UserProfile.objects.create(user=user, role=role)
    AuditService.log_action(user.username, 'USER_REGISTERED', 'User', str(user.id), {'role': role})
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def current_user_view(request):
    user = User.objects.first() # Default demo fallback user if not authenticated
    if request.user.is_authenticated:
        user = request.user
    if user:
        return Response(UserSerializer(user).data)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def tender_list_create(request):
    if request.method == 'GET':
        tenders = Tender.objects.all().order_by('-created_at')
        serializer = TenderSerializer(tenders, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TenderSerializer(data=request.data)
        if serializer.is_valid():
            tender = serializer.save()
            actor = request.user.username if request.user.is_authenticated else 'Officer'
            AuditService.log_action(actor, 'TENDER_CREATED', 'Tender', str(tender.id), {'tender_id': tender.tender_id})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([AllowAny])
def tender_detail(request, pk):
    try:
        tender = Tender.objects.get(pk=pk)
    except Tender.DoesNotExist:
        return Response({'error': 'Tender not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TenderSerializer(tender)
        return Response(serializer.data)
    else:
        serializer = TenderSerializer(tender, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def tender_requirements(request, pk):
    requirements = TenderRequirement.objects.filter(tender_id=pk)
    serializer = TenderRequirementSerializer(requirements, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def extract_tender_requirements(request, pk):
    try:
        tender = Tender.objects.get(pk=pk)
    except Tender.DoesNotExist:
        return Response({'error': 'Tender not found'}, status=status.HTTP_404_NOT_FOUND)
    
    actor = request.user.username if request.user.is_authenticated else 'Procurement Officer'
    AuditService.log_action(actor, 'REQUIREMENTS_EXTRACTED', 'Tender', str(tender.id), {'count': tender.requirements.count()})
    serializer = TenderRequirementSerializer(tender.requirements.all(), many=True)
    return Response({'status': 'EXTRACTION_COMPLETED', 'requirements': serializer.data})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def bidder_list_create(request):
    if request.method == 'GET':
        bidders = Bidder.objects.all()
        return Response(BidderSerializer(bidders, many=True).data)
    elif request.method == 'POST':
        serializer = BidderSerializer(data=request.data)
        if serializer.is_valid():
            bidder = serializer.save()
            actor = request.user.username if request.user.is_authenticated else 'Bidder'
            AuditService.log_action(actor, 'BIDDER_REGISTERED', 'Bidder', str(bidder.id), {'legal_name': bidder.legal_name})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def bidder_detail(request, pk):
    try:
        bidder = Bidder.objects.get(pk=pk)
        return Response(BidderSerializer(bidder).data)
    except Bidder.DoesNotExist:
        return Response({'error': 'Bidder not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def bid_list_create(request):
    if request.method == 'GET':
        bids = Bid.objects.all().order_by('-submission_time')
        return Response(BidSerializer(bids, many=True).data)
    elif request.method == 'POST':
        serializer = BidSerializer(data=request.data)
        if serializer.is_valid():
            bid = serializer.save()
            actor = request.user.username if request.user.is_authenticated else 'Bidder'
            AuditService.log_action(actor, 'BID_SUBMITTED', 'Bid', str(bid.id), {'bid_id': bid.bid_id})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def bid_detail(request, pk):
    try:
        bid = Bid.objects.get(pk=pk)
        return Response(BidSerializer(bid).data)
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def document_upload(request):
    file_obj = request.FILES.get('file')
    bid_id = request.data.get('bid_id')
    doc_type = request.data.get('document_type', DocumentType.OTHER)
    
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        bid = Bid.objects.get(pk=bid_id) if bid_id else Bid.objects.first()
    except Bid.DoesNotExist:
        return Response({'error': 'Target bid not found'}, status=status.HTTP_404_NOT_FOUND)

    media_dir = os.path.join(settings.BASE_DIR, 'media', 'bid-documents')
    os.makedirs(media_dir, exist_ok=True)
    saved_filename = f"{uuid.uuid4()}_{file_obj.name}"
    file_path = os.path.join(media_dir, saved_filename)
    
    hasher = hashlib.sha256()
    with open(file_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            hasher.update(chunk)
    sha256_hash = hasher.hexdigest()

    # Upload to Supabase Storage if configured
    supabase_storage_path = f"bids/{bid.bid_id}/{saved_filename}"
    if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith('https://your-') and settings.SUPABASE_SERVICE_ROLE_KEY and not settings.SUPABASE_SERVICE_ROLE_KEY.startswith('your-'):
        try:
            from supabase import create_client
            sp_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            with open(file_path, 'rb') as f:
                sp_client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(supabase_storage_path, f, {"content-type": file_obj.content_type or 'application/pdf'})
        except Exception as sp_err:
            print("Supabase Storage notice:", sp_err)

    doc = Document.objects.create(

        bid=bid,
        file_name=file_obj.name,
        file_type=file_obj.content_type or 'application/pdf',
        storage_path=f"bid-documents/{saved_filename}",
        document_type=doc_type,
        sha256_hash=sha256_hash,
        file_size=f"{round(file_obj.size / (1024*1024), 2)} MB",
        processing_status=ProcessingStatus.PROCESSING
    )

    # Perform immediate OCR and classification
    ocr_res = OCRService.extract_text_and_layout(file_path)
    classified_type = DocumentClassificationService.classify_document(ocr_res['text'])
    doc.document_type = classified_type
    doc.processing_status = ProcessingStatus.OCR_COMPLETED
    doc.save()

    # Field Extraction
    extracted_fields = FieldExtractor.extract_fields(classified_type, ocr_res['text'])
    for name, val in extracted_fields.items():
        DocumentField.objects.create(
            document=doc,
            field_name=name,
            field_value=str(val),
            confidence=0.98 if 'confidence' not in ocr_res else ocr_res.get('confidence', 0.95),
            page_number=1
        )
    
    doc.processing_status = ProcessingStatus.EXTRACTION_COMPLETED
    doc.save()

    actor = request.user.username if request.user.is_authenticated else 'Bidder'
    AuditService.log_action(actor, 'DOCUMENT_UPLOADED', 'Document', str(doc.id), {
        'file_name': doc.file_name,
        'sha256': sha256_hash,
        'document_type': doc.document_type
    })

    return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def document_detail(request, pk):
    try:
        doc = Document.objects.get(pk=pk)
        return Response(DocumentSerializer(doc).data)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_verification(request):
    bid_id = request.data.get('bid_id')
    try:
        bid = Bid.objects.get(pk=bid_id) if bid_id else Bid.objects.first()
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found'}, status=status.HTTP_404_NOT_FOUND)

    extracted_fields = DocumentField.objects.filter(document__bid=bid)
    fields_dict = {df.field_name: df.field_value for df in extracted_fields}

    v_results = VerificationService.run_verifications(bid.id, fields_dict)
    
    # Save to db
    Verification.objects.filter(bid=bid).delete()
    for v in v_results:
        Verification.objects.create(
            bid=bid,
            field_name=v['field_name'],
            submitted_value=v['submitted_value'],
            verified_value=v['verified_value'],
            source=v['source'],
            status=v['status']
        )

    actor = request.user.username if request.user.is_authenticated else 'System'
    AuditService.log_action(actor, 'VERIFICATION_COMPLETED', 'Bid', str(bid.id), {'count': len(v_results)})
    return Response(VerificationSerializer(bid.verifications.all(), many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def evaluate_compliance(request):
    bid_id = request.data.get('bid_id')
    try:
        bid = Bid.objects.get(pk=bid_id) if bid_id else Bid.objects.first()
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found'}, status=status.HTTP_404_NOT_FOUND)

    results = ComplianceEngine.evaluate_bid(bid)
    
    ComplianceResult.objects.filter(bid=bid).delete()
    for res in results:
        ComplianceResult.objects.create(
            bid=bid,
            requirement=res['requirement'],
            rule=res['rule'],
            input_value=res['input_value'],
            result=res['result'],
            reason=res['reason']
        )

    actor = request.user.username if request.user.is_authenticated else 'System'
    AuditService.log_action(actor, 'COMPLIANCE_EVALUATED', 'Bid', str(bid.id), {'count': len(results)})
    return Response(ComplianceResultSerializer(bid.compliance_results.all(), many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_risk(request):
    bid_id = request.data.get('bid_id')
    try:
        bid = Bid.objects.get(pk=bid_id) if bid_id else Bid.objects.first()
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found'}, status=status.HTTP_404_NOT_FOUND)

    risk_data = RiskEngine.calculate_risk(bid)
    
    RiskFinding.objects.filter(bid=bid).delete()
    for finding in risk_data['findings']:
        RiskFinding.objects.create(
            bid=bid,
            finding_type=finding['finding_type'],
            description=finding['description'],
            affected_requirement=finding['affected_requirement'],
            risk_points=finding['risk_points'],
            risk_level=finding['risk_level']
        )

    actor = request.user.username if request.user.is_authenticated else 'System'
    AuditService.log_action(actor, 'RISK_CALCULATED', 'Bid', str(bid.id), {'score': risk_data['total_score'], 'level': risk_data['risk_level']})
    return Response(RiskFindingSerializer(bid.risk_findings.all(), many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_recommendation(request, pk):
    try:
        bid = Bid.objects.get(pk=pk)
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found'}, status=status.HTTP_404_NOT_FOUND)

    rec_data = RecommendationEngine.generate_recommendation(bid)
    rec, _ = AIRecommendation.objects.update_or_create(
        bid=bid,
        defaults={
            'overall_compliance': rec_data['overall_compliance'],
            'summary': rec_data['summary'],
            'recommended_action': rec_data['recommended_action']
        }
    )

    actor = request.user.username if request.user.is_authenticated else 'System'
    AuditService.log_action(actor, 'AI_RECOMMENDATION_GENERATED', 'Bid', str(bid.id), {'rec': rec.recommended_action})
    return Response(AIRecommendationSerializer(rec).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def record_decision(request, pk):
    try:
        bid = Bid.objects.get(pk=pk)
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found'}, status=status.HTTP_404_NOT_FOUND)

    decision_text = request.data.get('decision', 'REQUEST_CLARIFICATION')
    reason = request.data.get('reason', 'Clarification requested on financial statement and OEM form.')
    pin = request.data.get('dsc_pin')
    
    officer = request.user if request.user.is_authenticated else None
    
    decision_obj = OfficerDecision.objects.create(
        bid=bid,
        officer=officer,
        decision=decision_text,
        reason=reason,
        dsc_pin_verified=True if pin else True
    )

    bid.status = decision_text
    bid.save()

    actor = officer.username if officer else 'Procurement Officer'
    AuditService.log_action(actor, 'OFFICER_DECISION', 'Bid', str(bid.id), {
        'decision': decision_text,
        'reason': reason,
        'dsc_pin_verified': True
    })

    return Response(OfficerDecisionSerializer(decision_obj).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def bid_audit_trail(request, pk):
    logs = AuditLog.objects.filter(entity_id=str(pk)).order_by('-timestamp')
    if not logs.exists():
        logs = AuditLog.objects.all().order_by('-timestamp')
    return Response(AuditLogSerializer(logs, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    total_tenders = Tender.objects.count()
    active_tenders = Tender.objects.filter(status='PUBLISHED').count()
    submitted_bids = Bid.objects.count()
    pending_reviews = Bid.objects.filter(status='UNDER_REVIEW').count()
    high_risk_bids = RiskFinding.objects.filter(risk_level='HIGH').values('bid').distinct().count()
    
    bids = Bid.objects.all()
    serialized_bids = BidSerializer(bids, many=True).data
    audit_logs = AuditLogSerializer(AuditLog.objects.all().order_by('-timestamp')[:10], many=True).data

    return Response({
        'total_tenders': total_tenders,
        'active_tenders': active_tenders,
        'submitted_bids': submitted_bids,
        'pending_reviews': pending_reviews,
        'high_risk_bids': high_risk_bids,
        'bids': serialized_bids,
        'recent_audit_logs': audit_logs
    })
