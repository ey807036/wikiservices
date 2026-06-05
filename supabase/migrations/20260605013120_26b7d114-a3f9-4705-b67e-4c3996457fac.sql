ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS whatsapp_popup_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_popup_delay_seconds integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS whatsapp_popup_message text NOT NULL DEFAULT 'Asalam-o-Alaikum! 👋 Koi madad chahiye? WhatsApp par humse baat karein.';