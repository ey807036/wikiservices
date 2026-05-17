import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Trophy, Clock, ShieldAlert, X, CheckCircle2 } from "lucide-react";
import { PayfastCheckout } from "@/components/site/payfast-checkout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonLogo } from "@/components/site/neon-logo";
import e1 from "@/assets/emojis/e1.png";
import e4 from "@/assets/emojis/e4.png";
import e12 from "@/assets/emojis/e12.png";
import e15 from "@/assets/emojis/e15.png";
import e22 from "@/assets/emojis/e22.png";

export const Route = createFileRoute("/lucky-draw")({
  head: () => ({
    meta: [
      { title: "Lucky Draw — Daily 10 PM Quran-Andazi 💰" },
      { name: "description", content: "Daily lucky draw — invest karo, winner ko full prize milega." },
    ],
  }),
  component: LuckyDrawPage,
});

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

function todayPK() {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date());
}

function maskPhone(p?: string | null) {
  if (!p) return "";
  return p.length > 4 ? p.slice(0, 4) + "****" + p.slice(-2) : p;
}

function LuckyDrawPage() {
  const { h, m, s } = useCountdown();
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = todayPK();
  const [showClaim, setShowClaim] = useState(false);
  const [claimSubmittedAt, setClaimSubmittedAt] = useState<number | null>(null);

  const { data: branding } = useQuery({
    queryKey: ["site-settings-lucky"],
    queryFn: async () => (await supabase.from("site_settings").select("lucky_logo_url").eq("id", 1).maybeSingle()).data,
  });

  const { data: settings } = useQuery({
    queryKey: ["lucky-settings"],
    queryFn: async () => (await supabase.from("lucky_settings").select("*").eq("id", 1).maybeSingle()).data,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["lucky-entries", today],
    queryFn: async () => {
      const { data } = await supabase
        .from("lucky_entries")
        .select("id, name, phone, amount, created_at, user_id")
        .eq("draw_date", today)
        .order("created_at", { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const { data: winner } = useQuery({
    queryKey: ["lucky-winner-today", today],
    queryFn: async () => {
      const { data } = await supabase
        .from("lucky_winners")
        .select("*, lucky_entries(name, phone)")
        .eq("draw_date", today)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("lucky-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lucky_entries" }, () => {
        qc.invalidateQueries({ queryKey: ["lucky-entries", today] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lucky_winners" }, () => {
        qc.invalidateQueries({ queryKey: ["lucky-winner-today", today] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, today]);

  const iAmWinner = !!user && winner && (winner as any).user_id === user.id;
  const prize = settings?.prize_amount ?? 2;
  const totalPot = entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // ETA timer for "received within 30 mins"
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const etaLeft = claimSubmittedAt ? Math.max(0, 30 * 60 * 1000 - (now - claimSubmittedAt)) : 0;
  const etaM = Math.floor(etaLeft / 60000);
  const etaS = Math.floor((etaLeft % 60000) / 1000);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.7_0.25_25/0.35),_transparent_60%)]" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-yellow-500/15 blur-3xl animate-pulse" />
      </div>

      <div className="container relative mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          {(branding as any)?.lucky_logo_url && (
            <div className="mb-5">
              <NeonLogo src={(branding as any).lucky_logo_url} size={104} glow="oklch(0.7 0.25 25)" />
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest ring-1 ring-red-500/60 text-red-400 animate-pulse">
            <Coins className="h-4 w-4" /> Daily Quran-Andazi
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-black uppercase tracking-tight">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.65_0.25_25/0.7)]">
              Lucky Draw
            </span>
            <img src={e22} alt="" width={48} height={48} className="inline ml-2 h-10 w-10 object-contain" />
          </h1>
          <p className="mt-3 text-sm md:text-base text-red-100/80">
            Sirf <span className="font-black text-yellow-300">Rs.1 💰</span> invest karein. Har raat <span className="font-black text-red-300">10:00 PM</span> ko Quran-andazi se aik lucky user ko <span className="font-black">prize</span> mil jaye ga.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-500/15 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest text-yellow-300 ring-1 ring-yellow-500/40">
            🏆 Aaj ka Prize: Rs. {prize} · Pot: Rs. {totalPot}
          </div>
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
            { e: e1, t: <>Pehle <b>Login</b> karein. Phir <b>Rs.1</b> invest karein (Easypaisa, JazzCash, Bank ya Card).</> },
            { e: e4, t: <>Daily raat <b>10:00 PM</b> Quran-andazi hoti hai — random method se winner select hota hai.</> },
            { e: e12, t: <>Winner ko <b>prize amount</b> mil jata hai. Apne account mein withdraw kar sakte hain.</> },
            { e: e15, t: <>Result website par live show hota hai sab ko visible.</> },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-red-950/30 px-3 py-2 ring-1 ring-red-500/20">
              <img src={r.e} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" loading="lazy" />
              <p className="text-sm">{r.t}</p>
            </div>
          ))}
        </div>

        {/* PayFast Deposit */}
        <div className="mx-auto mt-6 max-w-xl">
          <PayfastCheckout
            amount={1}
            purpose="Lucky Draw Entry"
            basketPrefix="LUCKY"
            buttonLabel="Join Lucky Draw · Pay Rs.2"
            requireAuth
            intentType="lucky"
          />
          <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-red-200/50">
            Login → Pay → naam turant Live Participants list mae add ho jaye ga
          </p>
        </div>

        {/* Winner banner */}
        {winner && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border-2 border-yellow-400/70 bg-gradient-to-br from-yellow-900/40 to-black p-5 text-center shadow-[0_0_36px_oklch(0.85_0.18_85/0.5)]">
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-300">
              <Trophy className="h-4 w-4" /> Today's Winner
            </div>
            <div className="mt-2 text-2xl font-black text-yellow-200">
              {(winner as any).lucky_entries?.name || "Winner"} 🏆
            </div>
            <div className="text-xs text-yellow-100/70">{maskPhone((winner as any).lucky_entries?.phone)} · Prize Rs. {(winner as any).prize_amount}</div>
            {iAmWinner && !claimSubmittedAt && (
              <button onClick={() => setShowClaim(true)} className="mt-3 inline-block rounded-full bg-yellow-500 hover:bg-yellow-400 px-5 py-2 text-sm font-black uppercase text-black">
                Claim / Withdraw Prize →
              </button>
            )}
            {claimSubmittedAt && (
              <div className="mt-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3">
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="h-5 w-5" /> Claim Received
                </div>
                <div className="mt-1 text-xs text-emerald-200/80">
                  Payment aap k account mein <b>30 minutes</b> mein receive ho jaye gi.
                </div>
                {etaLeft > 0 && (
                  <div className="mt-2 font-mono text-lg text-emerald-200">⏳ {String(etaM).padStart(2,"0")}:{String(etaS).padStart(2,"0")} min</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Live Participants */}
        <div className="mx-auto mt-6 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-red-300">Live Participants ({entries.length})</h3>
            <span className="text-[10px] uppercase tracking-widest text-red-200/60">Live · Auto refresh</span>
          </div>
          <div className="rounded-2xl border border-red-500/30 bg-black/60 divide-y divide-red-500/10 max-h-80 overflow-auto">
            {entries.length === 0 && <div className="p-4 text-center text-xs text-red-200/60">Abhi koi participant nahi — pehle aap ban jayein!</div>}
            {entries.map((e, i) => {
              const mine = user?.id === e.user_id;
              return (
                <div key={e.id} className={`flex items-center justify-between gap-3 px-3 py-2 text-xs ${mine ? "bg-yellow-500/10" : ""}`}>
                  <span className="font-bold text-red-200">
                    #{i + 1} {e.name} {mine && <span className="text-yellow-300">· You</span>}
                  </span>
                  <span className="text-red-300/70">{maskPhone(e.phone)}</span>
                  <span className="rounded bg-red-500/15 px-2 py-0.5 font-bold uppercase text-[10px] text-red-300">Rs. {e.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs uppercase tracking-widest text-red-300/70 underline">← Back to Home</Link>
        </div>
      </div>

      {/* Claim/Withdraw modal */}
      {showClaim && winner && (
        <ClaimModal
          winnerId={(winner as any).id}
          userId={user?.id}
          amount={Number((winner as any).prize_amount || 0)}
          onClose={() => setShowClaim(false)}
          onSubmitted={() => { setShowClaim(false); setClaimSubmittedAt(Date.now()); toast.success("Withdrawal submit ho gae!"); }}
        />
      )}
    </div>
  );
}

function ClaimModal({ winnerId, userId, amount, onClose, onSubmitted }: {
  winnerId: string; userId?: string; amount: number; onClose: () => void; onSubmitted: () => void;
}) {
  const [method, setMethod] = useState("easypaisa");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!userId) return toast.error("Login required");
    if (!accountName.trim() || !accountNumber.trim()) return toast.error("Account details zaroori");
    setSaving(true);
    try {
      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: userId,
        winner_id: winnerId,
        amount,
        method,
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        bank_name: method === "bank" ? bankName.trim() : null,
      });
      if (error) throw error;
      // Mark winner as claimed
      await supabase.from("lucky_winners").update({ claimed: true }).eq("id", winnerId);
      onSubmitted();
    } catch (e: any) {
      toast.error(e.message || "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card text-foreground border-2 border-yellow-500/50 rounded-2xl max-w-md w-full p-5 shadow-[0_0_40px_oklch(0.85_0.18_85/0.5)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black">Withdraw Prize — Rs. {amount}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-bold">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm">
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="bank">Bank Transfer</option>
              <option value="sadapay">SadaPay</option>
              <option value="nayapay">NayaPay</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold">Account Holder Name</label>
            <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs font-bold">Account / Mobile Number</label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="03XXXXXXXXX" />
          </div>
          {method === "bank" && (
            <div>
              <label className="text-xs font-bold">Bank Name</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="HBL, Meezan, etc." />
            </div>
          )}
          <Button onClick={submit} disabled={saving} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black">
            {saving ? "Submitting…" : "Submit Withdrawal"}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">Payment 30 minutes mein process ho jaye gi.</p>
        </div>
      </div>
    </div>
  );
}
