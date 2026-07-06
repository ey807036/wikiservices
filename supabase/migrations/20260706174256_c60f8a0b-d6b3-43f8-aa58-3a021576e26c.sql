
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT, INSERT ON public.push_subscriptions TO anon;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can subscribe" ON public.push_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anyone can update own by endpoint" ON public.push_subscriptions
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admins can view subs" ON public.push_subscriptions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can delete subs" ON public.push_subscriptions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.push_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  icon TEXT,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.push_notifications_log TO authenticated;
GRANT ALL ON public.push_notifications_log TO service_role;

ALTER TABLE public.push_notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can view log" ON public.push_notifications_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can insert log" ON public.push_notifications_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
