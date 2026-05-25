
CREATE TABLE public.home_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  logo_url TEXT,
  icon_tone TEXT NOT NULL DEFAULT 'signal',
  hot BOOLEAN NOT NULL DEFAULT false,
  action TEXT,
  href TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone view active home items" ON public.home_items
  FOR SELECT USING (active = true);

CREATE POLICY "admins view all home items" ON public.home_items
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins manage home items" ON public.home_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER home_items_set_updated_at
  BEFORE UPDATE ON public.home_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.home_items (name, description, price, sold_count, icon_tone, hot, action, sort_order) VALUES
('Fake WhatsApp Number', 'Anonymous WhatsApp numbers — pick & chat instantly', 150, 2000, 'whatsapp', true, 'fakewa', 1),
('Pro Accounts by Wiki', 'Netflix, CapCut Pro, Remini, Spotify, ChatGPT+, Canva & 20+ premium accounts', 100, 8200, 'premium', true, 'pro', 2),
('New SimData by Wiki', 'Fresh 2024–2026 SIM owner data lookup (paid)', 500, 4500, 'data', true, NULL, 3),
('WiFi Jammer', 'Block any WiFi signal in range', 5000, 87, 'signal', true, NULL, 4),
('All-in-One Device Hack 💀', 'Single device to control Car, TV, AC, Projector, Laptop, PC, Mobile, MP3/Sound, Camera, Bulb & more', 5000, 42, 'danger', false, NULL, 5),
('CNIC Colour Copy + Family Details', 'Full colour CNIC copy plus complete family record', 5000, 500, 'id', false, NULL, 6),
('Bluetooth Jammer', 'Kill nearby Bluetooth devices', 10000, 64, 'bluetooth', false, NULL, 7),
('SIM Signal Jammer', 'Block all SIM / mobile network signals in range', 50000, 1, 'sim', false, NULL, 8),
('Drone Jammer & Controller', 'Jam, hijack & take control of nearby camera drones', 50000, 3, 'drone', false, NULL, 9);
