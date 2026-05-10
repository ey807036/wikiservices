import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products, profiles] = await Promise.all([
        supabase.from("orders").select("total, created_at, status"),
        supabase.from("products").select("id"),
        supabase.from("profiles").select("id"),
      ]);
      const o = orders.data ?? [];
      const revenue = o.filter(x => x.status !== "cancelled").reduce((s, x) => s + Number(x.total), 0);
      // last 7 days
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days[d.toISOString().slice(0, 10)] = 0;
      }
      o.forEach(x => {
        const k = new Date(x.created_at).toISOString().slice(0, 10);
        if (k in days) days[k] += Number(x.total);
      });
      const chart = Object.entries(days).map(([d, v]) => ({ day: d.slice(5), revenue: +v.toFixed(2) }));
      return {
        revenue, orders: o.length, products: products.data?.length ?? 0, customers: profiles.data?.length ?? 0, chart,
      };
    },
  });

  const { data: recent = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Revenue", value: `$${(stats?.revenue ?? 0).toFixed(2)}`, icon: DollarSign, c: "text-success" },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingBag, c: "text-primary" },
    { label: "Products", value: stats?.products ?? 0, icon: Package, c: "text-accent" },
    { label: "Customers", value: stats?.customers ?? 0, icon: Users, c: "text-chart-4" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening with your store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <c.icon className={`h-5 w-5 ${c.c}`} />
            </div>
            <div className="mt-2 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Revenue (last 7 days)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={stats?.chart ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Recent orders</h2>
          <div className="space-y-3">
            {recent.length === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
            {recent.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="text-sm font-medium">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_name}</div>
                </div>
                <div className="text-sm font-semibold">${money(o.total)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
