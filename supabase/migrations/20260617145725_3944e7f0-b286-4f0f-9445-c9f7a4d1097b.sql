
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS wa_channel_url TEXT,
  ADD COLUMN IF NOT EXISTS wa_channel_popup_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS wa_channel_popup_delay_seconds INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS wa_channel_popup_message TEXT;
