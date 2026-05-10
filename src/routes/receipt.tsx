import { createFileRoute, Link } from "@tanstack/react-router";
import { findOrder, PAY_LABEL } from "@/lib/order-history";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, MapPin, Phone, User, CreditCard, Calendar, ArrowRight, Home, ScrollText } from "lucide-react";

export const Route = createFileRoute("/receipt")({
  component: Receipt,
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : "" }),
});

function Receipt() {
  const { id } = Route.useSearch();
  const order = id ? findOrder(id) : undefined;

  if (!order) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Receipt not found</h1>
        <p className="mt-2 text-muted-foreground">This order doesn't exist or was placed on another device.</p>
        <Link to="/" className="mt-6 inline-block"><Button variant="cool" className="btn-neon rounded-full">Back home</Button></Link>
      </div>
    );
  }

  const date = new Date(order.createdAt);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      {/* Success banner */}
      <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--primary)_22%,_transparent),_transparent_60%)]" />
        <div className="relative">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/15 ring-4 ring-primary/30">
            <CheckCircle2 className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="mt-5 text-3xl font-black uppercase md:text-4xl">Order Placed 💀</h1>
          <p className="mt-2 text-sm text-muted-foreground">We'll contact you shortly to confirm your order.</p>
        </div>
      </div>

      {/* Receipt */}
      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Receipt</h2>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-mono font-bold text-primary">{order.id}</span>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <Row icon={Calendar} label="Date" value={date.toLocaleString()} />
          <Row icon={Package} label="Item" value={order.item} highlight />
          <Row icon={User} label="Customer" value={order.name} />
          <Row icon={Phone} label="Phone" value={order.phone} />
          <Row icon={MapPin} label="Address" value={`${order.address}, ${order.city}, ${order.province}`} />
          <Row icon={CreditCard} label="Payment" value={PAY_LABEL[order.payment] ?? order.payment} />
        </dl>

        <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center text-xs text-muted-foreground">
          Save this receipt. Show it on delivery for verification.
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/my-orders">
          <Button variant="outline" className="rounded-full">
            <ScrollText className="mr-2 h-4 w-4" /> My Orders
          </Button>
        </Link>
        <Link to="/">
          <Button variant="cool" className="btn-neon rounded-full">
            <Home className="mr-2 h-4 w-4" /> Back home <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className={highlight ? "mt-0.5 font-bold text-primary" : "mt-0.5 font-medium"}>{value}</dd>
      </div>
    </div>
  );
}
