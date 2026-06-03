
-- FIA POSTS
CREATE TABLE public.fia_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  accent_color text NOT NULL DEFAULT '#22d3ee',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fia_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fia_posts TO authenticated;
GRANT ALL ON public.fia_posts TO service_role;
ALTER TABLE public.fia_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view active fia posts" ON public.fia_posts FOR SELECT USING (active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage fia posts" ON public.fia_posts FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- FIA SUBJECTS
CREATE TABLE public.fia_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.fia_posts(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, slug)
);
CREATE INDEX idx_fia_subjects_post ON public.fia_subjects(post_id);
GRANT SELECT ON public.fia_subjects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fia_subjects TO authenticated;
GRANT ALL ON public.fia_subjects TO service_role;
ALTER TABLE public.fia_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view active fia subjects" ON public.fia_subjects FOR SELECT USING (active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage fia subjects" ON public.fia_subjects FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- FIA QUESTIONS
CREATE TABLE public.fia_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.fia_subjects(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fia_questions_subject ON public.fia_questions(subject_id);
GRANT SELECT ON public.fia_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fia_questions TO authenticated;
GRANT ALL ON public.fia_questions TO service_role;
ALTER TABLE public.fia_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view fia questions" ON public.fia_questions FOR SELECT USING (true);
CREATE POLICY "admins manage fia questions" ON public.fia_questions FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- SITE SETTINGS: add FIA logo fields
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS fia_logo_url text,
  ADD COLUMN IF NOT EXISTS fia_badge_url text;

-- SEED POSTS
INSERT INTO public.fia_posts (slug, name, description, accent_color, sort_order) VALUES
  ('constable',     'Constable',     'Basic constable level preparation', '#22c55e', 1),
  ('udc',           'UDC',           'Upper Division Clerk preparation',  '#06b6d4', 2),
  ('ldc',           'LDC',           'Lower Division Clerk preparation',  '#a855f7', 3),
  ('assistant',     'Assistant',     'Assistant level preparation',       '#f59e0b', 4),
  ('asi',           'ASI',           'Assistant Sub Inspector preparation','#ef4444', 5),
  ('sub-inspector', 'Sub Inspector', 'Sub Inspector level preparation',   '#ec4899', 6);

-- SEED SUBJECTS for each post (matching user's tree)
-- Constable
INSERT INTO public.fia_subjects (post_id, slug, name, sort_order)
SELECT id, x.slug, x.name, x.so FROM public.fia_posts p,
  (VALUES ('english','English',1),('gk','General Knowledge',2),('islamiat','Islamiat',3),('pak-affairs','Pakistan Affairs',4),('math','Mathematics',5),('intelligence','Intelligence Test',6)) AS x(slug,name,so)
WHERE p.slug='constable';

-- UDC
INSERT INTO public.fia_subjects (post_id, slug, name, sort_order)
SELECT id, x.slug, x.name, x.so FROM public.fia_posts p,
  (VALUES ('english','English Grammar',1),('computer','Computer Basics',2),('gk','General Knowledge',3),('math','Mathematics',4),('office','Office Knowledge',5)) AS x(slug,name,so)
WHERE p.slug='udc';

-- LDC
INSERT INTO public.fia_subjects (post_id, slug, name, sort_order)
SELECT id, x.slug, x.name, x.so FROM public.fia_posts p,
  (VALUES ('english','English',1),('computer','Computer Basics',2),('typing','Typing Knowledge',3),('gk','General Knowledge',4),('math','Mathematics',5)) AS x(slug,name,so)
WHERE p.slug='ldc';

-- Assistant
INSERT INTO public.fia_subjects (post_id, slug, name, sort_order)
SELECT id, x.slug, x.name, x.so FROM public.fia_posts p,
  (VALUES ('english','English',1),('current-affairs','Current Affairs',2),('gk','General Knowledge',3),('computer','Computer',4),('pak-affairs','Pakistan Affairs',5),('reasoning','Analytical Reasoning',6)) AS x(slug,name,so)
WHERE p.slug='assistant';

-- ASI
INSERT INTO public.fia_subjects (post_id, slug, name, sort_order)
SELECT id, x.slug, x.name, x.so FROM public.fia_posts p,
  (VALUES ('english','English',1),('current-affairs','Current Affairs',2),('gk','General Knowledge',3),('pak-affairs','Pakistan Affairs',4),('computer','Computer Basics',5),('intelligence','Intelligence Test',6)) AS x(slug,name,so)
WHERE p.slug='asi';

-- Sub Inspector
INSERT INTO public.fia_subjects (post_id, slug, name, sort_order)
SELECT id, x.slug, x.name, x.so FROM public.fia_posts p,
  (VALUES ('english','Advanced English',1),('current-affairs','Current Affairs',2),('gk','General Knowledge',3),('pak-affairs','Pakistan Affairs',4),('reasoning','Analytical Reasoning',5),('law','Investigation & Law Basics',6)) AS x(slug,name,so)
WHERE p.slug='sub-inspector';
