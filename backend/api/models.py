import uuid
from django.db import models
from django.contrib.auth.models import User

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    PROCUREMENT_OFFICER = 'PROCUREMENT_OFFICER', 'Procurement Officer'
    COMPLIANCE_REVIEWER = 'COMPLIANCE_REVIEWER', 'Compliance Reviewer'
    BIDDER = 'BIDDER', 'Bidder'
    AUDITOR = 'AUDITOR', 'Auditor'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=UserRole.choices, default=UserRole.PROCUREMENT_OFFICER)
    department = models.CharField(max_length=255, default='Ministry of Petroleum & Natural Gas')
    organization = models.CharField(max_length=255, default='GAIL (India) Limited')
    dsc_serial_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class TenderStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PUBLISHED = 'PUBLISHED', 'Published'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    EVALUATED = 'EVALUATED', 'Evaluated'
    CLOSED = 'CLOSED', 'Closed'

class Tender(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tender_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=500)
    department = models.CharField(max_length=255, default='MoPNG / GAIL')
    category = models.CharField(max_length=255, default='Works / Critical Infrastructure')
    issue_date = models.DateTimeField(auto_now_add=True)
    closing_date = models.DateTimeField()
    tender_type = models.CharField(max_length=100, default='Turnkey / EPC')
    estimated_value = models.DecimalField(max_digits=15, decimal_places=2, default=50000000.00)
    status = models.CharField(max_length=50, choices=TenderStatus.choices, default=TenderStatus.PUBLISHED)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tender_id} - {self.title}"

class TenderRequirement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='requirements')
    requirement_id = models.CharField(max_length=50) # e.g. R-01, R-02
    clause_number = models.CharField(max_length=50)
    category = models.CharField(max_length=100) # Financial, Experience, Legal, Technical
    description = models.TextField()
    mandatory = models.BooleanField(default=True)
    threshold = models.CharField(max_length=100, blank=True, null=True)
    unit = models.CharField(max_length=50, blank=True, null=True)
    expected_evidence = models.CharField(max_length=255)
    rule = models.TextField()

    def __str__(self):
        return f"{self.requirement_id} ({self.clause_number}) - {self.tender.tender_id}"

class Bidder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bidder_id = models.CharField(max_length=100, unique=True)
    legal_name = models.CharField(max_length=255)
    pan = models.CharField(max_length=20)
    gstin = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.legal_name} ({self.gstin})"

class BidStatus(models.TextChoices):
    SUBMITTED = 'SUBMITTED', 'Submitted'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    COMPLIANT = 'COMPLIANT', 'Compliant'
    DISQUALIFIED = 'DISQUALIFIED', 'Disqualified'
    CLARIFICATION_DISPATCHED = 'CLARIFICATION_DISPATCHED', 'Clarification Dispatched'

class Bid(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid_id = models.CharField(max_length=100, unique=True)
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(Bidder, on_delete=models.CASCADE, related_name='bids')
    submission_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=BidStatus.choices, default=BidStatus.UNDER_REVIEW)
    precheck_score = models.FloatField(default=66.7)

    def __str__(self):
        return f"{self.bid_id} - {self.bidder.legal_name}"

class DocumentType(models.TextChoices):
    GST_CERTIFICATE = 'GST_CERTIFICATE', 'GST Certificate'
    PAN = 'PAN', 'PAN Card'
    UDYAM = 'UDYAM', 'Udyam MSME Certificate'
    AUDITED_FINANCIAL_STATEMENT = 'AUDITED_FINANCIAL_STATEMENT', 'Audited Financial Statement'
    EXPERIENCE_CERTIFICATE = 'EXPERIENCE_CERTIFICATE', 'Experience Certificate'
    OEM_AUTHORIZATION = 'OEM_AUTHORIZATION', 'OEM Authorization Form 8-B'
    WORK_ORDER = 'WORK_ORDER', 'Work Order'
    OTHER = 'OTHER', 'Other Document'

class ProcessingStatus(models.TextChoices):
    UPLOADED = 'UPLOADED', 'Uploaded'
    PROCESSING = 'PROCESSING', 'Processing'
    OCR_COMPLETED = 'OCR_COMPLETED', 'OCR Completed'
    EXTRACTION_COMPLETED = 'EXTRACTION_COMPLETED', 'Extraction Completed'
    FAILED = 'FAILED', 'Failed'

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='documents')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, default='application/pdf')
    storage_path = models.CharField(max_length=500)
    document_type = models.CharField(max_length=100, choices=DocumentType.choices, default=DocumentType.OTHER)
    sha256_hash = models.CharField(max_length=64, blank=True, null=True)
    file_size = models.CharField(max_length=50, default='1.2 MB')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processing_status = models.CharField(max_length=50, choices=ProcessingStatus.choices, default=ProcessingStatus.EXTRACTION_COMPLETED)

    def __str__(self):
        return f"{self.file_name} ({self.document_type})"

class DocumentField(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='extracted_fields')
    field_name = models.CharField(max_length=100)
    field_value = models.TextField()
    confidence = models.FloatField(default=0.98)
    page_number = models.IntegerField(default=1)
    bounding_box = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.field_name}: {self.field_value}"

class VerificationStatus(models.TextChoices):
    VERIFIED = 'VERIFIED', 'Verified'
    UNVERIFIED = 'UNVERIFIED', 'Unverified'
    NOT_FOUND = 'NOT_FOUND', 'Not Found'
    EXPIRED = 'EXPIRED', 'Expired'
    MISMATCH = 'MISMATCH', 'Mismatch'
    NEEDS_REVIEW = 'NEEDS_REVIEW', 'Needs Review'

class Verification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='verifications')
    field_name = models.CharField(max_length=100)
    submitted_value = models.TextField()
    verified_value = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=100) # GSTN API, CBDT, NSDL, UDIN, SAP
    status = models.CharField(max_length=50, choices=VerificationStatus.choices, default=VerificationStatus.VERIFIED)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.field_name} - {self.status}"

class CrossCheck(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='cross_checks')
    field_name = models.CharField(max_length=100)
    source1 = models.CharField(max_length=100)
    source2 = models.CharField(max_length=100)
    value1 = models.TextField()
    value2 = models.TextField()
    match_score = models.FloatField(default=100.0)
    result = models.CharField(max_length=50, default='MATCH')

    def __str__(self):
        return f"{self.field_name} ({self.result})"

class ComplianceOutcome(models.TextChoices):
    COMPLIANT = 'COMPLIANT', 'Compliant'
    NON_COMPLIANT = 'NON_COMPLIANT', 'Non-Compliant'
    MISSING = 'MISSING', 'Missing'
    EXPIRED = 'EXPIRED', 'Expired'
    INCONSISTENT = 'INCONSISTENT', 'Inconsistent'
    REQUIRES_REVIEW = 'REQUIRES_REVIEW', 'Requires Review'

class ComplianceResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='compliance_results')
    requirement = models.ForeignKey(TenderRequirement, on_delete=models.CASCADE)
    rule = models.TextField()
    input_value = models.TextField()
    result = models.CharField(max_length=50, choices=ComplianceOutcome.choices, default=ComplianceOutcome.COMPLIANT)
    reason = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requirement.requirement_id}: {self.result}"

class RiskLevel(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class RiskFinding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='risk_findings')
    finding_type = models.CharField(max_length=100)
    description = models.TextField()
    affected_requirement = models.CharField(max_length=100)
    risk_points = models.IntegerField(default=15)
    risk_level = models.CharField(max_length=50, choices=RiskLevel.choices, default=RiskLevel.HIGH)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.finding_type} - {self.risk_level}"

class AIRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.OneToOneField(Bid, on_delete=models.CASCADE, related_name='recommendation')
    overall_compliance = models.FloatField(default=83.3)
    summary = models.TextField()
    recommended_action = models.CharField(max_length=100, default='REQUEST_CLARIFICATION')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rec for {self.bid.bid_id}: {self.recommended_action}"

class OfficerDecision(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='decisions')
    officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    decision = models.CharField(max_length=100) # APPROVE, REJECT, REQUEST_CLARIFICATION, UNDER_REVIEW
    reason = models.TextField(blank=True, null=True)
    dsc_pin_verified = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Decision for {self.bid.bid_id}: {self.decision}"

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.CharField(max_length=255)
    action = models.CharField(max_length=100)
    entity = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100)
    sha256_root = models.CharField(max_length=64)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.action} by {self.actor} at {self.timestamp}"
