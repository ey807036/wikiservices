import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PAYFAST_BASE = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction";
// Live: https://ipg1.apps.net.pk/Ecommerce/api/Transaction
const CHECKOUT_URL = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

const TAX = 1; // Rs.1 tax per transaction

export const createPayfastCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        amount: z.number().min(1).max(1000000),
        basketId: z.string().min(1).max(64),
        customerName: z.string().min(1).max(120),
        customerEmail: z.string().email().optional().default("customer@wikiservices.app"),
        customerMobile: z.string().min(6).max(20),
        purpose: z.string().min(1).max(120),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID!;
    const SECURED_KEY = process.env.PAYFAST_SECURED_KEY!;
    const total = (Number(data.amount) + TAX).toFixed(2);

    // Step 1: Get access token
    const params = new URLSearchParams({
      MERCHANT_ID,
      SECURED_KEY,
      TXNAMT: total,
      BASKET_ID: data.basketId,
      CURRENCY_CODE: "PKR",
    });

    const tokenRes = await fetch(`${PAYFAST_BASE}/GetAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const tokenJson: any = await tokenRes.json().catch(() => ({}));
    const ACCESS_TOKEN = tokenJson?.ACCESS_TOKEN || tokenJson?.access_token;
    if (!ACCESS_TOKEN) {
      return { ok: false as const, error: tokenJson?.ERROR_DESC || "Failed to get PayFast token", raw: tokenJson };
    }

    // Build form fields the browser will POST to PayFast checkout
    const fields = {
      CURRENCY_CODE: "PKR",
      MERCHANT_ID,
      MERCHANT_NAME: "Muhammad Waqas Murtaza",
      TOKEN: ACCESS_TOKEN,
      SUCCESS_URL: `${getOrigin()}/api/public/payfast-callback?status=success&basket=${encodeURIComponent(data.basketId)}`,
      FAILURE_URL: `${getOrigin()}/api/public/payfast-callback?status=failed&basket=${encodeURIComponent(data.basketId)}`,
      CHECKOUT_URL: `${getOrigin()}/api/public/payfast-callback?status=ipn&basket=${encodeURIComponent(data.basketId)}`,
      CUSTOMER_EMAIL_ADDRESS: data.customerEmail,
      CUSTOMER_MOBILE_NO: data.customerMobile,
      TXNAMT: total,
      BASKET_ID: data.basketId,
      ORDER_DATE: new Date().toISOString(),
      SIGNATURE: "RANDOM-STRING",
      VERSION: "MERCHANT-CART-0.1",
      TXNDESC: data.purpose,
      PROCCODE: "00",
      TRAN_TYPE: "ECOMM_PURCHASE",
      STORE_ID: "",
    } as Record<string, string>;

    return {
      ok: true as const,
      checkoutUrl: CHECKOUT_URL,
      fields,
      total,
      tax: TAX,
    };
  });

function getOrigin() {
  // Best-effort origin for callback; PayFast accepts any reachable URL.
  return process.env.PUBLIC_BASE_URL || "https://wikiservices.lovable.app";
}
