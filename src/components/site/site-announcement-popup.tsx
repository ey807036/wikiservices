import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";

type Ann = { message: string; active: boolean; updated_at: string };

export function SiteAnnouncementPopup() {
  const [ann, setAnn] = useState<Ann | null>(null);
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<"open" | "close">("open");

  useEffect(() => {
    let mounted = true;
    supabase
      .from("site_announcements")
      .select("message, active, updated_at")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data || !data.active || !data.message?.trim()) return;
        setAnn(data as Ann);

        // Show on open: throttle by message version (per-day)
        const key = `ann_seen_${data.updated_at}_open`;
        const today = new Date().toDateString();
        if (localStorage.getItem(key) !== today) {
          setTimeout(() => {
            setTrigger("open");
            setOpen(true);
            localStorage.setItem(key, today);
          }, 1500);
        }

        // Show again when tab is hidden (site close attempt) — once per session
        const onHide = () => {
          if (document.visibilityState !== "hidden") return;
          const ck = `ann_close_${data.updated_at}`;
          if (sessionStorage.getItem(ck)) return;
          sessionStorage.setItem(ck, "1");
          // Pre-stage on next visible-> show.
          // (most browsers block alerts on hidden, so show on next focus)
        };
        const onShow = () => {
          if (document.visibilityState !== "visible") return;
          const ck = `ann_close_${data.updated_at}`;
          if (sessionStorage.getItem(ck) === "1") {
            sessionStorage.setItem(ck, "shown");
            setTrigger("close");
            setOpen(true);
          }
        };
        document.addEventListener("visibilitychange", onHide);
        document.addEventListener("visibilitychange", onShow);
        return () => {
          document.removeEventListener("visibilitychange", onHide);
          document.removeEventListener("visibilitychange", onShow);
        };
      });
    return () => { mounted = false; };
  }, []);

  if (!open || !ann) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative max-w-md w-full rounded-2xl border-2 border-red-500/70 bg-gradient-to-br from-red-950 to-black p-6 shadow-[0_0_60px_oklch(0.65_0.25_25/0.7)]">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-full p-1 text-red-200 hover:bg-red-500/20"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-yellow-300 font-black uppercase tracking-widest text-sm">
          <Megaphone className="h-5 w-5 animate-pulse" />
          {trigger === "close" ? "Wapas aaiye!" : "Announcement"}
        </div>
        <p className="mt-4 text-white whitespace-pre-wrap leading-relaxed">{ann.message}</p>
        <button
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-red-600 to-rose-700 py-2.5 font-black uppercase tracking-widest text-white shadow-[0_0_20px_oklch(0.65_0.25_25/0.7)]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
