import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * GoPayFast (Pakistan) IPG integration.
 *
 * Flow (per merchant docs):
 *   1. SERVER -> POST { MERCHANT_ID, SECURED_KEY, ... } to /Ecommerce/api/Transaction/GetAccessToken
 *      Response: "ACCESS_TOKEN=<token>&..."  (url-encoded body, NOT JSON)
 *   2. BROWSER -> POST { TOKEN, MERCHANT_ID, ... } to /Ecommerce/api/Transaction/PostTransaction
 *      User completes payment on PayFast hosted page, then is redirected to SUCCESS_URL / FAILURE_URL.
 *
 * Sandbox: ipguat.apps.net.pk   |   Live: ipg1.apps.net.pk
 */

const LIVE_BASE = "https://ipg1.apps.net.pk/Ecommerce/api/Transaction";
const SANDBOX_BASE = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction";
const TAX = 1; // Rs. 1 per transaction (per merchant policy)

const InputSchema = z.object({
  amount: z.number().min(1).max(1_000_000),
  basketId: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email().optional().default("customer@wikiservices.app"),
  customerMobile: z.string().min(6).max(20),
  purpose: z.string().min(1).max(120),
});

export const createPayfastCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "25193";
    const SECURED_KEY = process.env.PAYFAST_SECURED_KEY || "bVKzwCm0x7SoQbEk62WCaV";
    const MODE = (process.env.PAYFAST_MODE || "live").toLowerCase();
    const BASE = MODE === "sandbox" ? SANDBOX_BASE : LIVE_BASE;

    if (!MERCHANT_ID || !SECURED_KEY) {
      console.error("[payfast] Missing merchant credentials");
      return { ok: false as const, error: "Merchant credentials missing on server." };
    }

    const total = (Number(data.amount) + TAX).toFixed(2);
    const orderId = data.basketId;
    const origin = getOrigin();
    const orderDate = formatOrderDate(new Date());

    const successUrl = `${origin}/api/public/payfast-callback?status=success&basket=${encodeURIComponent(orderId)}`;
    const failureUrl = `${origin}/api/public/payfast-callback?status=failed&basket=${encodeURIComponent(orderId)}`;
    const checkoutUrl = `${origin}/api/public/payfast-callback?status=ipn&basket=${encodeURIComponent(orderId)}`;

    // ---------- Step 1: Get ACCESS_TOKEN ----------
    const tokenBody = new URLSearchParams({
      MERCHANT_ID,
      SECURED_KEY,
      CURRENCY_CODE: "PKR",
      TXNAMT: total,
      BASKET_ID: orderId,
      ORDER_DATE: orderDate,
    });

    let token = "";
    try {
      const tokRes = await fetch(`${BASE}/GetAccessToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/plain, */*",
        },
        body: tokenBody.toString(),
      });

      const raw = await tokRes.text();
      console.info("[payfast] token http", tokRes.status, raw.slice(0, 400));

      if (!tokRes.ok) {
        return {
          ok: false as const,
          error: `PayFast token request failed (HTTP ${tokRes.status}). ${raw.slice(0, 160)}`,
        };
      }

      token = parseAccessToken(raw);
      if (!token) {
        return {
          ok: false as const,
          error: extractErrorMessage(raw) || "PayFast did not return ACCESS_TOKEN. Check merchant credentials & whitelisted domain.",
        };
      }
    } catch (e: any) {
      console.error("[payfast] token network error", e);
      return { ok: false as const, error: `Network error reaching PayFast: ${e?.message || e}` };
    }

    // ---------- Step 2: Build form fields for browser POST ----------
    const fields: Record<string, string> = {
      MERCHANT_ID,
      MERCHANT_NAME: "Muhammad Waqas Murtaza",
      TOKEN: token,
      PROCCODE: "00",
      TXNAMT: total,
      CUSTOMER_MOBILE_NO: data.customerMobile,
      CUSTOMER_EMAIL_ADDRESS: data.customerEmail,
      SIGNATURE: "RANDOM-STRING",
      VERSION: "MERCHANT-CART-0.1",
      TXNDESC: data.purpose.slice(0, 120),
      SUCCESS_URL: successUrl,
      FAILURE_URL: failureUrl,
      CHECKOUT_URL: checkoutUrl,
      BASKET_ID: orderId,
      ORDER_DATE: orderDate,
      CURRENCY_CODE: "PKR",
    };

    return {
      ok: true as const,
      checkoutUrl: `${BASE}/PostTransaction`,
      fields,
      total,
      tax: TAX,
      mode: MODE,
    };
  });

// ---------- helpers ----------

function getOrigin(): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  try {
    const proto = (getRequestHeader("x-forwarded-proto") || "https").split(",")[0].trim();
    const host = getRequestHeader("x-forwarded-host") || getRequestHeader("host");
    if (host) return `${proto}://${host}`;
  } catch {}
  return "https://wikiservices.lovable.app";
}

// PayFast returns ACCESS_TOKEN inside JSON OR url-encoded text. Handle both.
function parseAccessToken(raw: string): string {
  const trimmed = raw.trim();
  // JSON case
  if (trimmed.startsWith("{")) {
    try {
      const j = JSON.parse(trimmed);
      const t = j.ACCESS_TOKEN || j.access_token || j.token || j.AUTH_TOKEN;
      if (typeof t === "string" && t.length > 4) return t;
    } catch {}
  }
  // url-encoded case: ACCESS_TOKEN=xxx&ERROR_CODE=00
  const m = /ACCESS_TOKEN=([^&\s"]+)/i.exec(trimmed);
  if (m && m[1] && m[1].toUpperCase() !== "NULL") return decodeURIComponent(m[1]);
  return "";
}

function extractErrorMessage(raw: string): string {
  try {
    const j = JSON.parse(raw);
    return j.ERROR || j.error || j.MESSAGE || j.message || "";
  } catch {}
  const m = /(ERROR|err_msg|MESSAGE)=([^&]+)/i.exec(raw);
  return m ? decodeURIComponent(m[2]) : "";
}

// PayFast wants: yyyy-MM-dd HH:mm:ss
function formatOrderDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
