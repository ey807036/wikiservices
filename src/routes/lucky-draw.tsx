import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Trophy, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PayfastCheckout } from "@/components/site/payfast-checkout";
import e1 from "@/assets/emojis/e1.png";
import e4 from "@/assets/emojis/e4.png";
import e12 from "@/assets/emojis/e12.png";
import e15 from "@/assets/emojis/e15.png";
import e22 from "@/assets/emojis/e22.png";

export const Route = createFileRoute("/lucky-draw")({
  head: () => ({
    meta: [
      { title: "1 Rupee Lucky Draw — Daily 10 PM Quran-Andazi 💰" },
      { name: "description", content: "Sirf Rs.1 invest karo, har raat 10 baje Quran-andazi mein winner ko sara paisa milega." },
    ],
  }),
  component: LuckyDrawPage,
});

type Entry = { id: string; name: string; phone: string; method: string; txn: string; ts: number };

function next10pm(now = new Date()) {
  const t = new Date(now);
  t.setHours(22, 0, 0, 0);
  if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
  return t;
}

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = useMemo(() => next10pm(new Date(now)).getTime(), [Math.floor(now / 60000)]);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

function LuckyDrawPage() {
  const { h, m, s } = useCountdown();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winner, setWinner] = useState<Entry | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", method: "easypaisa", txn: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lucky_entries");
      if (raw) setEntries(JSON.parse(raw));
      const w = localStorage.getItem("lucky_winner_today");
      if (w) setWinner(JSON.parse(w));
    } catch {}
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.txn.trim()) {
      toast.error("Sab fields zaroori hain");
      return;
    }
    const entry: Entry = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      method: form.method,
      txn: form.txn.trim(),
      ts: Date.now(),
    };
    const next = [entry, ...entries].slice(0, 500);
    setEntries(next);
    localStorage.setItem("lucky_entries", JSON.stringify(next));
    setForm({ name: "", phone: "", method: form.method, txn: "" });
    toast.success("Aap shamil ho gaye 🎉 — 10 PM ko result aayega");
  };

  const pickWinner = () => {
    if (!entries.length) return;
    const w = entries[Math.floor(Math.random() * entries.length)];
    setWinner(w);
    localStorage.setItem("lucky_winner_today", JSON.stringify(w));
    toast.success(`Winner: ${w.name} 🏆`);
  };

  const mask = (p: string) => (p.length > 4 ? p.slice(0, 4) + "****" + p.slice(-2) : p);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.7_0.25_25/0.35),_transparent_60%)]" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-yellow-500/15 blur-3xl animate-pulse" />
      </div>

      <div className="container relative mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest ring-1 ring-red-500/60 text-red-400 animate-pulse">
            <Coins className="h-4 w-4" /> 1 Rupee · Daily Quran-Andazi
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-black uppercase tracking-tight">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.65_0.25_25/0.7)]">
              1 Rupee Lucky Draw
            </span>
            <img src={e22} alt="" width={48} height={48} className="inline ml-2 h-10 w-10 object-contain" />
          </h1>
          <p className="mt-3 text-sm md:text-base text-red-100/80">
            Sirf <span className="font-black text-yellow-300">Rs.1 💰</span> invest karein. Har raat <span className="font-black text-red-300">10:00 PM</span> ko Quran-andazi se aik lucky user ko <span className="font-black">sara collected paisa</span> mil jaye ga.
          </p>
        </div>

        {/* Countdown */}
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border-2 border-red-500/60 bg-gradient-to-br from-red-950/70 to-black p-5 text-center shadow-[0_0_40px_oklch(0.65_0.25_25/0.55)]">
          <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-red-300">
            <Clock className="h-4 w-4" /> Next Draw In
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-4xl md:text-5xl font-black">
            {[["H", h], ["M", m], ["S", s]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-black/70 px-3 py-2 ring-1 ring-red-500/50 shadow-[0_0_18px_oklch(0.65_0.25_25/0.7)]">
                <div className="text-yellow-300">{String(v).padStart(2, "0")}</div>
                <div className="text-[9px] tracking-widest text-red-300/80">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-500/40 bg-black/70 p-5 space-y-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-red-400">
            <ShieldAlert className="h-4 w-4" /> Rules
          </div>
          {[
            { e: e1, t: <>Aik user sirf <b>Rs.1</b> invest karta hai (Easypaisa, JazzCash, Bank ya Card).</> },
            { e: e4, t: <>Daily raat <b>10:00 PM</b> Quran-andazi hoti hai — random method se winner select hota hai.</> },
            { e: e12, t: <>Winner ko <b>sara collected balance</b> mil jata hai. Apne account mein withdraw kar sakte hain.</> },
            { e: e15, t: <>Result website + WhatsApp group dono par live show hota hai sab k samne.</> },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-red-950/30 px-3 py-2 ring-1 ring-red-500/20">
              <img src={r.e} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" loading="lazy" />
              <p className="text-sm">{r.t}</p>
            </div>
          ))}
        </div>

        {/* PayFast Deposit */}
        <div className="mx-auto mt-6 max-w-xl">
          <PayfastCheckout amount={1} purpose="Lucky Draw Entry" basketPrefix="LUCKY" buttonLabel="Join Lucky Draw · Pay Rs.2" />
          <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-red-200/50">
            Approve hote hi auto confirm — entry list mae add ho jaye gae
          </p>
        </div>

        {/* Winner / Entries */}
        {winner && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border-2 border-yellow-400/70 bg-gradient-to-br from-yellow-900/40 to-black p-5 text-center shadow-[0_0_36px_oklch(0.85_0.18_85/0.5)]">
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-300">
              <Trophy className="h-4 w-4" /> Today's Winner
            </div>
            <div className="mt-2 text-2xl font-black text-yellow-200">{winner.name} 🏆</div>
            <div className="text-xs text-yellow-100/70">{mask(winner.phone)} · {winner.method}</div>
          </div>
        )}

        <div className="mx-auto mt-6 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-red-300">Live Participants ({entries.length})</h3>
            <button onClick={pickWinner} className="text-[10px] font-bold uppercase tracking-widest text-yellow-300 underline">
              Pick winner (admin)
            </button>
          </div>
          <div className="rounded-2xl border border-red-500/30 bg-black/60 divide-y divide-red-500/10 max-h-72 overflow-auto">
            {entries.length === 0 && <div className="p-4 text-center text-xs text-red-200/60">Abhi koi participant nahi — pehle aap ban jayein!</div>}
            {entries.map((e, i) => (
              <div key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <span className="font-bold text-red-200">#{i + 1} {e.name}</span>
                <span className="text-red-300/70">{mask(e.phone)}</span>
                <span className="rounded bg-red-500/15 px-2 py-0.5 font-bold uppercase text-[10px] text-red-300">{e.method}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs uppercase tracking-widest text-red-300/70 underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
