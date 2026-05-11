import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, Skull, Database, Zap, AlertTriangle, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

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
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SimRecord[] | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | "all" | null>(null);

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

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = number.trim();
    if (!n) return;
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
      // Filter out empty/garbage rows
      arr = (arr || []).filter((r) => r && typeof r === "object" && Object.keys(r).length > 0);
      setData(arr);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch SIM data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Danger animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.25_25/0.35),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,oklch(0.65_0.25_25/0.25)_95%)] bg-[length:100%_8px] animate-pulse" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl animate-pulse" />
      </div>

      <div className="container relative mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest ring-1 ring-red-500/60 text-red-400 animate-pulse">
            <ShieldAlert className="h-4 w-4" /> Danger Zone · Underground
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-black uppercase tracking-tight">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.65_0.25_25/0.7)]">
              Wiki SimDatabase
            </span>
            <Skull className="inline ml-2 h-8 w-8 text-red-500 animate-bounce" />
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
              {data.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-card/90 to-card/60 p-5 backdrop-blur shadow-[0_0_22px_oklch(0.65_0.25_25/0.35)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400">
                      <Skull className="h-4 w-4" /> Record #{i + 1}
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
                    {Object.entries(rec).map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-background/60 px-3 py-2 ring-1 ring-red-500/20">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</div>
                        <div className="mt-0.5 break-words text-sm font-semibold">{String(v ?? "—")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {((data && data.length === 0) || (data && data.length === 1 && data[0]?.raw)) && !loading && (
            <div className="glitch-box rounded-2xl border-2 border-red-500/60 bg-gradient-to-br from-red-950/40 to-black/60 p-6 text-center backdrop-blur shadow-[0_0_30px_oklch(0.65_0.25_25/0.5)]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-600/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300 ring-1 ring-red-500/60">
                <Skull className="h-3 w-3" /> No Free Record
              </div>
              <h3 className="glitch-text text-2xl md:text-3xl font-black uppercase text-red-400">
                Data Not Found 💀
              </h3>
              <p className="mt-3 text-sm md:text-base text-red-100/90 leading-relaxed">
                Hamara <span className="font-black text-red-400">SimData 2001 se 2023</span> tak tamam numbers ka data <span className="font-black text-emerald-400">FREE</span> hai.
                <br />
                Naye number ka data sirf <span className="font-black text-yellow-300 text-lg">Rs. 500</span> mein milega —
                <span className="font-black text-emerald-400"> 2024 se 2026</span> tak full details.
                <br />
                Abhi WhatsApp par contact karein 👇
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-4 py-1 text-sm font-black uppercase tracking-wider text-yellow-300 ring-1 ring-yellow-400/60 mb-3">
                💰 Price Tag: Rs. 500 / Number
              </div>
              <br />
              <a
                href={`https://wa.me/923186376181?text=${encodeURIComponent("Salam! I want NEW SimData (2024-2026) for number, Rs. 500. Please share details.")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-black uppercase tracking-wider text-white shadow-[0_0_20px_oklch(0.7_0.2_150/0.6)] hover:bg-emerald-500 animate-pulse"
              >
                💬 Contact on WhatsApp · Rs. 500
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
