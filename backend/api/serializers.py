from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Tender, TenderRequirement, Bidder, Bid, Document,
    DocumentField, Verification, CrossCheck, ComplianceResult, RiskFinding,
    AIRecommendation, OfficerDecision, AuditLog
)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'department', 'organization', 'dsc_serial_number']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class TenderRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderRequirement
        fields = '__all__'

class TenderSerializer(serializers.ModelSerializer):
    requirements = TenderRequirementSerializer(many=True, read_only=True)

    class Meta:
        model = Tender
        fields = '__all__'

class BidderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bidder
        fields = '__all__'

class DocumentFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentField
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    extracted_fields = DocumentFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = '__all__'

class VerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = '__all__'

class CrossCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrossCheck
        fields = '__all__'

class ComplianceResultSerializer(serializers.ModelSerializer):
    requirement_details = TenderRequirementSerializer(source='requirement', read_only=True)

    class Meta:
        model = ComplianceResult
        fields = '__all__'

class RiskFindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskFinding
        fields = '__all__'

class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = '__all__'

class OfficerDecisionSerializer(serializers.ModelSerializer):
    officer_name = serializers.ReadOnlyField(source='officer.username')

    class Meta:
        model = OfficerDecision
        fields = '__all__'

class BidSerializer(serializers.ModelSerializer):
    tender_details = TenderSerializer(source='tender', read_only=True)
    bidder_details = BidderSerializer(source='bidder', read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    verifications = VerificationSerializer(many=True, read_only=True)
    cross_checks = CrossCheckSerializer(many=True, read_only=True)
    compliance_results = ComplianceResultSerializer(many=True, read_only=True)
    risk_findings = RiskFindingSerializer(many=True, read_only=True)
    recommendation = AIRecommendationSerializer(read_only=True)
    decisions = OfficerDecisionSerializer(many=True, read_only=True)

    class Meta:
        model = Bid
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
