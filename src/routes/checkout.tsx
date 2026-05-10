import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Banknote } from "lucide-react";
import { money, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, TAX_RATE } from "@/lib/format";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const discount = coupon?.discount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = discountedSubtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const tax = Math.round(discountedSubtotal * TAX_RATE);
  const total = Math.round(discountedSubtotal + shipping + tax);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", email: user?.email ?? "", phone: "", address: "", city: "", postal: "", country: "Pakistan", notes: "",
  });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    const { data } = await supabase.from("coupons").select("*").eq("code", code).eq("active", true).maybeSingle();
    setCouponLoading(false);
    if (!data) { toast.error("Invalid coupon"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Coupon expired"); return; }
    if (Number(subtotal) < Number(data.min_subtotal)) { toast.error(`Min subtotal ${money(data.min_subtotal)}`); return; }
    const value = Number(data.discount_value);
    const d = data.discount_type === "percent" ? +(subtotal * value / 100).toFixed(2) : value;
    setCoupon({ code: data.code, discount: d });
    toast.success(`Coupon ${data.code} applied`);
  };

  if (items.length === 0) {
    return <div className="container mx-auto px-4 py-20 text-center">Your cart is empty. <Link to="/shop" className="text-primary">Shop now</Link></div>;
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to place an order"); navigate({ to: "/auth" }); return; }
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      toast.error("Please fill in all required fields"); return;
    }
    setSubmitting(true);
    try {
      const { data: order, error: oErr } = await supabase.from("orders").insert({
        user_id: user.id,
        subtotal, shipping, tax, total, discount,
        coupon_code: coupon?.code ?? null,
        payment_method: "cod",
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_postal_code: form.postal,
        shipping_country: form.country,
        notes: form.notes || null,
      }).select().single();
      if (oErr || !order) throw oErr ?? new Error("Failed to create order");

      const itemsPayload = items.map(i => ({
        order_id: order.id, product_id: i.id, product_name: i.name, product_image: i.image,
        unit_price: i.price, quantity: i.quantity, subtotal: i.price * i.quantity,
      }));
      const { error: iErr } = await supabase.from("order_items").insert(itemsPayload);
      if (iErr) throw iErr;

      clear();
      toast.success("Order placed! 🎉");
      navigate({ to: "/account" });
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      {!user && (
        <div className="mt-4 rounded-xl border border-accent bg-accent/10 p-4 text-sm">
          Please <Link to="/auth" className="font-semibold text-accent underline">sign in</Link> to complete your order.
        </div>
      )}
      <form onSubmit={placeOrder} className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">Contact information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Full name *</Label><Input required value={form.name} onChange={e => update("name", e.target.value)} /></div>
              <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={e => update("email", e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Phone *</Label><Input required value={form.phone} onChange={e => update("phone", e.target.value)} /></div>
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Address *</Label><Input required value={form.address} onChange={e => update("address", e.target.value)} /></div>
              <div><Label>City *</Label><Input required value={form.city} onChange={e => update("city", e.target.value)} /></div>
              <div><Label>Postal code</Label><Input value={form.postal} onChange={e => update("postal", e.target.value)} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={e => update("country", e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Order notes</Label><Textarea value={form.notes} onChange={e => update("notes", e.target.value)} /></div>
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">Payment method</h2>
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 flex items-center gap-3">
              <Banknote className="h-6 w-6 text-primary" />
              <div>
                <div className="font-semibold">Cash on Delivery</div>
                <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
              </div>
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border bg-card p-6 h-fit shadow-card">
          <h2 className="text-lg font-bold">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3">
                <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="line-clamp-1 font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                </div>
                <div className="font-semibold">${(i.price * i.quantity).toFixed(2)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            {coupon && (
              <div className="flex justify-between text-accent"><dt>Coupon ({coupon.code})</dt><dd>-${money(discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : `${money(shipping)}`}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{money(tax)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>{money(total)}</dd></div>
          </dl>
          <div className="mt-5 flex gap-2">
            <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
            <Button type="button" variant="outline" onClick={applyCoupon} disabled={couponLoading}>
              {couponLoading ? "..." : "Apply"}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Try <code>WELCOME10</code>, <code>SAVE20</code>, <code>FREESHIP</code></div>
          <Button type="submit" className="mt-6 w-full h-11" disabled={submitting || !user}>
            {submitting ? "Placing order..." : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
