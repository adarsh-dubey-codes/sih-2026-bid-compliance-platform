from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
import datetime
import uuid
from api.models import (
    UserProfile, UserRole, Tender, TenderRequirement, Bidder, Bid, Document,
    DocumentField, Verification, CrossCheck, ComplianceResult, RiskFinding,
    AIRecommendation, OfficerDecision, AuditLog, DocumentType, ProcessingStatus,
    VerificationStatus, ComplianceOutcome, RiskLevel, BidStatus
)
from api.services.audit_service import AuditService

class Command(BaseCommand):
    help = 'Seed database with initial tender, bidder, requirements and compliance data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # 1. Users
        admin_user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@mopng.gov.in'})
        if not admin_user.password:
            admin_user.set_password('admin123')
            admin_user.save()
        UserProfile.objects.get_or_create(user=admin_user, defaults={'role': UserRole.ADMIN, 'department': 'MoPNG Head Office'})

        officer_user, _ = User.objects.get_or_create(username='procurement_officer', defaults={'email': 'officer@gail.co.in'})
        if not officer_user.password:
            officer_user.set_password('officer123')
            officer_user.save()
        UserProfile.objects.get_or_create(user=officer_user, defaults={'role': UserRole.PROCUREMENT_OFFICER, 'department': 'GAIL Procurement Cell'})

        bidder_user, _ = User.objects.get_or_create(username='apex_infra', defaults={'email': 'bids@apexinfra.com'})
        if not bidder_user.password:
            bidder_user.set_password('bidder123')
            bidder_user.save()
        UserProfile.objects.get_or_create(user=bidder_user, defaults={'role': UserRole.BIDDER, 'organization': 'Apex InfraTech Ltd'})

        # 2. Tender
        closing = timezone.now() + datetime.timedelta(days=30)
        tender, _ = Tender.objects.get_or_create(
            tender_id='MoPNG/GAIL/2026/TND-001',
            defaults={
                'title': 'Engineering, Procurement, & Construction of High-Pressure Natural Gas Trunk Pipeline (Package-B)',
                'department': 'Ministry of Petroleum & Natural Gas / GAIL',
                'category': 'Works / Critical Infrastructure',
                'closing_date': closing,
                'tender_type': 'Turnkey / EPC',
                'estimated_value': 500000000.00,
                'uploaded_by': officer_user
            }
        )

        # 3. Requirements
        reqs_data = [
            {'requirement_id': 'R-01', 'clause_number': 'Clause 4.1.2', 'category': 'Financial', 'description': 'Minimum Average Annual Financial Turnover of ₹50 Crore over last 3 fiscal years.', 'threshold': '500000000', 'unit': 'INR', 'expected_evidence': 'Audited Financial Statement / CA Turnover Certificate with UDIN', 'rule': 'turnover >= 500000000'},
            {'requirement_id': 'R-02', 'clause_number': 'Clause 5.3.1', 'category': 'Experience', 'description': 'Must have successfully completed at least 1 pipeline project of minimum ₹35 Crore in the past 5 years.', 'threshold': '350000000', 'unit': 'INR', 'expected_evidence': 'Completion Certificate issued by PSU / Govt Authority', 'rule': 'experience_value >= 350000000'},
            {'requirement_id': 'R-03', 'clause_number': 'Clause 2.1.0', 'category': 'Legal & Tax', 'description': 'Valid Active GSTIN Registration and active filing status.', 'threshold': 'ACTIVE', 'unit': 'Status', 'expected_evidence': 'GST Registration Certificate (Form REG-06)', 'rule': 'gst_status == ACTIVE'},
            {'requirement_id': 'R-04', 'clause_number': 'Clause 2.2.0', 'category': 'Legal & Tax', 'description': 'PAN Card matching legal entity name.', 'threshold': 'VALID', 'unit': 'Status', 'expected_evidence': 'PAN Card Copy', 'rule': 'pan_match == TRUE'},
            {'requirement_id': 'R-05', 'clause_number': 'Clause 6.1.4', 'category': 'Technical Authorization', 'description': 'Form 8-B Manufacturer Authorization for API 5L Grade X70 Line Pipes.', 'threshold': 'VALID_AUTHORIZATION', 'unit': 'Status', 'expected_evidence': 'OEM Form 8-B Authorization Letter', 'rule': 'oem_auth == VALID'},
            {'requirement_id': 'R-06', 'clause_number': 'Clause 3.4.0', 'category': 'MSME / Udyam', 'description': 'Udyam Registration Certificate for MSME Purchase Preference (if applicable).', 'threshold': 'VALID_UDYAM', 'unit': 'Status', 'expected_evidence': 'Udyam Registration Certificate', 'rule': 'udyam_status == VALID'},
        ]

        for r_data in reqs_data:
            TenderRequirement.objects.get_or_create(
                tender=tender,
                requirement_id=r_data['requirement_id'],
                defaults=r_data
            )

        # 4. Bidder
        bidder, _ = Bidder.objects.get_or_create(
            bidder_id='BDR-2026-9042',
            defaults={
                'legal_name': 'Apex InfraTech Pvt Ltd',
                'pan': 'AAACB1234F',
                'gstin': '07AAACB1234F1Z5',
                'address': 'Plot 42, Industrial Area Phase II, New Delhi',
                'user': bidder_user
            }
        )

        # 5. Bid
        bid, _ = Bid.objects.get_or_create(
            bid_id='BID-2026-8812',
            defaults={
                'tender': tender,
                'bidder': bidder,
                'status': BidStatus.UNDER_REVIEW,
                'precheck_score': 66.7
            }
        )

        # 6. Documents
        docs_data = [
            {'name': 'GST_Certificate_ApexInfra.pdf', 'type': DocumentType.GST_CERTIFICATE, 'hash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'},
            {'name': 'PAN_Card_Apex.pdf', 'type': DocumentType.PAN, 'hash': '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'},
            {'name': 'Audited_Financials_FY24_25.pdf', 'type': DocumentType.AUDITED_FINANCIAL_STATEMENT, 'hash': '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730'},
            {'name': 'Work_Completion_Cert_GAIL.pdf', 'type': DocumentType.EXPERIENCE_CERTIFICATE, 'hash': '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'},
            {'name': 'Udyam_Registration.pdf', 'type': DocumentType.UDYAM, 'hash': '6f9c9af6715c175686e67d140e0a52b15232aa14158e707ec6c49f2714b677fd'},
            {'name': 'Form_8B_OEM_Auth.pdf', 'type': DocumentType.OEM_AUTHORIZATION, 'hash': '11a686a60d09995166244490f23a9d20c57178c1b3f6f17e33e9d8e52e46b2ec'},
        ]

        for d_info in docs_data:
            doc, _ = Document.objects.get_or_create(
                bid=bid,
                file_name=d_info['name'],
                defaults={
                    'file_type': 'application/pdf',
                    'storage_path': f"bid-documents/bids/{bid.bid_id}/{d_info['name']}",
                    'document_type': d_info['type'],
                    'sha256_hash': d_info['hash'],
                    'processing_status': ProcessingStatus.EXTRACTION_COMPLETED
                }
            )

        # 7. Extracted Fields
        fields_data = [
            ('GSTIN', '07AAACB1234F1Z5'),
            ('legal_name', 'Apex InfraTech Pvt Ltd'),
            ('PAN', 'AAACB1234F'),
            ('turnover', '₹ 72,00,00,000 (72 Cr)'),
            ('net_worth', '₹ 18,50,00,000'),
            ('financial_year', '2024-2025'),
            ('project_name', 'GAIL Pipeline Extension Phase 1'),
            ('contract_value', '₹ 41,50,00,000'),
            ('experience_company', 'XYZ Engineering Pvt Ltd'), # Mismatch trigger
            ('udyam_number', 'UDYAM-DL-03-0019283'),
            ('udyam_expiry', '2024-03-31'), # Expired trigger
            ('oem_name', 'Jindal Saw Pipes Ltd'),
            ('authorized_bidder', 'Apex InfraTech Pvt Ltd'),
        ]

        doc_ref = Document.objects.filter(bid=bid).first()
        for fname, fval in fields_data:
            DocumentField.objects.get_or_create(
                document=doc_ref,
                field_name=fname,
                defaults={'field_value': fval, 'confidence': 0.98, 'page_number': 1}
            )

        # 8. Verifications
        v_data = [
            {'field_name': 'GSTIN Registration Status', 'submitted_value': '07AAACB1234F1Z5', 'verified_value': '07AAACB1234F1Z5 (Active / Govt Verified)', 'source': 'GSTN Portal API', 'status': VerificationStatus.VERIFIED},
            {'field_name': 'PAN Active Status', 'submitted_value': 'AAACB1234F', 'verified_value': 'AAACB1234F (Valid & Operative)', 'source': 'CBDT NSDL Direct Hook', 'status': VerificationStatus.VERIFIED},
            {'field_name': 'UDIN Audit Authenticity', 'submitted_value': 'UDIN: 24098123BFAZ9012', 'verified_value': 'UDIN Registered to CA Rajesh Sharma (Valid)', 'source': 'ICAI UDIN Portal', 'status': VerificationStatus.VERIFIED},
            {'field_name': 'Udyam Certificate Expiry', 'submitted_value': 'Expired 31-Mar-2024', 'verified_value': 'Certificate Expired on Udyam Portal', 'source': 'MSME Udyam API', 'status': VerificationStatus.EXPIRED},
            {'field_name': 'Experience Entity Verification', 'submitted_value': 'XYZ Engineering Pvt Ltd', 'verified_value': 'Submitted Legal Entity is Apex InfraTech Pvt Ltd', 'source': 'MCA21 Database', 'status': VerificationStatus.MISMATCH},
            {'field_name': 'OEM Authorization Form 8-B', 'submitted_value': 'Form 8-B Signed', 'verified_value': 'OEM Seal Verification Unresolved', 'source': 'OEM Manufacturer Registry', 'status': VerificationStatus.NEEDS_REVIEW},
        ]

        for v in v_data:
            Verification.objects.get_or_create(
                bid=bid,
                field_name=v['field_name'],
                defaults=v
            )

        # 9. Cross Checks
        cross_data = [
            {'field_name': 'Legal Entity Name', 'source1': 'GST Registration Certificate', 'source2': 'PAN Card Copy', 'value1': 'Apex InfraTech Pvt Ltd', 'value2': 'Apex InfraTech Pvt Ltd', 'match_score': 100.0, 'result': 'MATCH'},
            {'field_name': 'Legal Entity Name', 'source1': 'GST Registration Certificate', 'source2': 'Experience Completion Certificate', 'value1': 'Apex InfraTech Pvt Ltd', 'value2': 'XYZ Engineering Pvt Ltd', 'match_score': 42.5, 'result': 'ENTITY_MISMATCH'},
            {'field_name': 'PAN Number', 'source1': 'PAN Card Copy', 'source2': 'Audited Financial Statement', 'value1': 'AAACB1234F', 'value2': 'AAACB1234F', 'match_score': 100.0, 'result': 'MATCH'},
        ]

        for cc in cross_data:
            CrossCheck.objects.get_or_create(
                bid=bid,
                field_name=cc['field_name'],
                source1=cc['source1'],
                source2=cc['source2'],
                defaults=cc
            )

        # 10. Compliance Results
        r01 = TenderRequirement.objects.get(requirement_id='R-01', tender=tender)
        r02 = TenderRequirement.objects.get(requirement_id='R-02', tender=tender)
        r03 = TenderRequirement.objects.get(requirement_id='R-03', tender=tender)
        r04 = TenderRequirement.objects.get(requirement_id='R-04', tender=tender)
        r05 = TenderRequirement.objects.get(requirement_id='R-05', tender=tender)
        r06 = TenderRequirement.objects.get(requirement_id='R-06', tender=tender)

        c_data = [
            {'requirement': r01, 'rule': 'turnover >= 500000000', 'input_value': '₹ 72 Crore', 'result': ComplianceOutcome.COMPLIANT, 'reason': 'Extracted turnover ₹72 Crore exceeds requirement threshold ₹50 Crore.'},
            {'requirement': r02, 'rule': 'experience_value >= 350000000 AND entity_match == TRUE', 'input_value': '₹ 41.5 Crore (Issued to XYZ Engineering)', 'result': ComplianceOutcome.INCONSISTENT, 'reason': 'Experience certificate issued under XYZ Engineering Pvt Ltd instead of bidder entity.'},
            {'requirement': r03, 'rule': 'gst_status == ACTIVE', 'input_value': '07AAACB1234F1Z5 (Active)', 'result': ComplianceOutcome.COMPLIANT, 'reason': 'GSTIN verified active on GSTN portal.'},
            {'requirement': r04, 'rule': 'pan_match == TRUE', 'input_value': 'AAACB1234F (Matching)', 'result': ComplianceOutcome.COMPLIANT, 'reason': 'PAN card matches legal name exactly.'},
            {'requirement': r05, 'rule': 'oem_auth == VALID', 'input_value': 'Form 8-B Signed', 'result': ComplianceOutcome.REQUIRES_REVIEW, 'reason': 'OEM seal requires manual verification by Procurement Officer.'},
            {'requirement': r06, 'rule': 'udyam_status == VALID', 'input_value': 'UDYAM-DL-03-0019283 (Expired 31-Mar-2024)', 'result': ComplianceOutcome.EXPIRED, 'reason': 'Udyam Certificate expired on 31-Mar-2024.'},
        ]

        for cd in c_data:
            ComplianceResult.objects.get_or_create(
                bid=bid,
                requirement=cd['requirement'],
                defaults=cd
            )

        # 11. Risk Findings
        risk_items = [
            {'finding_type': 'Entity Mismatch Detected', 'description': 'Experience Completion Certificate issued to "XYZ Engineering Pvt Ltd", creating entity mismatch.', 'affected_requirement': 'R-02 (Clause 5.3.1)', 'risk_points': 25, 'risk_level': RiskLevel.HIGH},
            {'finding_type': 'Expired MSME Certificate', 'description': 'Udyam Registration Certificate expired on 31-Mar-2024.', 'affected_requirement': 'R-06 (Clause 3.4.0)', 'risk_points': 20, 'risk_level': RiskLevel.MEDIUM},
            {'finding_type': 'OEM Seal Unverified', 'description': 'Form 8-B Manufacturer Authorization seal requires manual validation.', 'affected_requirement': 'R-05 (Clause 6.1.4)', 'risk_points': 15, 'risk_level': RiskLevel.MEDIUM},
        ]

        for rk in risk_items:
            RiskFinding.objects.get_or_create(
                bid=bid,
                finding_type=rk['finding_type'],
                affected_requirement=rk['affected_requirement'],
                defaults=rk
            )

        # 12. Recommendation
        AIRecommendation.objects.get_or_create(
            bid=bid,
            defaults={
                'overall_compliance': 66.7,
                'summary': 'Bidder satisfies Financial Turnover (R-01), GSTIN (R-03), and PAN (R-04). However, Technical Experience (R-02) exhibits an entity mismatch (XYZ Engineering Pvt Ltd), Udyam Certificate (R-06) is expired, and OEM Authorization (R-05) requires manual verification.',
                'recommended_action': 'REQUEST_CLARIFICATION'
            }
        )

        # 13. Audit Log
        AuditService.log_action('Procurement Officer', 'TENDER_CREATED', 'Tender', str(tender.id), {'tender_id': tender.tender_id})
        AuditService.log_action('System Engine', 'REQUIREMENTS_EXTRACTED', 'Tender', str(tender.id), {'count': 6})
        AuditService.log_action('Apex InfraTech Ltd', 'BID_SUBMITTED', 'Bid', str(bid.id), {'bid_id': bid.bid_id})
        AuditService.log_action('System Engine', 'VERIFICATION_COMPLETED', 'Bid', str(bid.id), {'verified_fields': 6})
        AuditService.log_action('Compliance Engine', 'COMPLIANCE_EVALUATED', 'Bid', str(bid.id), {'compliant_rules': 3, 'flagged_rules': 3})
        AuditService.log_action('Risk Engine', 'RISK_CALCULATED', 'Bid', str(bid.id), {'total_risk_score': 60, 'risk_level': 'HIGH'})

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with complete compliance dataset!'))
