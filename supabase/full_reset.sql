-- 1. Clean up old tables (Be careful if you have production data!)
DROP TABLE IF EXISTS public.findings CASCADE;
DROP TABLE IF EXISTS public.evidence CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TYPE IF EXISTS os_hint_enum CASCADE;
DROP TYPE IF EXISTS case_status_enum CASCADE;
DROP TYPE IF EXISTS upload_status_enum CASCADE;
DROP TYPE IF EXISTS finding_severity_enum CASCADE;
-- 2. Create Enums
CREATE TYPE os_hint_enum AS ENUM ('windows', 'linux', 'mac');
CREATE TYPE case_status_enum AS ENUM ('pending', 'analyzing', 'completed');
CREATE TYPE upload_status_enum AS ENUM ('uploading', 'complete', 'failed');
CREATE TYPE finding_severity_enum AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Info');
-- 3. Create Tables
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_designation TEXT NOT NULL,
    reference_id TEXT,
    lead_investigator UUID REFERENCES auth.users(id), 
    os_hint os_hint_enum,
    status case_status_enum DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    upload_status upload_status_enum DEFAULT 'uploading',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    plugin_name TEXT NOT NULL,
    mitre_technique TEXT,
    severity finding_severity_enum,
    ai_rationale TEXT,
    volatility_raw_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 4. Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Allow authenticated users to insert/read)
CREATE POLICY "Enable insert for authenticated users only" ON public.cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable read access for authenticated users" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable update for authenticated users" ON public.cases FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.evidence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable read access for authenticated users" ON public.evidence FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.findings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable read access for authenticated users" ON public.findings FOR SELECT TO authenticated USING (true);
-- Create the finding status enum
CREATE TYPE finding_status_enum AS ENUM ('pending', 'approved', 'rejected', 'rechecking');

-- Add columns to findings table
ALTER TABLE public.findings 
ADD COLUMN status finding_status_enum DEFAULT 'pending',
ADD COLUMN human_feedback TEXT;
-- Relax RLS for hackathon demo to allow anonymous access without needing a full login flow
CREATE POLICY "Enable insert for anon users" ON public.cases FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable read access for anon users" ON public.cases FOR SELECT TO anon USING (true);
CREATE POLICY "Enable update for anon users" ON public.cases FOR UPDATE TO anon USING (true);

CREATE POLICY "Enable insert for anon users" ON public.evidence FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable read access for anon users" ON public.evidence FOR SELECT TO anon USING (true);
CREATE POLICY "Enable update for anon users" ON public.evidence FOR UPDATE TO anon USING (true);

CREATE POLICY "Enable insert for anon users" ON public.findings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable read access for anon users" ON public.findings FOR SELECT TO anon USING (true);
CREATE POLICY "Enable update for anon users" ON public.findings FOR UPDATE TO anon USING (true);
