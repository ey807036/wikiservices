import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";
import { money } from "@/lib/format";

export const Route = createFileRoute("/account")({ component: Account });

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/15 text-primary",
  processing: "bg-accent/20 text-accent",
  shipped: "bg-chart-4/20 text-chart-4",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <button onClick={() => signOut()} className="text-sm text-muted-foreground hover:text-destructive">Sign out</button>
      </div>

      <h2 className="mt-10 text-xl font-bold">Order history</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
          <Link to="/shop" className="mt-3 inline-block text-primary font-medium">Start shopping →</Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span>
                <div className="font-bold">${money(o.total)}</div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {o.order_items?.map((i: any) => (
                  <div key={i.id} className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary/50 p-2 pr-3 text-xs">
                    {i.product_image && <img src={i.product_image} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <div className="font-medium line-clamp-1">{i.product_name}</div>
                      <div className="text-muted-foreground">×{i.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
