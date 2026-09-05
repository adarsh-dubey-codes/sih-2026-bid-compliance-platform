-- ====================================================================
-- PROOFSTACK / BID VISHWAS — SUPABASE POSTGRESQL PRODUCTION MIGRATION
-- ====================================================================

-- 1. Create Profiles Table (Referencing auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'PROCUREMENT_OFFICER', 'BIDDER', 'AUDITOR')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Government User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'PROCUREMENT_OFFICER')
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tenders Table
CREATE TABLE IF NOT EXISTS public.tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_ref TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Ministry of Petroleum & Natural Gas / GAIL',
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    closing_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNDER_REVIEW', 'EVALUATED', 'CLOSED')) DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Requirements Table
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    clause_no TEXT NOT NULL,
    category TEXT NOT NULL,
    requirement_text TEXT NOT NULL,
    mandatory BOOLEAN DEFAULT TRUE,
    compliance_rule TEXT NOT NULL
);

-- 4. Bidders Table
CREATE TABLE IF NOT EXISTS public.bidders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name TEXT NOT NULL,
    gstin TEXT UNIQUE NOT NULL,
    pan TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID REFERENCES public.bidders(id) ON DELETE SET NULL,
    tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    document_type TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Verification Results Table
CREATE TABLE IF NOT EXISTS public.verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED', 'NOT_FOUND', 'EXPIRED', 'MISMATCH', 'NEEDS_REVIEW')),
    source TEXT NOT NULL,
    remarks TEXT
);

-- 7. Compliance Results Table
CREATE TABLE IF NOT EXISTS public.compliance_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES public.bidders(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('COMPLIANT', 'NON_COMPLIANT', 'MISSING', 'EXPIRED', 'INCONSISTENT', 'REQUIRES_REVIEW')),
    evidence TEXT,
    remarks TEXT
);

-- 8. Risk Findings Table
CREATE TABLE IF NOT EXISTS public.risk_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID REFERENCES public.bidders(id) ON DELETE CASCADE,
    risk_score INT DEFAULT 15,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reason TEXT NOT NULL
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PHASE 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bidders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, but edit only their own
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tenders & Requirements: Public read, authenticated creation
CREATE POLICY "Allow read tenders" ON public.tenders FOR SELECT USING (true);
CREATE POLICY "Allow insert tenders" ON public.tenders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow read requirements" ON public.requirements FOR SELECT USING (true);
CREATE POLICY "Allow insert requirements" ON public.requirements FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bidders & Documents: Read & write for authenticated users
CREATE POLICY "Allow read bidders" ON public.bidders FOR SELECT USING (true);
CREATE POLICY "Allow insert bidders" ON public.bidders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow insert documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verifications, Compliance, Risk, Audit: Read & insert
CREATE POLICY "Allow read verification" ON public.verification_results FOR SELECT USING (true);
CREATE POLICY "Allow read compliance" ON public.compliance_results FOR SELECT USING (true);
CREATE POLICY "Allow read risk" ON public.risk_findings FOR SELECT USING (true);
CREATE POLICY "Allow read audit" ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "Allow insert verification" ON public.verification_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert compliance" ON public.compliance_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert risk" ON public.risk_findings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert audit" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- PHASE 3 STORAGE BUCKETS SETUP
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('tender-documents', 'tender-documents', true),
    ('bidder-documents', 'bidder-documents', true),
    ('bid-documents', 'bid-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket Policies
CREATE POLICY "Public Storage Select" ON storage.objects FOR SELECT USING (bucket_id IN ('tender-documents', 'bidder-documents', 'bid-documents'));
CREATE POLICY "Authenticated Storage Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('tender-documents', 'bidder-documents', 'bid-documents'));
