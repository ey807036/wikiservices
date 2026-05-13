import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payfast-result")({
  validateSearch: (s: Record<string, unknown>) => ({
    status: typeof s.status === "string" ? s.status : "unknown",
    basket: typeof s.basket === "string" ? s.basket : "",
    err_code: typeof s.err_code === "string" ? s.err_code : "",
    err_msg: typeof s.err_msg === "string" ? s.err_msg : "",
  }),
  component: PayfastResult,
});

function PayfastResult() {
  const { status, basket, err_msg } = Route.useSearch();
  const success = status === "success" || status === "00";
  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-4">
      <div className={`max-w-md w-full rounded-2xl border-2 p-6 text-center ${success ? "border-emerald-500/60 bg-emerald-950/30" : "border-red-500/60 bg-red-950/30"}`}>
        <div className="text-5xl mb-3">{success ? "✅" : "❌"}</div>
        <h1 className="text-2xl font-black uppercase">{success ? "Payment Successful" : "Payment Failed"}</h1>
        <p className="mt-2 text-sm text-white/70">Basket: <span className="font-mono">{basket || "—"}</span></p>
        {!success && err_msg && <p className="mt-2 text-xs text-red-300">{err_msg}</p>}
        <Link to="/" className="mt-6 inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-widest">Back Home</Link>
      </div>
    </div>
  );
}
