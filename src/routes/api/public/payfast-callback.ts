import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payfast-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const params = url.searchParams.toString();
        return new Response(null, {
          status: 302,
          headers: { Location: `/payfast-result?${params}` },
        });
      },
      POST: async ({ request }) => {
        // PayFast may POST IPN — accept and redirect
        const text = await request.text().catch(() => "");
        const url = new URL(request.url);
        const merged = new URLSearchParams(url.search);
        try {
          const body = new URLSearchParams(text);
          body.forEach((v, k) => merged.set(k, v));
        } catch {}
        return new Response(null, {
          status: 302,
          headers: { Location: `/payfast-result?${merged.toString()}` },
        });
      },
    },
  },
});
