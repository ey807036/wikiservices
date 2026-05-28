ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS sim_database_logo_url text;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.home_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.home_items TO authenticated;
GRANT ALL ON public.home_items TO service_role;