// Pakistan Rupee formatter — used everywhere prices show.
const nf = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export function money(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "Rs. 0";
  return `Rs. ${nf.format(Math.round(n))}`;
}

export const FREE_SHIPPING_THRESHOLD = 5000; // Rs.
export const SHIPPING_FEE = 250;             // Rs.
export const TAX_RATE = 0.05;                // 5% GST
export const PRICE_FILTER_MAX = 100000;      // shop slider max
