import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, Skull, Database, Zap, AlertTriangle, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/site/verified-badge";
import { PayfastCheckout } from "@/components/site/payfast-checkout";
import { NeonLogo } from "@/components/site/neon-logo";
import { NeonVideoCircle, VideoPreloader } from "@/components/site/neon-video-circle";
import e1 from "@/assets/emojis/e1.png";
import e2 from "@/assets/emojis/e2.png";
import e3 from "@/assets/emojis/e3.png";
import e4 from "@/assets/emojis/e4.png";
import e5 from "@/assets/emojis/e5.png";
import e9 from "@/assets/emojis/e9.png";
import e11 from "@/assets/emojis/e11.png";
import e12 from "@/assets/emojis/e12.png";
import e13 from "@/assets/emojis/e13.png";
import e14 from "@/assets/emojis/e14.png";
import e15 from "@/assets/emojis/e15.png";
import e17 from "@/assets/emojis/e17.png";
import e21 from "@/assets/emojis/e21.png";
import e22 from "@/assets/emojis/e22.png";

const RECORD_EMOJIS = [e1, e15, e14, e22, e12, e13];
const FIELD_EMOJIS = [e1, e11, e12, e22, e17, e21, e3, e5];
const emojiCry = e9;
const emojiSad = e2;

export const Route = createFileRoute("/sim-database")({
  head: () => ({
    meta: [
      { title: "Wiki SimDatabase — Underground SIM Lookup 💀" },
      { name: "description", content: "Free SIM Data lookup. Enter any number to fetch full SIM details from the underground database." },
    ],
  }),
  component: SimDatabasePage,
});

type SimRecord = Record<string, any>;

function SimDatabasePage() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-sim-database"],
    queryFn: async () =>
      (await supabase.from("site_settings" as any).select("sim_database_logo_url").eq("id", 1).maybeSingle()).data,
  });
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SimRecord[] | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | "all" | null>(null);
  const [activeVideo, setActiveVideo] = useState<null | "owner" | "payment" | "notfound">(null);

  const VIDEOS = {
    owner: "/videos/owner-warning.mp4",
    payment: "/videos/payment-fail.mp4",
    notfound: "/videos/data-not-found.mp4",
  } as const;

  // Listen for payment failures dispatched by PayfastCheckout
  useEffect(() => {
    const onFail = () => setActiveVideo("payment");
    window.addEventListener("wiki:payment-fail", onFail as EventListener);
    return () => window.removeEventListener("wiki:payment-fail", onFail as EventListener);
  }, []);


  const formatRecord = (rec: SimRecord) =>
    Object.entries(rec).map(([k, v]) => `${k}: ${v ?? "—"}`).join("\n");

  const copyText = async (text: string, key: number | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(key);
      toast.success("Copied to clipboard 📋");
      setTimeout(() => setCopiedIdx((c) => (c === key ? null : c)), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const BLOCKED_NUMBERS = ["03700370337", "03423014149", "03186376181"];

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = number.trim();
    if (!n) return;
    const normalized = n.replace(/\D/g, "");
    if (BLOCKED_NUMBERS.some((b) => normalized.endsWith(b.replace(/\D/g, "")))) {
      setData(null);
      setError(
        "😂 Bhai chala ja BSDK! Mere hi number mere website se data nikalwana hai? 🤡 Akl thikane laga — yeh number malik ke hain, database gussa ho gaya hai! 💀"
      );
      toast.error("🚫 Owner number detected — bhag yahan se! 😂");
      setActiveVideo("owner");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`https://Famofc.site/api/database.php?number=${encodeURIComponent(n)}`);
      const text = await res.text();
      let json: any;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }
      let arr: SimRecord[] = Array.isArray(json)
        ? json
        : (json?.data?.records ?? json?.records ?? json?.results ?? (Array.isArray(json?.data) ? json.data : []));
      // Treat upstream "not found" / error / empty as no records so the danger card shows
      const status = String(json?.status ?? "").toLowerCase();
      const isNotFound =
        !json ||
        json?.success === false ||
        status === "error" ||
        status === "not_found" ||
        status === "false" ||
        (json?.message && /not\s*found|no\s*record|no\s*data/i.test(String(json.message)));
      if (isNotFound) arr = [];
      // Filter out empty/garbage/masked rows (e.g. "***", "None", "-", empty strings)
      const isJunkVal = (v: any) => {
        const s = String(v ?? "").trim();
        if (!s) return true;
        if (/^[*\-_\s]+$/.test(s)) return true; // only stars / dashes
        if (/^none$/i.test(s)) return true;
        return false;
      };
      arr = (arr || [])
        .filter((r) => r && typeof r === "object" && Object.keys(r).length > 0)
        .filter((r) => {
          const vals = Object.values(r);
          // keep only if at least one meaningful value exists
          return vals.some((v) => !isJunkVal(v));
        });
      setData(arr);
      if (arr.length === 0) setActiveVideo("notfound");
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch SIM data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Danger animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.25_25/0.35),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,oklch(0.65_0.25_25/0.25)_95%)] bg-[length:100%_8px] animate-pulse" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl animate-pulse" />
      </div>

      <div className="container relative mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          {(settings as any)?.sim_database_logo_url && (
            <div className="mb-4 flex justify-center">
              <NeonLogo src={(settings as any).sim_database_logo_url} alt="Wiki SimDatabase" size={92} glow="var(--primary)" />
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest ring-1 ring-red-500/60 text-red-400 animate-pulse">
            <ShieldAlert className="h-4 w-4" /> Danger Zone · Underground
          </span>
          <h1 className="mt-4 flex items-center justify-center gap-2 text-4xl font-black uppercase tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.65_0.25_25/0.7)]">
              Wiki SimDatabase
            </span>
            <VerifiedBadge color="green" size={26} className="translate-y-[1px]" />
            <Skull className="inline h-8 w-8 text-red-500 animate-bounce" />
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Enter any phone number to fetch full SIM owner details — CNIC, Name, Address & more.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={lookup} className="mx-auto mt-8 max-w-xl">
          <div className="relative rounded-2xl border-2 border-red-500/60 bg-card/70 p-4 backdrop-blur shadow-[0_0_30px_oklch(0.65_0.25_25/0.4)]">
            <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
              <Database className="h-3 w-3" /> Live Lookup
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="03XXXXXXXXX"
                inputMode="numeric"
                className="h-12 text-base bg-background/60 border-red-500/40 focus-visible:ring-red-500"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-6 rounded-md bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_20px_oklch(0.65_0.25_25/0.7)] hover:opacity-90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "Hacking…" : "Search"}
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-red-400/80">
              <AlertTriangle className="h-3 w-3" /> For educational use only · Underground access
            </p>
          </div>
        </form>

        {/* Result */}
        <div className="mx-auto mt-8 max-w-3xl">
          {error && (
            <div className="rounded-xl border border-red-500/60 bg-red-500/10 p-4 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="grid place-items-center rounded-2xl border border-red-500/40 bg-card/60 p-10">
              <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              <p className="mt-3 text-sm font-bold uppercase tracking-widest text-red-400 animate-pulse">
                Breaching Database…
              </p>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
                  <Zap className="h-4 w-4" /> {data.length} record{data.length > 1 ? "s" : ""} found
                </div>
                <button
                  type="button"
                  onClick={() => copyText(data.map((r, i) => `── Record #${i + 1} ──\n${formatRecord(r)}`).join("\n\n"), "all")}
                  className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_oklch(0.65_0.25_25/0.8)] hover:shadow-[0_0_36px_oklch(0.65_0.25_25/1)] transition-all hover:scale-105 ring-1 ring-red-300/40"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-rose-600 opacity-50 blur-md group-hover:opacity-80 transition-opacity animate-pulse" />
                  {copiedIdx === "all" ? <Check className="relative h-3.5 w-3.5" /> : <Copy className="relative h-3.5 w-3.5" />}
                  <span className="relative">{copiedIdx === "all" ? "Copied" : "Copy All"}</span>
                </button>
              </div>
              {data.map((rec, i) => {
                const headerEmoji = RECORD_EMOJIS[i % RECORD_EMOJIS.length];
                return (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-red-500/60 bg-black/90 p-5 backdrop-blur shadow-[0_0_28px_oklch(0.65_0.25_25/0.55)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400">
                      <img src={headerEmoji} alt="" width={28} height={28} className="h-7 w-7 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" loading="lazy" />
                      <span>Record #{i + 1}</span>
                      <VerifiedBadge color="green" size={18} />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(formatRecord(rec), i)}
                      className="group relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_16px_oklch(0.65_0.25_25/0.8)] hover:shadow-[0_0_28px_oklch(0.65_0.25_25/1)] transition-all hover:scale-110 ring-1 ring-red-300/40"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-rose-600 opacity-50 blur-md group-hover:opacity-80 transition-opacity animate-pulse" />
                      {copiedIdx === i ? <Check className="relative h-3 w-3" /> : <Copy className="relative h-3 w-3" />}
                      <span className="relative">{copiedIdx === i ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(rec).map(([k, v], fi) => {
                      const lineEmoji = FIELD_EMOJIS[(fi + i) % FIELD_EMOJIS.length];
                      return (
                        <div key={k} className="flex items-start gap-2 rounded-lg bg-black/70 px-3 py-2 ring-1 ring-red-500/40 shadow-[0_0_12px_oklch(0.65_0.25_25/0.25)]">
                          <img src={lineEmoji} alt="" width={28} height={28} className="mt-0.5 h-7 w-7 shrink-0 object-contain" loading="lazy" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</div>
                            <div className="mt-0.5 break-all text-sm font-semibold">{String(v ?? "—")}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );})}
            </div>
          )}

          {data && data.length === 0 && !loading && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/70 bg-gradient-to-br from-red-950/80 via-black to-red-950/60 p-6 text-center shadow-[0_0_50px_oklch(0.65_0.25_25/0.55)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.28_25/0.5),_transparent_70%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_94%,oklch(0.65_0.25_25/0.25)_94%)] bg-[length:100%_6px]" />

              <div className="relative">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-black/70 ring-1 ring-red-500/50 shadow-[0_0_24px_oklch(0.65_0.25_25/0.6)]">
                  <img src={emojiCry} alt="" width={72} height={72} className="h-16 w-16 object-contain" loading="lazy" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-red-300 drop-shadow-[0_0_12px_oklch(0.65_0.25_25/0.8)]">
                  ❌ Data Available Nahi 🚫
                </h3>

                <div className="mt-4 rounded-2xl border border-red-500/40 bg-black/70 p-4 text-left text-sm md:text-[15px] leading-relaxed space-y-3">
                  <div className="flex items-start gap-3">
                    <img src={e11} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" loading="lazy" />
                    <p className="min-w-0 flex-1"><span className="font-black text-red-300">Reason:</span> Yeh number <span className="font-bold">2024 – 2026</span> ka register hua hai, isliye free database mein available nahi hai.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src={e3} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" loading="lazy" />
                    <p className="min-w-0 flex-1"><span className="font-black text-emerald-400">Free Data:</span> sirf <span className="font-bold">2001 – 2023</span> tak available hai. Purane numbers free try karein.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src={e4} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" loading="lazy" />
                    <p className="min-w-0 flex-1"><span className="font-black text-yellow-300">Paid Data:</span> 2024 – 2026 ka full record sirf <span className="font-black">Rs. 500/-</span> mein milta hai 💰</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src={e5} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain opacity-90" loading="lazy" />
                    <p className="min-w-0 flex-1 text-xs text-red-100/80">Stay cool · Paid plan ke liye neeche WhatsApp button dabayein 👇</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="mx-auto max-w-md text-left">
                    <PayfastCheckout
                      amount={500}
                      purpose={`SIM Data 2024-2026 · ${number}`}
                      basketPrefix="SIM"
                      buttonLabel="Pay Rs.501 · Unlock Data"
                      whatsappAfter={`https://wa.me/923186376181?text=${encodeURIComponent(`Salam! Payment done for NEW SimData (2024-2026) of number ${number}. Please share details.`)}`}
                    />
                  </div>
                  <a
                    href={`https://wa.me/923186376181?text=${encodeURIComponent("Salam! I want NEW SimData (2024-2026) for number, Rs. 500. Please share details.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_18px_oklch(0.7_0.2_150/0.7)]"
                  >
                    💬 WhatsApp pe baat karein
                  </a>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-red-300/60">
                  <img src={emojiSad} alt="" width={18} height={18} className="h-4 w-4 object-contain opacity-70" />
                  <span>Powered by FAMOFC API · For educational use only</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
