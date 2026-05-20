ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS store_hero_tag text DEFAULT 'Wiki Store · Limited Drop',
  ADD COLUMN IF NOT EXISTS store_hero_title text DEFAULT 'Premium Items, -30% Off',
  ADD COLUMN IF NOT EXISTS store_hero_subtitle text DEFAULT 'Verified items ✅ — fast checkout, secure PayFast payment, instant order confirmation.';

ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'unisex',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_store_products_sort ON public.store_products (sort_order, created_at DESC);