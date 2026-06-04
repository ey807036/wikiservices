
-- Drop old FIA prep tables
DROP TABLE IF EXISTS public.fia_questions CASCADE;
DROP TABLE IF EXISTS public.fia_subjects CASCADE;
DROP TABLE IF EXISTS public.fia_posts CASCADE;

-- FIA Categories (e.g. FIA, PPSC, FPSC, NTS, ASF, Police)
CREATE TABLE public.fia_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT 'Preparation',
  description text NOT NULL DEFAULT '',
  accent_color text NOT NULL DEFAULT '#22d3ee',
  icon_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fia_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fia_categories TO authenticated;
GRANT ALL ON public.fia_categories TO service_role;
ALTER TABLE public.fia_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view fia_categories" ON public.fia_categories FOR SELECT USING (true);
CREATE POLICY "admins insert fia_categories" ON public.fia_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update fia_categories" ON public.fia_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete fia_categories" ON public.fia_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_fia_categories_updated BEFORE UPDATE ON public.fia_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FIA MCQs
CREATE TABLE public.fia_mcqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.fia_categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index int NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fia_mcqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fia_mcqs TO authenticated;
GRANT ALL ON public.fia_mcqs TO service_role;
ALTER TABLE public.fia_mcqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view fia_mcqs" ON public.fia_mcqs FOR SELECT USING (true);
CREATE POLICY "admins insert fia_mcqs" ON public.fia_mcqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update fia_mcqs" ON public.fia_mcqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete fia_mcqs" ON public.fia_mcqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_fia_mcqs_category ON public.fia_mcqs(category_id);
CREATE TRIGGER trg_fia_mcqs_updated BEFORE UPDATE ON public.fia_mcqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FIA Posts (with images, videos)
CREATE TABLE public.fia_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  videos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fia_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fia_posts TO authenticated;
GRANT ALL ON public.fia_posts TO service_role;
ALTER TABLE public.fia_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view fia_posts" ON public.fia_posts FOR SELECT USING (true);
CREATE POLICY "admins insert fia_posts" ON public.fia_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update fia_posts" ON public.fia_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete fia_posts" ON public.fia_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_fia_posts_updated BEFORE UPDATE ON public.fia_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add FIA settings columns
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS fia_main_logo_url text,
  ADD COLUMN IF NOT EXISTS fia_secondary_logo_url text,
  ADD COLUMN IF NOT EXISTS fia_header_brand text NOT NULL DEFAULT 'FIA · WIKI',
  ADD COLUMN IF NOT EXISTS fia_hero_title text NOT NULL DEFAULT 'WIKI PREP',
  ADD COLUMN IF NOT EXISTS fia_hero_subtitle text NOT NULL DEFAULT 'Your Success Starts Here',
  ADD COLUMN IF NOT EXISTS fia_hero_tagline text NOT NULL DEFAULT 'Best platform for FIA, FPSC, PPSC, NTS and all other competitive exam preparation.',
  ADD COLUMN IF NOT EXISTS fia_brand_title text NOT NULL DEFAULT 'FIA PREPARATION',
  ADD COLUMN IF NOT EXISTS fia_brand_byline text NOT NULL DEFAULT 'BY WIKI',
  ADD COLUMN IF NOT EXISTS fia_footer_text text NOT NULL DEFAULT '© 2026 FIA Preparation by Wiki. All rights reserved.';

-- Seed default categories
INSERT INTO public.fia_categories (slug, name, description, accent_color, sort_order) VALUES
  ('fia',    'FIA',    'All FIA Posts MCQs',     '#22d3ee', 1),
  ('ppsc',   'PPSC',   'PPSC Past Papers MCQs',  '#22c55e', 2),
  ('fpsc',   'FPSC',   'FPSC Past Papers MCQs',  '#f59e0b', 3),
  ('nts',    'NTS',    'NTS Past Papers MCQs',   '#ec4899', 4),
  ('asf',    'ASF',    'ASF Past Papers MCQs',   '#a855f7', 5),
  ('police', 'Police', 'Police Past Papers MCQs','#06b6d4', 6)
ON CONFLICT (slug) DO NOTHING;

-- Storage policies for fia-assets bucket (bucket created via tool)
CREATE POLICY "fia-assets public read" ON storage.objects FOR SELECT USING (bucket_id = 'fia-assets');
CREATE POLICY "fia-assets admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fia-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "fia-assets admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'fia-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "fia-assets admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'fia-assets' AND public.has_role(auth.uid(), 'admin'));
