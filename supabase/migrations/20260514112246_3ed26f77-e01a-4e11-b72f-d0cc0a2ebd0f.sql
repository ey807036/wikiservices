
-- ============= LUCKY DRAW =============
CREATE TABLE public.lucky_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  amount NUMERIC NOT NULL DEFAULT 1,
  basket_id TEXT NOT NULL UNIQUE,
  draw_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Karachi')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lucky_entries_draw_date ON public.lucky_entries(draw_date);
CREATE INDEX idx_lucky_entries_user_id ON public.lucky_entries(user_id);
ALTER TABLE public.lucky_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone view lucky entries" ON public.lucky_entries FOR SELECT USING (true);
CREATE POLICY "users insert own lucky entries" ON public.lucky_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage lucky entries" ON public.lucky_entries FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.lucky_settings (
  id INT PRIMARY KEY DEFAULT 1,
  prize_amount INT NOT NULL DEFAULT 2 CHECK (prize_amount IN (2,5,10)),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lucky_settings_singleton CHECK (id = 1)
);
INSERT INTO public.lucky_settings (id, prize_amount) VALUES (1, 2);
ALTER TABLE public.lucky_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view lucky settings" ON public.lucky_settings FOR SELECT USING (true);
CREATE POLICY "admins manage lucky settings" ON public.lucky_settings FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.lucky_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL UNIQUE,
  entry_id UUID NOT NULL REFERENCES public.lucky_entries(id) ON DELETE CASCADE,
  user_id UUID,
  prize_amount NUMERIC NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lucky_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view winners" ON public.lucky_winners FOR SELECT USING (true);
CREATE POLICY "admins manage winners" ON public.lucky_winners FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.lucky_winners(id) ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('easypaisa','jazzcash','bank')),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own withdrawals" ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users insert own withdrawals" ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage withdrawals" ON public.withdrawal_requests FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_withdrawal_updated BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= SITE ANNOUNCEMENT =============
CREATE TABLE public.site_announcements (
  id INT PRIMARY KEY DEFAULT 1,
  message TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_announcements_singleton CHECK (id = 1)
);
INSERT INTO public.site_announcements (id, message, active) VALUES (1, '', false);
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view announcements" ON public.site_announcements FOR SELECT USING (true);
CREATE POLICY "admins manage announcements" ON public.site_announcements FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============= WIKI STORE =============
CREATE TABLE public.store_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view store categories" ON public.store_categories FOR SELECT USING (true);
CREATE POLICY "admins manage store categories" ON public.store_categories FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
INSERT INTO public.store_categories (name, slug, sort_order) VALUES
  ('Dress', 'dress', 1),
  ('Co-Ord Set', 'co-ord-set', 2),
  ('Collar Shirt', 'collar-shirt', 3),
  ('Accessories', 'accessories', 4);

CREATE TABLE public.store_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.store_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  old_price NUMERIC,
  sizes TEXT[] DEFAULT '{}',
  image_url TEXT,
  video_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_store_products_active ON public.store_products(active);
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view active store products" ON public.store_products FOR SELECT
  USING (active = true);
CREATE POLICY "admins manage store products" ON public.store_products FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_store_products_updated BEFORE UPDATE ON public.store_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.store_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_basket TEXT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','confirmed','shipped','delivered','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_store_orders_user ON public.store_orders(user_id);
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own store orders" ON public.store_orders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users insert own store orders" ON public.store_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage store orders" ON public.store_orders FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_store_orders_updated BEFORE UPDATE ON public.store_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= STORAGE BUCKET =============
INSERT INTO storage.buckets (id, name, public) VALUES ('store-products', 'store-products', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view store product files" ON storage.objects FOR SELECT
  USING (bucket_id = 'store-products');
CREATE POLICY "Admins upload store product files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-products' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update store product files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-products' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete store product files" ON storage.objects FOR DELETE
  USING (bucket_id = 'store-products' AND has_role(auth.uid(), 'admin'));
