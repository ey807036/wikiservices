import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, MessageCircle, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NeonVideoCircle, VideoPreloader } from "@/components/site/neon-video-circle";

export const Route = createFileRoute("/payfast-result")({
  head: () => ({ meta: [{ title: "Payment Result — Wiki Services" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    status: typeof s.status === "string" ? s.status : "unknown",
    basket: typeof s.basket === "string" ? s.basket : "",
    amount: typeof s.amount === "string" ? s.amount : "",
    txn: typeof s.txn === "string" ? s.txn : "",
    err_code: typeof s.err_code === "string" ? s.err_code : "",
    err_msg: typeof s.err_msg === "string" ? s.err_msg : "",
  }),
  component: PayfastResult,
});

function PayfastResult() {
  const { status, basket, amount, txn, err_code, err_msg } = Route.useSearch();
  const success = status === "success";
  const pending = status === "pending" || status === "ipn" || status === "unknown";

  const [waLink, setWaLink] = useState<string>("");
  const [intent, setIntent] = useState<any>(null);
  const [dbWritten, setDbWritten] = useState<"lucky" | "store" | null>(null);
  const [showFailVideo, setShowFailVideo] = useState(false);

  useEffect(() => {
    if (!success && !pending) setShowFailVideo(true);
  }, [success, pending]);

  useEffect(() => {
    if (!basket) return;
    let cancelled = false;
    (async () => {
      try {
        const log = JSON.parse(localStorage.getItem("payfast_intents") || "[]");
        const found = log.find((x: any) => x.basketId === basket);
        if (!found) return;
        if (cancelled) return;
        setIntent(found);

        if (!success) return;

        // ----- Persist to DB based on intent type -----
        const writtenKey = `payfast_db_written_${basket}`;
        const already = localStorage.getItem(writtenKey);

        if (found.intentType === "lucky" && !already) {
          const { error } = await supabase.from("lucky_entries").insert({
            user_id: found.userId,
            name: found.name,
            phone: found.phone,
            email: found.email || null,
            amount: found.amount,
            basket_id: basket,
          });
          if (!error) {
            localStorage.setItem(writtenKey, "1");
            setDbWritten("lucky");
          }
        } else if (found.intentType === "store" && !already) {
          const items = found.intentPayload?.items || [];
          const { error } = await supabase.from("store_orders").insert({
            user_id: found.userId,
            customer_name: found.name,
            customer_phone: found.phone,
            customer_email: found.email || null,
            shipping_address: found.orderAddress,
            shipping_city: found.orderCity,
            items,
            subtotal: found.amount,
            tax: 1,
            total: found.total,
            payment_basket: basket,
            payment_status: "paid",
            status: "placed",
          });
          if (!error) {
            localStorage.setItem(writtenKey, "1");
            setDbWritten("store");
          }
        }

        // WhatsApp redirect ONLY if not lucky-draw
        if (found.intentType !== "lucky" && found.whatsappAfter) {
          setWaLink(found.whatsappAfter);
          const t = setTimeout(() => {
            try { window.open(found.whatsappAfter, "_blank", "noopener"); } catch {}
          }, 1500);
          return () => clearTimeout(t);
        }
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [basket, success]);

  const tone = success
    ? { ring: "border-emerald-500/60 bg-emerald-950/30", icon: <CheckCircle2 className="h-14 w-14 text-emerald-400" />, label: "Payment Successful" }
    : pending
    ? { ring: "border-yellow-500/60 bg-yellow-950/30", icon: <Clock className="h-14 w-14 text-yellow-400" />, label: "Payment Pending" }
    : { ring: "border-red-500/60 bg-red-950/30", icon: <XCircle className="h-14 w-14 text-red-400" />, label: "Payment Failed" };

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-4 py-10">
      <VideoPreloader sources={["/videos/payment-fail.mp4"]} />
      {showFailVideo && <NeonVideoCircle src="/videos/payment-fail.mp4" onEnd={() => setShowFailVideo(false)} />}
      <div className={`max-w-md w-full rounded-2xl border-2 p-6 text-center shadow-[0_0_40px_oklch(0.65_0.25_25/0.35)] ${tone.ring}`}>
        <div className="flex justify-center mb-3">{tone.icon}</div>
        <h1 className="text-2xl font-black uppercase tracking-wider">{tone.label}</h1>

        <dl className="mt-4 space-y-1.5 text-sm text-white/80 text-left">
          {basket && <Row k="Order ID" v={basket} mono />}
          {txn && <Row k="Txn Ref" v={txn} mono />}
          {(amount || intent?.total) && <Row k="Amount" v={`Rs. ${amount || intent?.total}`} />}
          {intent?.purpose && <Row k="Item" v={intent.purpose} />}
          {intent?.name && <Row k="Customer" v={intent.name} />}
          {err_code && <Row k="Code" v={err_code} mono />}
          {err_msg && <Row k="Message" v={err_msg} />}
        </dl>

        {success && intent?.intentType === "lucky" && (
          <div className="mt-5 rounded-xl border-2 border-yellow-400/60 bg-yellow-950/40 p-4 text-yellow-100">
            <Trophy className="h-6 w-6 mx-auto text-yellow-300 mb-1" />
            <p className="text-sm font-bold">Aap ka naam aaj ki Lucky Draw list mae shamil ho gaya hai!</p>
            <p className="text-[11px] text-yellow-200/70 mt-1">Raat 10:00 PM ko Quran-andazi se winner select hoga.</p>
            <Link to="/lucky-draw" className="mt-3 inline-block text-xs font-bold underline text-yellow-200">View Live Participants →</Link>
          </div>
        )}

        {success && waLink && intent?.intentType !== "lucky" && (
          <a href={waLink} target="_blank" rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_18px_oklch(0.7_0.2_150/0.7)]">
            <MessageCircle className="h-4 w-4" /> WhatsApp par confirm karein
          </a>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/" className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-bold uppercase tracking-widest">
            Back Home
          </Link>
          {success && (
            <Link to="/my-orders" className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-sm font-bold uppercase tracking-widest">
              My Orders
            </Link>
          )}
          {!success && !pending && (
            <Link to="/lucky-draw" className="rounded-full bg-red-600 hover:bg-red-500 px-5 py-2 text-sm font-bold uppercase tracking-widest">
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/10 pb-1">
      <dt className="text-white/50">{k}</dt>
      <dd className={`text-right break-all ${mono ? "font-mono" : ""}`}>{v}</dd>
    </div>
  );
}
