import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products, profiles] = await Promise.all([
        supabase.from("orders").select("total, created_at, status"),
        supabase.from("products").select("id, name, stock"),
        supabase.from("profiles").select("id"),
      ]);
      const o = orders.data ?? [];
      const p = products.data ?? [];
      const revenue = o.filter(x => x.status !== "cancelled").reduce((s, x) => s + Number(x.total), 0);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

      const todayRevenue = o.filter(x => new Date(x.created_at) >= today && x.status !== "cancelled").reduce((s, x) => s + Number(x.total), 0);
      const weekRevenue = o.filter(x => new Date(x.created_at) >= weekAgo && x.status !== "cancelled").reduce((s, x) => s + Number(x.total), 0);
      const pending = o.filter(x => x.status === "pending").length;
      const completed = o.filter(x => x.status === "delivered").length;
      const lowStock = p.filter(x => x.stock > 0 && x.stock <= 5);
      const outOfStock = p.filter(x => x.stock === 0).length;
      const aov = o.length ? revenue / o.length : 0;

      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days[d.toISOString().slice(0, 10)] = 0;
      }
      o.forEach(x => {
        const k = new Date(x.created_at).toISOString().slice(0, 10);
        if (k in days && x.status !== "cancelled") days[k] += Number(x.total);
      });
      const chart = Object.entries(days).map(([d, v]) => ({ day: d.slice(5), revenue: +v.toFixed(2) }));

      return {
        revenue, orders: o.length, products: p.length, customers: profiles.data?.length ?? 0,
        chart, todayRevenue, weekRevenue, pending, completed, lowStock, outOfStock, aov,
      };
    },
  });

  const { data: recent = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Total Revenue", value: money(stats?.revenue ?? 0), icon: DollarSign, c: "text-success" },
    { label: "Today", value: money(stats?.todayRevenue ?? 0), icon: TrendingUp, c: "text-primary" },
    { label: "This week", value: money(stats?.weekRevenue ?? 0), icon: TrendingUp, c: "text-accent" },
    { label: "Avg order value", value: money(stats?.aov ?? 0), icon: DollarSign, c: "text-chart-4" },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingBag, c: "text-primary" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, c: "text-yellow-500" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle2, c: "text-success" },
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
              <Link key={o.id} to="/admin/orders" className="flex items-center justify-between border-b pb-2 last:border-0 hover:opacity-80">
                <div>
                  <div className="text-sm font-medium">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_name}</div>
                </div>
                <div className="text-sm font-semibold">{money(o.total)}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold">Stock alerts</h2>
            <span className="text-xs text-muted-foreground">
              {stats?.outOfStock ?? 0} out of stock · {stats?.lowStock?.length ?? 0} low stock
            </span>
          </div>
          {(!stats?.lowStock || stats.lowStock.length === 0) ? (
            <div className="text-sm text-muted-foreground">All products well stocked. ✓</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {stats.lowStock.slice(0, 9).map((p: any) => (
                <Link key={p.id} to="/admin/products" className="flex items-center justify-between rounded-lg border bg-background p-3 hover:bg-secondary/50">
                  <span className="truncate text-sm">{p.name}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-500">
                    {p.stock} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
