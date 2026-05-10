import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadOrders, PAY_LABEL, type SavedOrder } from "@/lib/order-history";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, ScrollText, Inbox } from "lucide-react";

export const Route = createFileRoute("/my-orders")({ component: MyOrders });

function MyOrders() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  useEffect(() => { setOrders(loadOrders()); }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/40">
          <ScrollText className="h-4 w-4" /> ORDER HISTORY
        </span>
        <h1 className="mt-3 text-3xl font-black uppercase md:text-4xl">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No orders yet.</p>
          <Link to="/" className="mt-5 inline-block">
            <Button variant="cool" className="btn-neon rounded-full">Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to="/receipt"
                search={{ id: o.id }}
                className="card-hack block rounded-2xl border bg-card p-5 shadow-card transition hover:border-primary/60"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Package className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold">{o.item}</h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">{o.id}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()} • {PAY_LABEL[o.payment] ?? o.payment} • {o.city}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 self-center text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
