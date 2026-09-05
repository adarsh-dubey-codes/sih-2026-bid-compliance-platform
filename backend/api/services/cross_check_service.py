from rapidfuzz import fuzz

class CrossCheckService:
    @staticmethod
    def perform_cross_checks(name1, name2):
        score = fuzz.ratio(name1.lower(), name2.lower())
        
        result = "MATCH" if score >= 90 else "MISMATCH"
        
        return {
            "field_name": "Corporate Entity Name Consistency",
            "source1": "Bidder Registration Record",
            "source2": "Submitted Work Experience Certificate",
            "value1": name1,
            "value2": name2,
            "match_score": round(score, 1),
            "result": result
        }
