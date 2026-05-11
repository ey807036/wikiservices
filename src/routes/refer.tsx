import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, Upload, Gift, MessageCircle, Megaphone, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/refer")({ component: ReferPage });

const ADMIN_WA = "923186376181";
const waLink = (msg: string) => `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

type Submission = {
  id: string;
  status: "pending" | "approved" | "rejected";
  reward_pkr: number;
  admin_note: string | null;
  created_at: string;
  screenshot_url: string;
};

type Settings = {
  referral_reward: number;
  max_referrals_per_user: number;
  promo_amount: number;
};

function ReferPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const refresh = async () => {
    if (!user) return;
    const [b, s, st] = await Promise.all([
      supabase.from("user_balances").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("referral_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("referral_settings").select("referral_reward,max_referrals_per_user,promo_amount").eq("id", 1).maybeSingle(),
    ]);
    setBalance(Number(b.data?.balance ?? 0));
    setSubs((s.data ?? []) as Submission[]);
    setSettings(st.data as Settings | null);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user]);

  const submit = async () => {
    if (!user || !file) return toast.error("Screenshot select karo");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setBusy(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const up = await supabase.storage.from("referral-screenshots").upload(path, file);
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("referral-screenshots").getPublicUrl(path);
      const ins = await supabase.from("referral_submissions").insert({
        user_id: user.id, screenshot_url: pub.publicUrl, note: note || null,
      });
      if (ins.error) throw ins.error;
      toast.success("Submit ho gaya! Admin verify karke balance add kar dega.");
      setFile(null); setNote("");
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Error"); }
    finally { setBusy(false); }
  };

  const redeemPromo = async () => {
    if (!promo.trim()) return;
    setPromoBusy(true);
    try {
      const { data, error } = await supabase.rpc("redeem_promo", { _code: promo.trim() });
      if (error) throw error;
      const r = data as { ok: boolean; error?: string; amount?: number };
      if (!r.ok) toast.error(r.error ?? "Failed");
      else { toast.success(`Rs. ${r.amount} added to your balance!`); setPromo(""); refresh(); }
    } catch (e: any) { toast.error(e.message ?? "Error"); }
    finally { setPromoBusy(false); }
  };

  const channelClick = () => toast.info("WhatsApp Channel — Coming Soon 💀");

  if (loading || !user) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;

  const approvedCount = subs.filter(s => s.status === "approved").length;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent p-6 ring-1 ring-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"><Wallet className="h-6 w-6" /></span>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your Balance</div>
            <div className="text-3xl font-black text-emerald-400">Rs. {balance.toLocaleString()}</div>
          </div>
          <a href={waLink(`Salam! Withdraw request: Rs. ${balance} from balance. Email: ${user.email}`)} target="_blank" rel="noreferrer" className="ml-auto">
            <Button size="sm" variant="cool">Withdraw on WhatsApp</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* WA Channel */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 text-lg font-bold"><Megaphone className="h-5 w-5 text-emerald-400" /> WhatsApp Channel</div>
          <p className="mt-2 text-sm text-muted-foreground">Follow our channel & refer friends. Per referral you earn <b className="text-emerald-400">Rs. {settings?.referral_reward ?? 2}</b>.</p>
          <Button onClick={channelClick} className="mt-4 w-full" variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" /> Join Channel — Coming Soon
          </Button>
        </div>

        {/* Promo code */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 text-lg font-bold"><Gift className="h-5 w-5 text-pink-400" /> Promo Code</div>
          <p className="mt-2 text-sm text-muted-foreground">Enter your promo code to instantly add <b className="text-pink-400">Rs. {settings?.promo_amount ?? 50}</b> to your balance (one-time).</p>
          <div className="mt-3 flex gap-2">
            <Input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code" />
            <Button onClick={redeemPromo} disabled={promoBusy}>{promoBusy ? "..." : "Redeem"}</Button>
          </div>
        </div>
      </div>

      {/* Submit screenshot */}
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-2 text-lg font-bold"><Upload className="h-5 w-5 text-amber-400" /> Submit Referral Proof</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Apne refer kiye hue Banday ka screenshot upload karo (channel follow proof). Admin verify karke <b className="text-emerald-400">Rs. {settings?.referral_reward ?? 2}</b> add karega. Approved: <b>{approvedCount}</b> / {settings?.max_referrals_per_user ?? 100}
        </p>
        <div className="mt-3 grid gap-3">
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground file:font-semibold" />
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note (refer kis ka? username/number)" />
          <Button onClick={submit} disabled={busy || !file} variant="cool">{busy ? "Uploading..." : "Submit Proof"}</Button>
        </div>
      </div>

      {/* History */}
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <div className="text-lg font-bold">My Submissions</div>
        {subs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Koi submission nahi.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {subs.map(s => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border bg-background/50 p-3 text-sm">
                <a href={s.screenshot_url} target="_blank" rel="noreferrer">
                  <img src={s.screenshot_url} alt="" className="h-12 w-12 rounded object-cover ring-1 ring-border" />
                </a>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                  {s.admin_note && <div className="text-xs">Note: {s.admin_note}</div>}
                </div>
                {s.status === "pending" && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-400 ring-1 ring-amber-500/40"><Clock className="h-3 w-3" /> Pending</span>}
                {s.status === "approved" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/40"><CheckCircle2 className="h-3 w-3" /> +Rs.{s.reward_pkr}</span>}
                {s.status === "rejected" && <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-400 ring-1 ring-red-500/40"><XCircle className="h-3 w-3" /> Rejected</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
