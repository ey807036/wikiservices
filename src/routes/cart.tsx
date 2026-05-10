import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, remove, setQty, subtotal } = useCart();
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse our shop to find your next upgrade.</p>
        <Link to="/shop"><Button className="mt-6">Continue shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-2xl border bg-card p-4">
              <Link to="/products/$slug" params={{ slug: i.slug }} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link to="/products/$slug" params={{ slug: i.slug }} className="font-semibold hover:text-primary">{i.name}</Link>
                <div className="mt-1 text-sm text-muted-foreground">${money(i.price)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} className="p-2"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} className="p-2"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-bold">${(i.price * i.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border bg-card p-6 h-fit shadow-card">
          <h2 className="text-lg font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>${money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : `${money(shipping)}`}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>${money(total)}</dd></div>
          </dl>
          <Link to="/checkout"><Button className="mt-6 w-full h-11">Proceed to checkout</Button></Link>
          <Link to="/shop" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
