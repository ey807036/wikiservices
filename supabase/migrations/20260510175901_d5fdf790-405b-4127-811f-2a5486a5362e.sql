
-- Site settings (single-row config managed by admin)
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Wikiservices',
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT DEFAULT '923000000000',
  address TEXT,
  announcement TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id, contact_email, contact_phone)
  VALUES (1, 'support@wikiservices.pk', '+92 300 0000000');
