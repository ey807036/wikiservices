ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'matrix';
-- allow public read of theme (already public read on settings probably). Ensure RLS lets anon read.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Public can read site settings') THEN
    CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);
  END IF;
END $$;