import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

const COLORS = ["var(--primary)", "var(--accent)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--destructive)"];

function Reports() {
  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const [orders, items, products] = await Promise.all([
        supabase.from("orders").select("total, status, payment_method, created_at"),
        supabase.from("order_items").select("product_name, quantity, subtotal"),
        supabase.from("products").select("name, stock, price"),
      ]);
      const o = orders.data ?? [];
      const it = items.data ?? [];
      const p = products.data ?? [];

      // Status breakdown
      const statusMap: Record<string, number> = {};
      o.forEach(x => { statusMap[x.status] = (statusMap[x.status] ?? 0) + 1; });
      const status = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      // Payment methods
      const payMap: Record<string, number> = {};
      o.forEach(x => { payMap[x.payment_method] = (payMap[x.payment_method] ?? 0) + Number(x.total); });
      const payments = Object.entries(payMap).map(([name, value]) => ({ name, value: +Number(value).toFixed(0) }));

      // Top products
      const prodMap: Record<string, { qty: number; revenue: number }> = {};
      it.forEach(x => {
        if (!prodMap[x.product_name]) prodMap[x.product_name] = { qty: 0, revenue: 0 };
        prodMap[x.product_name].qty += x.quantity;
        prodMap[x.product_name].revenue += Number(x.subtotal);
      });
      const top = Object.entries(prodMap)
        .map(([name, v]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, qty: v.qty, revenue: +v.revenue.toFixed(0) }))
        .sort((a, b) => b.revenue - a.revenue).slice(0, 8);

      // Monthly revenue (last 6 months)
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        months[d.toISOString().slice(0, 7)] = 0;
      }
      o.forEach(x => {
        const k = new Date(x.created_at).toISOString().slice(0, 7);
        if (k in months && x.status !== "cancelled") months[k] += Number(x.total);
      });
      const monthly = Object.entries(months).map(([m, v]) => ({ month: m.slice(5), revenue: +Number(v).toFixed(0) }));

      // Inventory stats
      const lowStock = p.filter(x => x.stock > 0 && x.stock <= 5).length;
      const outOfStock = p.filter(x => x.stock === 0).length;
      const inventoryValue = p.reduce((s, x) => s + Number(x.price) * x.stock, 0);

      return { status, payments, top, monthly, lowStock, outOfStock, inventoryValue };
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      <p className="text-sm text-muted-foreground">Deep-dive into store performance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Inventory value" value={money(data?.inventoryValue ?? 0)} />
        <Stat label="Low stock items" value={String(data?.lowStock ?? 0)} tone="warn" />
        <Stat label="Out of stock" value={String(data?.outOfStock ?? 0)} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Revenue (last 6 months)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.monthly ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Order status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data?.status ?? []} dataKey="value" nameKey="name" outerRadius={90} label>
                {(data?.status ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top selling products" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.top ?? []} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={150} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue by payment method" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.payments ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "danger" }) {
  const color = tone === "warn" ? "text-yellow-500" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-6 ${className}`}>
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </div>
  );
}
