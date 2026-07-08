
GRANT SELECT, INSERT, UPDATE ON public.push_subscriptions TO anon, authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
GRANT SELECT ON public.push_notifications_log TO authenticated;
GRANT ALL ON public.push_notifications_log TO service_role;
