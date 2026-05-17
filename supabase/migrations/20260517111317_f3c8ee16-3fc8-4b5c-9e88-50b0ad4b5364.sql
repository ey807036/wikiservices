ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS lucky_logo_url text,
  ADD COLUMN IF NOT EXISTS store_logo_url text;