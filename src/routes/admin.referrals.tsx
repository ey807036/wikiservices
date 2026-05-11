import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/referrals")({ component: AdminReferrals });

type Sub = {
  id: string; user_id: string; status: "pending" | "approved" | "rejected";
  reward_pkr: number; admin_note: string | null; note: string | null;
  screenshot_url: string; created_at: string;
};
type Settings = {
  referral_reward: number; max_referrals_per_user: number;
  promo_code: string; promo_amount: number; max_promo_per_user: number;
};

function AdminReferrals() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Settings | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const load = async () => {
    const { data } = await supabase.from("referral_submissions").select("*").order("created_at", { ascending: false });
    setSubs((data ?? []) as Sub[]);
    const ids = Array.from(new Set((data ?? []).map((d: any) => d.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,email").in("id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { map[p.id] = p.email; });
      setEmails(map);
    }
    const { data: st } = await supabase.from("referral_settings").select("*").eq("id", 1).maybeSingle();
    setSettings(st as Settings | null);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Sub>) => {
    const { error } = await supabase.from("referral_submissions").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const saveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from("referral_settings").update(settings).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  const view = subs.filter(s => filter === "all" || s.status === filter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Referral Settings</h1>
        {settings && (
          <div className="mt-3 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm">Reward per referral (Rs)
              <Input type="number" value={settings.referral_reward} onChange={e => setSettings({ ...settings, referral_reward: Number(e.target.value) })} />
            </label>
            <label className="text-sm">Max referrals per user
              <Input type="number" value={settings.max_referrals_per_user} onChange={e => setSettings({ ...settings, max_referrals_per_user: Number(e.target.value) })} />
            </label>
            <label className="text-sm">Promo code
              <Input value={settings.promo_code} onChange={e => setSettings({ ...settings, promo_code: e.target.value })} />
            </label>
            <label className="text-sm">Promo amount (Rs)
              <Input type="number" value={settings.promo_amount} onChange={e => setSettings({ ...settings, promo_amount: Number(e.target.value) })} />
            </label>
            <label className="text-sm">Max promo uses per user
              <Input type="number" value={settings.max_promo_per_user} onChange={e => setSettings({ ...settings, max_promo_per_user: Number(e.target.value) })} />
            </label>
            <div className="flex items-end"><Button onClick={saveSettings}>Save Settings</Button></div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Referral Submissions</h2>
          <div className="flex gap-1">
            {(["pending", "approved", "rejected", "all"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {view.length === 0 && <p className="text-sm text-muted-foreground">No submissions.</p>}
          {view.map(s => (
            <div key={s.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row">
              <a href={s.screenshot_url} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={s.screenshot_url} alt="" className="h-28 w-28 rounded object-cover ring-1 ring-border" />
              </a>
              <div className="flex-1 text-sm">
                <div className="font-semibold">{emails[s.user_id] ?? s.user_id}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                {s.note && <div className="mt-1">User note: {s.note}</div>}
                <div className="mt-1">Status: <b>{s.status}</b> {s.reward_pkr > 0 && `· Rs.${s.reward_pkr}`}</div>
                <Input className="mt-2" placeholder="Admin note (optional)" defaultValue={s.admin_note ?? ""}
                  onBlur={e => e.target.value !== (s.admin_note ?? "") && update(s.id, { admin_note: e.target.value })} />
              </div>
              {s.status === "pending" && (
                <div className="flex shrink-0 flex-col gap-2">
                  <Button size="sm" onClick={() => update(s.id, { status: "approved", reward_pkr: settings?.referral_reward ?? 2 })}>Approve +Rs.{settings?.referral_reward ?? 2}</Button>
                  <Button size="sm" variant="destructive" onClick={() => update(s.id, { status: "rejected" })}>Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
