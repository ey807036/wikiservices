import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const BRAND = {
  powered_by: "Wiki Services — SimDatabase API",
  owner: "Wiki Services",
  website: "https://wikiservices.lovable.app",
  whatsapp_contact: "https://wa.me/923186376181",
  whatsapp_channel: "https://whatsapp.com/channel/0029VaXXXXXXXXX",
  note: "Free API by Wiki Services. Agar aap apni website mein use karein to credit dena lazmi hai.",
};

const NOT_FOUND_MESSAGE = {
  ok: false,
  status: "not_found",
  message: "💀 Data Not Found — Yeh number free database mein available nahi hai.",
  details: {
    free_range: "2001 - 2023 (Free SimData)",
    paid_range: "2024 - 2026 (Rs. 500 per number)",
    how_to_get: "Naye number ka data lene k liye WhatsApp par contact karein.",
  },
  contact: {
    whatsapp: "https://wa.me/923186376181?text=Salam!%20Mujhe%20NEW%20SimData%20chahiye%20(2024-2026)%20Rs.%20500.",
    whatsapp_channel: "https://whatsapp.com/channel/0029VaXXXXXXXXX",
    price_pkr: 500,
  },
};

export const Route = createFileRoute("/api/public/sim")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const number = (url.searchParams.get("number") || "").trim();

        if (!number) {
          return new Response(
            JSON.stringify({
              ok: false,
              status: "bad_request",
              message: "Missing required query parameter: number",
              example: `${url.origin}/api/public/sim?number=03001234567`,
              brand: BRAND,
            }),
            { status: 400, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }

        if (!/^\d{10,15}$/.test(number)) {
          return new Response(
            JSON.stringify({
              ok: false,
              status: "invalid_number",
              message: "Number sirf digits mein hona chahiye (10-15 digits).",
              brand: BRAND,
            }),
            { status: 400, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }

        try {
          const upstream = await fetch(
            `https://famofc.site/api/database.php?number=${encodeURIComponent(number)}`,
            { headers: { Accept: "application/json" } },
          );
          const text = await upstream.text();
          let json: any;
          try { json = JSON.parse(text); } catch { json = null; }

          const records: any[] = Array.isArray(json)
            ? json
            : (json?.data?.records ?? json?.records ?? json?.data ?? json?.results ?? []);

          if (!records || records.length === 0) {
            return new Response(
              JSON.stringify({ ...NOT_FOUND_MESSAGE, query: { number }, brand: BRAND }),
              { status: 404, headers: { "Content-Type": "application/json", ...CORS } },
            );
          }

          return new Response(
            JSON.stringify({
              ok: true,
              status: "success",
              query: { number },
              count: records.length,
              data: records,
              brand: BRAND,
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...CORS } },
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              ok: false,
              status: "upstream_error",
              message: "Database temporarily unavailable. Try again later.",
              error: err?.message ?? "unknown",
              contact: NOT_FOUND_MESSAGE.contact,
              brand: BRAND,
            }),
            { status: 502, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }
      },
    },
  },
});
