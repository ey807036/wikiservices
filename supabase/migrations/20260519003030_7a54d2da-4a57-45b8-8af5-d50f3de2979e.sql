-- Restrict role-check policies to signed-in users so public product reads do not evaluate admin helpers
ALTER POLICY "Admins manage categories" ON public.categories TO authenticated;
ALTER POLICY coupons_admin_all ON public.coupons TO authenticated;
ALTER POLICY "admins manage lucky entries" ON public.lucky_entries TO authenticated;
ALTER POLICY "admins manage lucky settings" ON public.lucky_settings TO authenticated;
ALTER POLICY "admins manage winners" ON public.lucky_winners TO authenticated;
ALTER POLICY "Admins manage orders" ON public.orders TO authenticated;
ALTER POLICY "Admins view all orders" ON public.orders TO authenticated;
ALTER POLICY "Admins manage products" ON public.products TO authenticated;
ALTER POLICY "Admins view all products" ON public.products TO authenticated;
ALTER POLICY "Admins view all profiles" ON public.profiles TO authenticated;
ALTER POLICY "admins manage settings" ON public.referral_settings TO authenticated;
ALTER POLICY "admins update submissions" ON public.referral_submissions TO authenticated;
ALTER POLICY "admins view all submissions" ON public.referral_submissions TO authenticated;
ALTER POLICY "admins manage announcements" ON public.site_announcements TO authenticated;
ALTER POLICY "Admins manage site settings" ON public.site_settings TO authenticated;
ALTER POLICY "admins manage store categories" ON public.store_categories TO authenticated;
ALTER POLICY "admins manage store orders" ON public.store_orders TO authenticated;
ALTER POLICY "admins manage store products" ON public.store_products TO authenticated;
ALTER POLICY "admins insert balances" ON public.user_balances TO authenticated;
ALTER POLICY "admins update balances" ON public.user_balances TO authenticated;
ALTER POLICY "admins view all balances" ON public.user_balances TO authenticated;
ALTER POLICY "Admins manage roles" ON public.user_roles TO authenticated;
ALTER POLICY "Admins view all roles" ON public.user_roles TO authenticated;
ALTER POLICY "admins manage withdrawals" ON public.withdrawal_requests TO authenticated;

-- Helper functions: no anonymous direct execution; signed-in users can use role checks needed by RLS.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_submission_approval() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_promo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_promo(text) TO authenticated;
