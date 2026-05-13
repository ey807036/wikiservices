import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createPayfastCheckout } from "@/lib/payfast.functions";

type Props = {
  amount: number;
  purpose: string;
  basketPrefix?: string;
  buttonLabel?: string;
};

export function PayfastCheckout({ amount, purpose, basketPrefix = "ORD", buttonLabel }: Props) {
  const checkout = useServerFn(createPayfastCheckout);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const total = amount + 1;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Naam aur mobile number zaroori hain");
      return;
    }
    setLoading(true);
    try {
      const basketId = `${basketPrefix}-${Date.now()}`;
      const res = await checkout({
        data: {
          amount,
          basketId,
          customerName: name.trim(),
          customerEmail: email.trim() || "customer@wikiservices.app",
          customerMobile: phone.trim(),
          purpose,
        },
      });
      if (!res.ok) {
        toast.error(res.error || "PayFast token failed");
        setLoading(false);
        return;
      }
      // Build & submit form to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.checkoutUrl;
      form.target = "_self";
      Object.entries(res.fields).forEach(([k, v]) => {
        const i = document.createElement("input");
        i.type = "hidden";
        i.name = k;
        i.value = String(v);
        form.appendChild(i);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      toast.error(err?.message || "Network error");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border-2 border-red-500/50 bg-card/70 p-5 backdrop-blur shadow-[0_0_30px_oklch(0.65_0.25_25/0.4)]">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-yellow-300">
        <CreditCard className="h-4 w-4" /> Pay with PayFast
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Apna Naam" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/60 border-red-500/40" />
        <Input placeholder="Mobile (03XXXXXXXXX)" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background/60 border-red-500/40" />
      </div>
      <Input placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/60 border-red-500/40" />

      <div className="rounded-lg bg-black/60 p-3 text-xs text-red-100/80 ring-1 ring-red-500/30 space-y-1">
        <div className="flex justify-between"><span>Amount</span><b>Rs. {amount}</b></div>
        <div className="flex justify-between"><span>Service Tax</span><b>Rs. 1</b></div>
        <div className="flex justify-between border-t border-red-500/30 pt-1 text-yellow-300"><span>Total</span><b>Rs. {total}</b></div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_20px_oklch(0.65_0.25_25/0.7)]">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
        {loading ? "Connecting…" : (buttonLabel || `Pay Rs.${total} via PayFast`)}
      </Button>
      <p className="text-[10px] text-center text-red-200/60 uppercase tracking-widest">
        Easypaisa · JazzCash · Bank · Card · Approve karein, payment auto confirm hogi
      </p>
    </form>
  );
}
