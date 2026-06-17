import { useEffect, useState } from "react";
import { Radio, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AUTO_HIDE_MS = 10000;
const DEFAULT_URL = "https://whatsapp.com/channel/0029Vb6Wikiservices";

export function WhatsAppChannelPopup() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const { data } = useQuery({
    queryKey: ["site-settings-wa-channel"],
    queryFn: async () =>
      (await supabase
        .from("site_settings")
        .select("wa_channel_url, wa_channel_popup_enabled, wa_channel_popup_delay_seconds, wa_channel_popup_message")
        .eq("id", 1)
        .maybeSingle()).data,
    staleTime: 60_000,
  });

  const [open, setOpen] = useState(false);

  // Re-trigger on every route change
  useEffect(() => {
    if (!data?.wa_channel_popup_enabled) return;
    setOpen(false);
    const delay = Math.max(0, (data.wa_channel_popup_delay_seconds ?? 5)) * 1000;
    const showT = setTimeout(() => {
      setOpen(true);
      const hideT = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
      (window as any).__waChHideT = hideT;
    }, delay);
    return () => {
      clearTimeout(showT);
      if ((window as any).__waChHideT) clearTimeout((window as any).__waChHideT);
    };
  }, [data, path]);

  if (!open || !data) return null;

  const url = data.wa_channel_url?.trim() || DEFAULT_URL;
  const msg = data.wa_channel_popup_message?.trim() || "Join our WhatsApp Channel for daily updates, offers & alerts!";

  return (
    <div className="fixed inset-0 z-[185] pointer-events-none flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4">
      <div className="pointer-events-auto relative w-full max-w-sm rounded-2xl border border-[#25D366]/60 bg-card/95 backdrop-blur p-4 shadow-[0_0_50px_rgba(37,211,102,0.55)] animate-in fade-in slide-in-from-top-4">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-background/60 hover:bg-background text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-ping" />
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-black shadow-[0_0_24px_rgba(37,211,102,0.7)]">
              <Radio className="h-6 w-6" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-[#25D366]">&gt; whatsapp_channel</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{msg}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-black hover:scale-105 transition"
            >
              <Radio className="h-4 w-4" /> Join Channel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
