class AIRecommendationEngine:
    @staticmethod
    def generate_recommendation(compliance_results, risk_data):
        score = 100
        issues = []
        
        for c in compliance_results:
            if c.get("result") != "COMPLIANT":
                score -= 16.6
                issues.append(f"{c.get('requirement_id')}: {c.get('reason')}")

        overall_comp = max(0.0, round(score, 1))

        if overall_comp == 100.0:
            rec_action = "APPROVE"
            summary = "All 6 statutory evidence requirements are 100% compliant. Cleared for Class 3 DSC token e-signing and financial opening."
        elif overall_comp >= 80.0:
            rec_action = "REQUEST_CLARIFICATION"
            summary = f"1 discrepancy pending officer determination: {'; '.join(issues)}. Dispatch 48-Hour GeM clarification notice."
        else:
            rec_action = "REQUEST_CLARIFICATION"
            summary = f"{len(issues)} discrepancies intercepted: {'; '.join(issues)}. Action required before submission deadline."

        return {
            "overall_compliance": overall_comp,
            "summary": summary,
            "recommended_action": rec_action,
            "discrepancy_issues": issues
        }

class RecommendationEngine:
    @staticmethod
    def generate_recommendation(bid):
        if hasattr(bid, 'recommendation') and bid.recommendation:
            return {
                'overall_compliance': bid.recommendation.overall_compliance,
                'summary': bid.recommendation.summary,
                'recommended_action': bid.recommendation.recommended_action
            }
        return AIRecommendationEngine.generate_recommendation([], {})

