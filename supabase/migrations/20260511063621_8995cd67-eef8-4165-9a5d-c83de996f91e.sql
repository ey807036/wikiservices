
-- Settings (single row, id=1)
CREATE TABLE public.referral_settings (
  id INT PRIMARY KEY DEFAULT 1,
  referral_reward NUMERIC NOT NULL DEFAULT 2,
  max_referrals_per_user INT NOT NULL DEFAULT 100,
  promo_code TEXT NOT NULL DEFAULT 'wikicyberexpert',
  promo_amount NUMERIC NOT NULL DEFAULT 50,
  max_promo_per_user INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.referral_settings (id) VALUES (1);
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read settings" ON public.referral_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.referral_settings FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Balances
CREATE TABLE public.user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own balance" ON public.user_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view all balances" ON public.user_balances FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins update balances" ON public.user_balances FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert balances" ON public.user_balances FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));

-- Referral submissions
CREATE TYPE public.submission_status AS ENUM ('pending','approved','rejected');
CREATE TABLE public.referral_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  note TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  reward_pkr NUMERIC NOT NULL DEFAULT 0,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.referral_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own submissions" ON public.referral_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own submissions" ON public.referral_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins view all submissions" ON public.referral_submissions FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins update submissions" ON public.referral_submissions FOR UPDATE USING (has_role(auth.uid(),'admin'));

-- Promo redemptions
CREATE TABLE public.promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own redemptions" ON public.promo_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view redemptions" ON public.promo_redemptions FOR SELECT USING (has_role(auth.uid(),'admin'));

-- RPC: redeem promo code (security definer; checks limits and credits balance atomically)
CREATE OR REPLACE FUNCTION public.redeem_promo(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.referral_settings;
  uid UUID := auth.uid();
  use_count INT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Login required');
  END IF;
  SELECT * INTO s FROM public.referral_settings WHERE id = 1;
  IF lower(_code) <> lower(s.promo_code) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid promo code');
  END IF;
  SELECT COUNT(*) INTO use_count FROM public.promo_redemptions WHERE user_id = uid AND code = lower(s.promo_code);
  IF use_count >= s.max_promo_per_user THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Promo already used');
  END IF;
  INSERT INTO public.promo_redemptions (user_id, code, amount) VALUES (uid, lower(s.promo_code), s.promo_amount);
  INSERT INTO public.user_balances (user_id, balance) VALUES (uid, s.promo_amount)
    ON CONFLICT (user_id) DO UPDATE SET balance = public.user_balances.balance + EXCLUDED.balance, updated_at = now();
  RETURN jsonb_build_object('ok', true, 'amount', s.promo_amount);
END; $$;

-- Trigger: when admin approves a submission, credit balance (respecting per-user max)
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.referral_settings;
  approved_count INT;
  reward NUMERIC;
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    SELECT * INTO s FROM public.referral_settings WHERE id = 1;
    SELECT COUNT(*) INTO approved_count FROM public.referral_submissions
      WHERE user_id = NEW.user_id AND status = 'approved' AND id <> NEW.id;
    IF approved_count >= s.max_referrals_per_user THEN
      RAISE EXCEPTION 'User has reached the max referrals limit (%).', s.max_referrals_per_user;
    END IF;
    reward := COALESCE(NULLIF(NEW.reward_pkr,0), s.referral_reward);
    NEW.reward_pkr := reward;
    NEW.reviewed_at := now();
    INSERT INTO public.user_balances (user_id, balance) VALUES (NEW.user_id, reward)
      ON CONFLICT (user_id) DO UPDATE SET balance = public.user_balances.balance + EXCLUDED.balance, updated_at = now();
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_submission_approval
BEFORE UPDATE ON public.referral_submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_submission_approval();

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('referral-screenshots','referral-screenshots', true);
CREATE POLICY "screenshots public read" ON storage.objects FOR SELECT USING (bucket_id = 'referral-screenshots');
CREATE POLICY "auth users upload screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'referral-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
