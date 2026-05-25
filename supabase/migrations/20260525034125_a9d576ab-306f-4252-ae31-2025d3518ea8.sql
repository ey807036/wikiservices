
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS shop_hero_tag text DEFAULT 'UNDERGROUND WIKI STORE 💀',
  ADD COLUMN IF NOT EXISTS shop_hero_title text DEFAULT 'Jammers & Hacking Devices',
  ADD COLUMN IF NOT EXISTS shop_hero_subtitle text DEFAULT 'Jam · Hijack · Control Anything',
  ADD COLUMN IF NOT EXISTS shop_store_name text DEFAULT 'Wiki Store 1',
  ADD COLUMN IF NOT EXISTS lucky_title text DEFAULT '1 Rupee Lucky Draw 💰',
  ADD COLUMN IF NOT EXISTS lucky_subtitle text DEFAULT 'Sirf Rs.1 invest karein — har raat 10 baje Quran-andazi, aik lucky user ko sara paisa mil jaye ga.';
