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
