import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

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

  const tone = success
    ? { ring: "border-emerald-500/60 bg-emerald-950/30", icon: <CheckCircle2 className="h-14 w-14 text-emerald-400" />, label: "Payment Successful" }
    : pending
    ? { ring: "border-yellow-500/60 bg-yellow-950/30", icon: <Clock className="h-14 w-14 text-yellow-400" />, label: "Payment Pending" }
    : { ring: "border-red-500/60 bg-red-950/30", icon: <XCircle className="h-14 w-14 text-red-400" />, label: "Payment Failed" };

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-4 py-10">
      <div className={`max-w-md w-full rounded-2xl border-2 p-6 text-center shadow-[0_0_40px_oklch(0.65_0.25_25/0.35)] ${tone.ring}`}>
        <div className="flex justify-center mb-3">{tone.icon}</div>
        <h1 className="text-2xl font-black uppercase tracking-wider">{tone.label}</h1>

        <dl className="mt-4 space-y-1.5 text-sm text-white/80 text-left">
          {basket && <Row k="Order ID" v={basket} mono />}
          {txn && <Row k="Txn Ref" v={txn} mono />}
          {amount && <Row k="Amount" v={`Rs. ${amount}`} />}
          {err_code && <Row k="Code" v={err_code} mono />}
          {err_msg && <Row k="Message" v={err_msg} />}
        </dl>

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/" className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-bold uppercase tracking-widest">
            Back Home
          </Link>
          {!success && (
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
