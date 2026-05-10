import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled"];

function AdminOrders() {
  const qc = useQueryClient();
  const [view, setView] = useState<any | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [],
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No orders yet.</td></tr>}
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-medium">{o.order_number}</td>
                <td className="p-3">
                  <div>{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3 font-semibold">${Number(o.total).toFixed(2)}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-36 capitalize"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setView(o)}><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order {view?.order_number}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold">Customer</div>
                <div>{view.customer_name} · {view.customer_phone}</div>
                <div className="text-muted-foreground">{view.customer_email}</div>
              </div>
              <div>
                <div className="font-semibold">Shipping</div>
                <div className="text-muted-foreground">{view.shipping_address}, {view.shipping_city} {view.shipping_postal_code}, {view.shipping_country}</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Items</div>
                <ul className="space-y-2">
                  {view.order_items?.map((i: any) => (
                    <li key={i.id} className="flex justify-between"><span>{i.product_name} ×{i.quantity}</span><span>${Number(i.subtotal).toFixed(2)}</span></li>
                  ))}
                </ul>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between"><span>Subtotal</span><span>${Number(view.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>${Number(view.shipping).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${Number(view.tax).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>${Number(view.total).toFixed(2)}</span></div>
              </div>
              <div className="text-xs text-muted-foreground">Payment: Cash on Delivery</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
