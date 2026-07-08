-- 1. Clean up old tables (Be careful if you have production data!)
DROP TABLE IF EXISTS public.findings CASCADE;
DROP TABLE IF EXISTS public.evidence CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TYPE IF EXISTS os_hint_enum CASCADE;
DROP TYPE IF EXISTS case_status_enum CASCADE;
DROP TYPE IF EXISTS upload_status_enum CASCADE;
DROP TYPE IF EXISTS finding_severity_enum CASCADE;
