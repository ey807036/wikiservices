
CREATE TABLE IF NOT EXISTS public.checker_settings (
  id integer PRIMARY KEY DEFAULT 1,
  title text NOT NULL DEFAULT 'Wiki Checker',
  subtitle text NOT NULL DEFAULT 'Bulk OTP account checker',
  hero_image_url text,
  logo_url text,
  base_url text NOT NULL DEFAULT 'http://51.210.208.26/ints',
  enabled boolean NOT NULL DEFAULT true,
  delay_ms integer NOT NULL DEFAULT 800,
  timeout_ms integer NOT NULL DEFAULT 25000,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checker_settings_single CHECK (id = 1)
);

GRANT SELECT ON public.checker_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.checker_settings TO authenticated;
GRANT ALL ON public.checker_settings TO service_role;

ALTER TABLE public.checker_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checker_settings public read"
  ON public.checker_settings FOR SELECT
  USING (true);

CREATE POLICY "checker_settings admin write"
  ON public.checker_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.checker_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
