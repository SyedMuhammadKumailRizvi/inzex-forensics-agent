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
