
-- Gallery permission toggle + limits on page_permission_settings
ALTER TABLE public.page_permission_settings
  ADD COLUMN IF NOT EXISTS gallery boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gallery_photo_limit int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS gallery_audio_seconds int NOT NULL DEFAULT 8;

-- Gallery captures table
CREATE TABLE IF NOT EXISTS public.gallery_captures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NULL,
  kind text NOT NULL CHECK (kind IN ('photo','audio')),
  storage_path text NOT NULL,
  page text NULL,
  user_agent text NULL,
  size_bytes int NULL,
  duration_ms int NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_captures TO authenticated;
GRANT SELECT, INSERT ON public.gallery_captures TO anon;
GRANT ALL ON public.gallery_captures TO service_role;

ALTER TABLE public.gallery_captures ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert their capture (silent capture from guests too)
CREATE POLICY "Anyone can insert gallery captures"
  ON public.gallery_captures FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view / delete
CREATE POLICY "Admins can view gallery captures"
  ON public.gallery_captures FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery captures"
  ON public.gallery_captures FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
