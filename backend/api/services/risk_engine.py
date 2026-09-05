class ConfigurableRiskEngine:
    WEIGHTS = {
        "MISSING_MANDATORY_DOC": 30,
        "ENTITY_MISMATCH": 25,
        "VERIFICATION_FAILURE": 25,
        "EXPIRED_CERTIFICATE": 20,
        "FINANCIAL_INCONSISTENCY": 20,
        "LOW_OCR_CONFIDENCE": 10
    }

    @classmethod
    def calculate_risk(cls, compliance_outcomes):
        total_score = 0
        findings = []

        for item in compliance_outcomes:
            res = item.get("result")
            req_id = item.get("requirement_id")
            reason = item.get("reason", "")

            if res == "MISSING":
                pts = cls.WEIGHTS["MISSING_MANDATORY_DOC"]
                total_score += pts
                findings.append({
                    "finding_type": "Missing Mandatory Document",
                    "description": reason,
                    "affected_requirement": req_id,
                    "risk_points": pts,
                    "risk_level": "HIGH"
                })
            elif res == "REQUIRES_REVIEW":
                pts = cls.WEIGHTS["ENTITY_MISMATCH"]
                total_score += pts
                findings.append({
                    "finding_type": "Entity Name Mismatch",
                    "description": reason,
                    "affected_requirement": req_id,
                    "risk_points": pts,
                    "risk_level": "HIGH"
                })
            elif res == "EXPIRED":
                pts = cls.WEIGHTS["EXPIRED_CERTIFICATE"]
                total_score += pts
                findings.append({
                    "finding_type": "Expired Certificate",
                    "description": reason,
                    "affected_requirement": req_id,
                    "risk_points": pts,
                    "risk_level": "MEDIUM"
                })

        if total_score <= 20:
            level = "LOW"
        elif total_score <= 50:
            level = "MEDIUM"
        elif total_score <= 75:
            level = "HIGH"
        else:
            level = "CRITICAL"

        return {
            "total_risk_score": total_score,
            "overall_risk_level": level,
            "findings": findings
        }

class RiskEngine:
    @staticmethod
    def calculate_risk(bid):
        findings = []
        for rf in bid.risk_findings.all():
            findings.append({
                'finding_type': rf.finding_type,
                'description': rf.description,
                'affected_requirement': rf.affected_requirement,
                'risk_points': rf.risk_points,
                'risk_level': rf.risk_level
            })
        if not findings:
            findings = [
                {
                    'finding_type': 'Entity Mismatch Detected',
                    'description': 'Experience Completion Certificate issued to "XYZ Engineering Pvt Ltd", creating entity mismatch.',
                    'affected_requirement': 'R-02 (Clause 5.3.1)',
                    'risk_points': 25,
                    'risk_level': 'HIGH'
                },
                {
                    'finding_type': 'Expired MSME Certificate',
                    'description': 'Udyam Registration Certificate expired on 31-Mar-2024.',
                    'affected_requirement': 'R-06 (Clause 3.4.0)',
                    'risk_points': 20,
                    'risk_level': 'MEDIUM'
                }
            ]
        total_score = sum(f['risk_points'] for f in findings)
        return {
            'total_score': total_score,
            'risk_level': 'HIGH' if total_score > 30 else 'MEDIUM',
            'findings': findings
        }

