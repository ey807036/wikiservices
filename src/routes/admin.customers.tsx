import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

function AdminCustomers() {
  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: orders } = await supabase.from("orders").select("user_id, total");
      const counts = new Map<string, { c: number; t: number }>();
      (orders ?? []).forEach(o => {
        if (!o.user_id) return;
        const cur = counts.get(o.user_id) ?? { c: 0, t: 0 };
        counts.set(o.user_id, { c: cur.c + 1, t: cur.t + Number(o.total) });
      });
      return (profiles ?? []).map(p => ({ ...p, ...(counts.get(p.id) ?? { c: 0, t: 0 }) }));
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Orders</th><th className="p-3">Spent</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{c.email}</td>
                <td className="p-3">{c.c}</td>
                <td className="p-3 font-semibold">{money(c.t)}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
