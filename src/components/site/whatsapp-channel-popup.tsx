import { useEffect, useState } from "react";
import { Radio, X, ArrowRight, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AUTO_HIDE_MS = 12000;
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
  const [entered, setEntered] = useState(false);

  // Re-trigger on every route change
  useEffect(() => {
    if (!data?.wa_channel_popup_enabled) return;
    setOpen(false);
    setEntered(false);
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
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-3 pt-4 sm:pt-6"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        onMouseEnter={() => setEntered(true)}
        className={`relative w-full max-w-md rounded-3xl border-2 border-[#25D366]/70 bg-[#0a1f0f] p-5 sm:p-6 shadow-[0_0_80px_rgba(37,211,102,0.4),0_0_24px_rgba(37,211,102,0.2)] transition-all duration-500 ${entered ? "scale-[1.02] shadow-[0_0_100px_rgba(37,211,102,0.55),0_0_32px_rgba(37,211,102,0.3)]" : ""} animate-in fade-in zoom-in-95 slide-in-from-top-6`}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute -top-3 -right-3 h-8 w-8 grid place-items-center rounded-full bg-[#1a1a1a] border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-black transition shadow-[0_0_16px_rgba(37,211,102,0.5)]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top accent line */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#25D366] to-transparent" />

        {/* Icon + Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-black shadow-[0_0_40px_rgba(37,211,102,0.7)]">
              <Bell className="h-7 w-7" />
            </span>
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-black text-[10px] font-bold shadow-[0_0_12px_rgba(37,211,102,0.6)]">
              <Radio className="h-3 w-3" />
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            Join Our WhatsApp Channel
          </h3>
          <p className="mt-2 text-sm sm:text-base text-[#a3f0c5] leading-relaxed max-w-xs">
            {msg}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-6 py-3 text-sm sm:text-base font-bold text-black shadow-[0_0_24px_rgba(37,211,102,0.5)] hover:shadow-[0_0_40px_rgba(37,211,102,0.7)] hover:scale-105 transition-all duration-300"
          >
            <Radio className="h-4 w-4" />
            Join Channel Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <button
            onClick={() => setOpen(false)}
            className="text-xs text-[#25D366]/70 hover:text-[#25D366] underline underline-offset-2 transition"
          >
            Maybe later
          </button>
        </div>

        {/* Bottom glow bar */}
        <div className="mt-5 h-1 w-full rounded-full bg-gradient-to-r from-transparent via-[#25D366]/60 to-transparent" />
      </div>
    </div>
  );
}
