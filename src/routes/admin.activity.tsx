import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, ShoppingBag, Coins, Store } from "lucide-react";

export const Route = createFileRoute("/admin/activity")({ component: AdminActivity });

function AdminActivity() {
  const { data: orders = [] } = useQuery({
    queryKey: ["adm-act-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const { data: storeOrders = [] } = useQuery({
    queryKey: ["adm-act-store"],
    queryFn: async () => {
      const { data } = await supabase.from("store_orders").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const { data: lucky = [] } = useQuery({
    queryKey: ["adm-act-lucky"],
    queryFn: async () => {
      const { data } = await supabase.from("lucky_entries").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ["adm-act-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, email, full_name, phone").limit(500);
      return data ?? [];
    },
  });

  const profileMap = new Map(profiles.map(p => [p.id, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" /> User Activity</h1>
        <p className="text-muted-foreground">Saare users ki purchases — orders, lucky entries, store orders, sab ek jagah.</p>
      </div>

      <Section title="Shop Orders (COD/PayFast)" icon={<ShoppingBag className="h-5 w-5" />} count={orders.length}>
        {orders.map((o: any) => (
          <Row key={o.id}
            who={o.customer_name || profileMap.get(o.user_id)?.full_name || "Guest"}
            email={o.customer_email}
            phone={o.customer_phone}
            item={`Order #${o.order_number}`}
            amount={Number(o.total)}
            status={o.status}
            when={o.created_at}
          />
        ))}
      </Section>

      <Section title="Wiki Store Orders" icon={<Store className="h-5 w-5" />} count={storeOrders.length}>
        {storeOrders.map((o: any) => (
          <Row key={o.id}
            who={o.customer_name}
            email={o.customer_email}
            phone={o.customer_phone}
            item={`Store · ${(o.items || []).length} items`}
            amount={Number(o.total)}
            status={o.status}
            when={o.created_at}
          />
        ))}
      </Section>

      <Section title="Lucky Draw Entries" icon={<Coins className="h-5 w-5" />} count={lucky.length}>
        {lucky.map((l: any) => (
          <Row key={l.id}
            who={l.name}
            email={l.email}
            phone={l.phone}
            item={`Lucky Draw · ${l.draw_date}`}
            amount={Number(l.amount)}
            status="paid"
            when={l.created_at}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: any; count: number; children: any }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2 font-bold">{icon} {title}</div>
        <span className="text-xs text-muted-foreground">{count} records</span>
      </div>
      <div className="divide-y max-h-96 overflow-auto">
        {count === 0 ? <div className="p-4 text-sm text-muted-foreground text-center">No records</div> : children}
      </div>
    </div>
  );
}

function Row({ who, email, phone, item, amount, status, when }: any) {
  return (
    <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-sm items-center">
      <div className="col-span-3"><b>{who}</b><div className="text-xs text-muted-foreground truncate">{email}</div></div>
      <div className="col-span-2 font-mono text-xs">{phone}</div>
      <div className="col-span-3 truncate">{item}</div>
      <div className="col-span-1 font-bold">Rs. {amount}</div>
      <div className="col-span-1"><span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase">{status}</span></div>
      <div className="col-span-2 text-xs text-muted-foreground text-right">{new Date(when).toLocaleString()}</div>
    </div>
  );
}
