import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, Coins, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/lucky")({ component: AdminLucky });

function todayPK() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function AdminLucky() {
  const today = todayPK();
  const qc = useQueryClient();
  const [picking, setPicking] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["adm-lucky-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("lucky_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["adm-lucky-entries", today],
    queryFn: async () => {
      const { data } = await supabase
        .from("lucky_entries")
        .select("*")
        .eq("draw_date", today)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: winners = [] } = useQuery({
    queryKey: ["adm-lucky-winners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lucky_winners")
        .select("*, lucky_entries(name, phone)")
        .order("draw_date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["adm-withdrawals"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const setPrize = useMutation({
    mutationFn: async (amount: number) => {
      const { error } = await supabase.from("lucky_settings").upsert({ id: 1, prize_amount: amount, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Prize amount updated"); qc.invalidateQueries({ queryKey: ["adm-lucky-settings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const pickWinner = async () => {
    if (!entries.length) return toast.error("Aaj koi entry nahi hai");
    setPicking(true);
    try {
      const random = entries[Math.floor(Math.random() * entries.length)];
      const prize = settings?.prize_amount ?? 2;
      const { error } = await supabase.from("lucky_winners").insert({
        draw_date: today,
        entry_id: random.id,
        user_id: random.user_id,
        prize_amount: prize,
      });
      if (error) throw error;
      toast.success(`Winner: ${random.name} 🏆`);
      qc.invalidateQueries({ queryKey: ["adm-lucky-winners"] });
    } catch (e: any) {
      toast.error(e.message || "Pick failed");
    } finally {
      setPicking(false);
    }
  };

  const updateWithdrawal = async (id: string, status: string) => {
    const { error } = await supabase.from("withdrawal_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["adm-withdrawals"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lucky Draw</h1>
        <p className="text-muted-foreground">Set prize amount, pick winner, manage withdrawals.</p>
      </div>

      {/* Prize amount */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3"><Coins className="h-5 w-5 text-yellow-500" /><h2 className="font-bold">Per-winner Prize Amount</h2></div>
        <div className="flex flex-wrap gap-2">
          {[2, 5, 10].map(v => (
            <Button
              key={v}
              variant={settings?.prize_amount === v ? "default" : "outline"}
              onClick={() => setPrize.mutate(v)}
              disabled={setPrize.isPending}
            >
              Rs. {v}
            </Button>
          ))}
          <span className="text-sm text-muted-foreground self-center ml-2">Current: <b>Rs. {settings?.prize_amount ?? 2}</b></span>
        </div>
      </div>

      {/* Today's entries + pick winner */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-red-500" /><h2 className="font-bold">Today ({today}) — {entries.length} entries</h2></div>
          <Button onClick={pickWinner} disabled={picking || !entries.length}>
            {picking ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Pick Random Winner
          </Button>
        </div>
        <div className="max-h-72 overflow-auto rounded-lg border divide-y">
          {entries.length === 0 && <div className="p-3 text-sm text-muted-foreground text-center">No entries yet</div>}
          {entries.map((e, i) => (
            <div key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span>#{i + 1} <b>{e.name}</b></span>
              <span className="text-muted-foreground font-mono text-xs">{e.phone}</span>
              <span className="text-xs">Rs. {e.amount}</span>
              <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Past winners */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-bold mb-3">Recent Winners</h2>
        <div className="space-y-2">
          {winners.length === 0 && <div className="text-sm text-muted-foreground">No winners yet</div>}
          {winners.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{w.draw_date}</span>
              <span className="font-bold">{w.lucky_entries?.name || "—"}</span>
              <span className="font-mono text-xs">{w.lucky_entries?.phone || ""}</span>
              <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:text-yellow-300">Rs. {w.prize_amount}</span>
              <span className="text-xs">{w.claimed ? "✅ Claimed" : "⏳ Pending"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawals */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-bold mb-3">Withdrawal Requests</h2>
        <div className="space-y-2">
          {withdrawals.length === 0 && <div className="text-sm text-muted-foreground">No withdrawal requests</div>}
          {withdrawals.map((w: any) => (
            <div key={w.id} className="rounded-lg border p-3 text-sm space-y-1">
              <div className="flex justify-between"><b>{w.account_name}</b><span className="font-mono text-xs">Rs. {w.amount}</span></div>
              <div className="text-xs text-muted-foreground">{w.method} · {w.account_number} {w.bank_name && `· ${w.bank_name}`}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant={w.status === "approved" ? "default" : "outline"} onClick={() => updateWithdrawal(w.id, "approved")}>Approve</Button>
                <Button size="sm" variant={w.status === "paid" ? "default" : "outline"} onClick={() => updateWithdrawal(w.id, "paid")}>Mark Paid</Button>
                <Button size="sm" variant={w.status === "rejected" ? "destructive" : "outline"} onClick={() => updateWithdrawal(w.id, "rejected")}>Reject</Button>
                <span className="ml-auto text-xs uppercase tracking-widest text-muted-foreground self-center">{w.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
