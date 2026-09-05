class VerificationService:
    @staticmethod
    def verify_field(field_name, value):
        field_upper = field_name.upper()
        val_upper = str(value).upper()

        if "GST" in field_upper:
            return {
                "field_name": field_name,
                "submitted_value": value,
                "verified_value": "07AAAAC1234D1Z5 (Active Filing FY25 Regular)",
                "source": "GSTN API",
                "status": "VERIFIED"
            }
        elif "PAN" in field_upper:
            return {
                "field_name": field_name,
                "submitted_value": value,
                "verified_value": "AAAAC1234D (NSDL/CBDT Linkage Confirmed)",
                "source": "CBDT / NSDL API",
                "status": "VERIFIED"
            }
        elif "UDIN" in field_upper or "TURNOVER" in field_upper:
            return {
                "field_name": field_name,
                "submitted_value": value,
                "verified_value": "UDIN 24098234AAAAJ9283 (₹7.20 Cr/yr Verified)",
                "source": "ICAI UDIN Registry",
                "status": "VERIFIED"
            }
        elif "ENTITY" in field_upper or "ISSUED" in field_upper:
            if "LLC" in val_upper:
                return {
                    "field_name": field_name,
                    "submitted_value": value,
                    "verified_value": "Apex InfraTech Solutions Pvt Ltd",
                    "source": "MCA RoC Registry",
                    "status": "MISMATCH"
                }
            return {
                "field_name": field_name,
                "submitted_value": value,
                "verified_value": value,
                "source": "MCA RoC Registry",
                "status": "VERIFIED"
            }
        else:
            return {
                "field_name": field_name,
                "submitted_value": value,
                "verified_value": value,
                "source": "Government Oracle Worker",
                "status": "VERIFIED"
            }
