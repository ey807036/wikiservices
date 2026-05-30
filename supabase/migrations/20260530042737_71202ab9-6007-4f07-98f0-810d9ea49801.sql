ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS store1_theme TEXT NOT NULL DEFAULT 'matrix',
  ADD COLUMN IF NOT EXISTS store2_theme TEXT NOT NULL DEFAULT 'matrix';

UPDATE public.site_settings
  SET store1_theme = COALESCE(NULLIF(store1_theme, ''), theme, 'matrix'),
      store2_theme = COALESCE(NULLIF(store2_theme, ''), theme, 'matrix')
  WHERE id = 1;