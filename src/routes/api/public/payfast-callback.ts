import { createFileRoute } from "@tanstack/react-router";

/**
 * PayFast posts the user back here after checkout (or sends an IPN).
 * We normalize the various field names PayFast may send and forward
 * the user to /payfast-result with clean query params.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function normalize(params: URLSearchParams): URLSearchParams {
  const out = new URLSearchParams();
  // Status: prefer explicit `status`, then err_code/ResponseCode mapping
  let status = params.get("status") || "";
  const errCode = params.get("err_code") || params.get("ResponseCode") || params.get("RC") || "";
  const errMsg = params.get("err_msg") || params.get("ResponseMessage") || params.get("Description") || "";
  if (!status) {
    if (errCode === "000" || errCode === "00") status = "success";
    else if (errCode) status = "failed";
    else status = "unknown";
  }
  out.set("status", status);
  if (errCode) out.set("err_code", errCode);
  if (errMsg) out.set("err_msg", errMsg);

  const basket = params.get("basket") || params.get("BasketID") || params.get("BASKET_ID") || params.get("OrderID") || params.get("ORDER_ID") || "";
  if (basket) out.set("basket", basket);

  const amt = params.get("TXNAMT") || params.get("Amount") || params.get("amount") || "";
  if (amt) out.set("amount", amt);

  const txn = params.get("TransactionID") || params.get("transaction_id") || params.get("RefNo") || "";
  if (txn) out.set("txn", txn);

  return out;
}

export const Route = createFileRoute("/api/public/payfast-callback")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      GET: async ({ request }) => {
        const url = new URL(request.url);
        const params = normalize(url.searchParams);
        console.info("[payfast-callback GET]", params.toString());
        return new Response(null, {
          status: 302,
          headers: { Location: `/payfast-result?${params.toString()}`, ...CORS },
        });
      },

      POST: async ({ request }) => {
        const url = new URL(request.url);
        const merged = new URLSearchParams(url.search);
        try {
          const ct = request.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await request.json().catch(() => ({}));
            Object.entries(j as Record<string, unknown>).forEach(([k, v]) => merged.set(k, String(v)));
          } else {
            const text = await request.text().catch(() => "");
            const body = new URLSearchParams(text);
            body.forEach((v, k) => merged.set(k, v));
          }
        } catch (e) {
          console.error("[payfast-callback POST] parse error", e);
        }
        const params = normalize(merged);
        console.info("[payfast-callback POST]", params.toString());
        return new Response(null, {
          status: 303,
          headers: { Location: `/payfast-result?${params.toString()}`, ...CORS },
        });
      },
    },
  },
});
