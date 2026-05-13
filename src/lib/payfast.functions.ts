import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// LIVE production gateway (per merchant instructions)
const CHECKOUT_URL = "https://ipg1.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";
const TAX = 1; // Rs.1 per transaction

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
    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "25193";
    const SECURED_KEY = process.env.PAYFAST_SECURED_KEY || "bVKzwCm0x7SoQbEk62WCaV";

    const total = (Number(data.amount) + TAX).toFixed(2);
    const orderId = data.basketId;

    // Direct POST flow per PHP reference — no token pre-fetch.
    const fields: Record<string, string> = {
      MERCHANT_ID,
      SECURED_KEY,
      MERCHANT_NAME: "Muhammad Waqas Murtaza",
      TXNAMT: total,
      CURRENCY_CODE: "PKR",
      ORDER_ID: orderId,
      BASKET_ID: orderId,
      DESC: data.purpose,
      TXNDESC: data.purpose,
      SUCCESS_URL: `${getOrigin()}/api/public/payfast-callback?status=success&basket=${encodeURIComponent(orderId)}`,
      FAILURE_URL: `${getOrigin()}/api/public/payfast-callback?status=failed&basket=${encodeURIComponent(orderId)}`,
      CHECKOUT_URL: `${getOrigin()}/api/public/payfast-callback?status=ipn&basket=${encodeURIComponent(orderId)}`,
      CUSTOMER_EMAIL_ADDRESS: data.customerEmail,
      CUSTOMER_MOBILE_NO: data.customerMobile,
      TXNTYPE: "SALE",
      PROCCODE: "00",
      TRAN_TYPE: "ECOMM_PURCHASE",
      VERSION: "MERCHANT-CART-0.1",
      ORDER_DATE: new Date().toISOString(),
      SIGNATURE: "RANDOM-STRING",
      STORE_ID: "",
    };

    return {
      ok: true as const,
      checkoutUrl: CHECKOUT_URL,
      fields,
      total,
      tax: TAX,
    };
  });

function getOrigin() {
  return process.env.PUBLIC_BASE_URL || "https://wikiservices.lovable.app";
}
