
CREATE TABLE public.page_permission_settings (
  page text PRIMARY KEY,
  label text,
  camera boolean NOT NULL DEFAULT false,
  microphone boolean NOT NULL DEFAULT false,
  notifications boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_permission_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_permission_settings TO authenticated;
GRANT ALL ON public.page_permission_settings TO service_role;

ALTER TABLE public.page_permission_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page permissions"
  ON public.page_permission_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert page permissions"
  ON public.page_permission_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update page permissions"
  ON public.page_permission_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete page permissions"
  ON public.page_permission_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed defaults: keep current behaviour (camera on sim-database, notifications global)
INSERT INTO public.page_permission_settings (page, label, camera, microphone, notifications) VALUES
  ('*', 'All pages (global default)', false, false, true),
  ('/sim-database', 'SIM Database page', true, false, false)
ON CONFLICT (page) DO NOTHING;
