import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "wiki_wa_popup_shown";
const AUTO_HIDE_MS = 8000;

export function WhatsAppEntryPopup() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hideRoute = path.startsWith("/admin") || path.startsWith("/fia-preparation");

  const { data } = useQuery({
    queryKey: ["site-settings-wa-popup"],
    queryFn: async () =>
      (await supabase
        .from("site_settings")
        .select("whatsapp_number, whatsapp_popup_enabled, whatsapp_popup_delay_seconds, whatsapp_popup_message")
        .eq("id", 1)
        .maybeSingle()).data,
    staleTime: 60_000,
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hideRoute) return;
    if (!data?.whatsapp_popup_enabled) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    const delay = Math.max(0, (data.whatsapp_popup_delay_seconds ?? 5)) * 1000;
    const showT = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
      const hideT = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
      (window as any).__waHideT = hideT;
    }, delay);
    return () => {
      clearTimeout(showT);
      if ((window as any).__waHideT) clearTimeout((window as any).__waHideT);
    };
  }, [data, hideRoute]);

  if (hideRoute || !open || !data) return null;

  const phone = (data.whatsapp_number || "923186376181").replace(/\D/g, "");
  const msg = data.whatsapp_popup_message || "Asalam-o-Alaikum! 👋";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="fixed inset-0 z-[180] pointer-events-none flex items-end sm:items-center justify-center p-4">
      <div className="pointer-events-auto relative w-full max-w-sm rounded-2xl border border-[#25D366]/50 bg-card/95 backdrop-blur p-4 shadow-[0_0_40px_rgba(37,211,102,0.45)] animate-in fade-in slide-in-from-bottom-4">
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
              <MessageCircle className="h-6 w-6" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-[#25D366]">&gt; live_support</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{msg}</p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-black hover:scale-105 transition"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
