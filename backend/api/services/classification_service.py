import re

class DocumentClassificationService:
    @staticmethod
    def classify_document(file_name, extracted_text=""):
        name = file_name.upper()
        text = extracted_text.upper()

        if "GST" in name or "GSTIN" in text or "REG-06" in text:
            return "GST_CERTIFICATE"
        elif "PAN" in name or "INCOME TAX DEPARTMENT" in text or "PERMANENT ACCOUNT NUMBER" in text:
            return "PAN"
        elif "AUDIT" in name or "TURNOVER" in name or "BALANCE SHEET" in text or "UDIN" in text:
            return "AUDITED_FINANCIAL_STATEMENT"
        elif "EXPERIENCE" in name or "EXECUTION" in name or "COMPLETION MEMORANDUM" in text or "WORK COMPLETION" in text:
            return "EXPERIENCE_CERTIFICATE"
        elif "OEM" in name or "MANUFACTURER" in name or "FORM 8-B" in text or "API-6D" in text:
            return "OEM_AUTHORIZATION"
        elif "UDYAM" in name or "MSME" in name or "MICRO, SMALL" in text:
            return "UDYAM"
        elif "WORK_ORDER" in name or "PURCHASE ORDER" in text:
            return "WORK_ORDER"
        else:
            return "OTHER"
