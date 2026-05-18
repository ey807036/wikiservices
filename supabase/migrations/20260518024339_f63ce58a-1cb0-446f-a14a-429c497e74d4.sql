
ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS shop_logo_url text;
