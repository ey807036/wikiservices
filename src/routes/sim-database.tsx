import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, Skull, Database, Zap, AlertTriangle, Loader2 } from "lucide-react";

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

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = number.trim();
    if (!n) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`https://blacksimdetail.vercel.app/public_apis/simdetailsapi.php?number=${encodeURIComponent(n)}`);
      const text = await res.text();
      let json: any;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }
      const arr: SimRecord[] = Array.isArray(json) ? json : (json?.data ?? json?.results ?? [json]);
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
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
                <Zap className="h-4 w-4" /> {data.length} record{data.length > 1 ? "s" : ""} found
              </div>
              {data.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-card/90 to-card/60 p-5 backdrop-blur shadow-[0_0_22px_oklch(0.65_0.25_25/0.35)]"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400">
                    <Skull className="h-4 w-4" /> Record #{i + 1}
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

          {data && data.length === 0 && !loading && (
            <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-400">
              No records found for this number.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
