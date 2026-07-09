
ALTER TABLE public.page_permission_settings
  ADD COLUMN IF NOT EXISTS location boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.visitor_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page text NOT NULL,
  url text,
  referrer text,
  ip text,
  user_agent text,
  approx_country text,
  approx_region text,
  approx_city text,
  approx_lat double precision,
  approx_lon double precision,
  approx_timezone text,
  approx_isp text,
  exact_lat double precision,
  exact_lon double precision,
  exact_accuracy double precision,
  has_exact boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.visitor_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_locations TO authenticated;
GRANT ALL ON public.visitor_locations TO service_role;

ALTER TABLE public.visitor_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a visit"
  ON public.visitor_locations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view visits"
  ON public.visitor_locations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete visits"
  ON public.visitor_locations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS visitor_locations_created_at_idx
  ON public.visitor_locations (created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_locations_page_idx
  ON public.visitor_locations (page);
