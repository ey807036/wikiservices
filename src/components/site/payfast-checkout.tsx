import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, ShieldCheck, AlertTriangle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { createPayfastCheckout } from "@/lib/payfast.functions";
import { useAuth } from "@/lib/auth-context";
import { saveOrder } from "@/lib/order-history";
import { NeonVideoCircle, VideoPreloader } from "@/components/site/neon-video-circle";

type Props = {
  amount: number;
  purpose: string;
  basketPrefix?: string;
  buttonLabel?: string;
  /** If true, user must be logged in. Shows login prompt otherwise. */
  requireAuth?: boolean;
  /** Hide the name/phone/email inputs (use prefilled values). */
  hideContactFields?: boolean;
  prefillName?: string;
  prefillPhone?: string;
  prefillEmail?: string;
  /** WhatsApp deep link to open after successful payment. */
  whatsappAfter?: string;
  /** Optional address/notes saved to order history. */
  orderAddress?: string;
  orderProvince?: string;
  orderCity?: string;
  /** Persist intent type so result page knows where to record DB row. */
  intentType?: "lucky" | "store" | "generic";
  /** Extra payload (e.g. store cart items) included in the intent. */
  intentPayload?: Record<string, any>;
};

export function PayfastCheckout({
  amount,
  purpose,
  basketPrefix = "ORD",
  buttonLabel,
  requireAuth = false,
  hideContactFields = false,
  prefillName,
  prefillPhone,
  prefillEmail,
  whatsappAfter,
  orderAddress,
  orderProvince,
  orderCity,
  intentType = "generic",
  intentPayload,
}: Props) {
  const checkout = useServerFn(createPayfastCheckout);
  const { user } = useAuth();
  const [name, setName] = useState(prefillName ?? "");
  const [phone, setPhone] = useState(prefillPhone ?? "");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showFailVideo, setShowFailVideo] = useState(false);

  // Sync prefill if it arrives async (e.g. auth context hydrates)
  useEffect(() => {
    if (prefillName && !name) setName(prefillName);
  }, [prefillName]);
  useEffect(() => {
    if (prefillPhone && !phone) setPhone(prefillPhone);
  }, [prefillPhone]);
  useEffect(() => {
    if (prefillEmail && !email) setEmail(prefillEmail);
  }, [prefillEmail]);

  // Auto-fill from auth when requireAuth is on and user logs in
  useEffect(() => {
    if (!user) return;
    const meta: any = user.user_metadata || {};
    if (!name) setName(meta.full_name || meta.name || user.email?.split("@")[0] || "");
    if (!email) setEmail(user.email || "");
    if (!phone && meta.phone) setPhone(String(meta.phone).replace(/\D/g, ""));
  }, [user]);

  useEffect(() => {
    const showReturnFailVideo = () => {
      try {
        const started = Number(sessionStorage.getItem("wiki_payfast_started_at") || "0");
        if (!started || Date.now() - started < 1200) return;
        sessionStorage.removeItem("wiki_payfast_started_at");
        setShowFailVideo(true);
        window.dispatchEvent(
          new CustomEvent("wiki:payment-fail", {
            detail: { reason: "Customer backed out from PayFast" },
          }),
        );
      } catch {}
    };
    window.addEventListener("pageshow", showReturnFailVideo);
    showReturnFailVideo();
    return () => window.removeEventListener("pageshow", showReturnFailVideo);
  }, []);

  const total = amount + 1;

  if (requireAuth && !user) {
    return (
      <div className="space-y-3 rounded-2xl border-2 border-yellow-500/50 bg-card/70 p-5 backdrop-blur shadow-[0_0_30px_oklch(0.85_0.18_85/0.4)] text-center">
        <LogIn className="h-8 w-8 mx-auto text-yellow-300" />
        <p className="text-sm text-yellow-100">
          Pehle login karein taka aap ka naam aur record save ho sake.
        </p>
        <Link
          to="/auth"
          className="inline-flex h-11 items-center justify-center rounded-md bg-gradient-to-r from-yellow-500 to-amber-600 px-6 font-black uppercase tracking-wider text-black shadow-[0_0_18px_oklch(0.85_0.18_85/0.7)]"
        >
          Login / Sign Up
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);

    if (!/^\S+/.test(name.trim())) return setErrMsg("Naam zaroori hai");
    if (!/^\d{10,15}$/.test(phone.trim()))
      return setErrMsg("Mobile sirf digits, 10–15 length (e.g. 03001234567)");
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) return setErrMsg("Email format ghalat hai");

    setLoading(true);
    try {
      const basketId = `${basketPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      // Save order to local order history immediately (status=pending until callback)
      try {
        saveOrder({
          item: `${purpose} (Rs.${total})`,
          name: name.trim(),
          phone: phone.trim(),
          province: orderProvince || "",
          city: orderCity || "",
          address: orderAddress || "",
          payment: "payfast",
        });
      } catch {}

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
        const msg = res.error || "PayFast init failed";
        setErrMsg(msg);
        toast.error(msg);
        setShowFailVideo(true);
        try {
          window.dispatchEvent(new CustomEvent("wiki:payment-fail", { detail: { reason: msg } }));
        } catch {}
        setLoading(false);
        return;
      }

      // Persist intent locally so result page can reconcile, write DB row, & open WA
      try {
        const log = JSON.parse(localStorage.getItem("payfast_intents") || "[]");
        log.unshift({
          basketId,
          amount,
          total: res.total,
          purpose,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          whatsappAfter: intentType === "lucky" ? "" : whatsappAfter || "",
          intentType,
          intentPayload: intentPayload || null,
          userId: user?.id || null,
          orderAddress: orderAddress || "",
          orderCity: orderCity || "",
          orderProvince: orderProvince || "",
          ts: Date.now(),
        });
        localStorage.setItem("payfast_intents", JSON.stringify(log.slice(0, 50)));
      } catch {}

      // Submit hidden form -> PayFast hosted checkout
      try {
        sessionStorage.setItem("wiki_payfast_started_at", String(Date.now()));
      } catch {}
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.checkoutUrl;
      form.acceptCharset = "UTF-8";
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
      const msg = err?.message || "Network error";
      setErrMsg(msg);
      toast.error(msg);
      setShowFailVideo(true);
      try {
        window.dispatchEvent(new CustomEvent("wiki:payment-fail", { detail: { reason: msg } }));
      } catch {}
      setLoading(false);
    }
  };

  return (
    <>
      <VideoPreloader sources={["/videos/payment-fail.mp4"]} />
      {showFailVideo && (
        <NeonVideoCircle src="/videos/payment-fail.mp4" onEnd={() => setShowFailVideo(false)} />
      )}
      <form
        onSubmit={submit}
        className="space-y-3 rounded-2xl border-2 border-red-500/50 bg-card/70 p-5 backdrop-blur shadow-[0_0_30px_oklch(0.65_0.25_25/0.4)]"
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-yellow-300">
          <CreditCard className="h-4 w-4" /> Pay with PayFast
        </div>
        {!hideContactFields && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Apna Naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="bg-background/60 border-red-500/40"
              />
              <Input
                placeholder="Mobile (03XXXXXXXXX)"
                inputMode="numeric"
                pattern="\d{10,15}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                autoComplete="tel"
                required
                className="bg-background/60 border-red-500/40"
              />
            </div>
            <Input
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="bg-background/60 border-red-500/40"
            />
          </>
        )}

        {hideContactFields && (
          <div className="rounded-lg bg-black/40 p-2 text-[11px] text-red-100/80 ring-1 ring-red-500/20">
            <b>{name}</b> · {phone}
            {email ? ` · ${email}` : ""}
          </div>
        )}

        <div className="rounded-lg bg-black/60 p-3 text-xs text-red-100/80 ring-1 ring-red-500/30 space-y-1">
          <div className="flex justify-between">
            <span>Amount</span>
            <b>Rs. {amount}</b>
          </div>
          <div className="flex justify-between">
            <span>Service Tax</span>
            <b>Rs. 1</b>
          </div>
          <div className="flex justify-between border-t border-red-500/30 pt-1 text-yellow-300">
            <span>Total</span>
            <b>Rs. {total}</b>
          </div>
        </div>

        {errMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/60 bg-red-950/50 p-2 text-xs text-red-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="break-words">{errMsg}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_20px_oklch(0.65_0.25_25/0.7)]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <ShieldCheck className="h-4 w-4 mr-1" />
          )}
          {loading ? "Connecting…" : buttonLabel || `Pay Rs.${total} via PayFast`}
        </Button>
        <p className="text-[10px] text-center text-red-200/60 uppercase tracking-widest">
          Easypaisa · JazzCash · Bank · Card · Approve karein, payment auto confirm hogi
        </p>
      </form>
    </>
  );
}
