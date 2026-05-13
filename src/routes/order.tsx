import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Smartphone, Wallet, MapPin, Phone, User, ShieldAlert, ArrowRight, CreditCard } from "lucide-react";
import { z } from "zod";
import { saveOrder } from "@/lib/order-history";
import { PayfastCheckout } from "@/components/site/payfast-checkout";

export const Route = createFileRoute("/order")({
  component: OrderPage,
  validateSearch: (s: Record<string, unknown>) => ({
    item: typeof s.item === "string" ? s.item : "",
    price: typeof s.price === "string" || typeof s.price === "number" ? Number(s.price) || 0 : 0,
    wa: typeof s.wa === "string" ? s.wa : "",
  }),
});

const PROVINCES: Record<string, string[]> = {
  "Punjab": ["Lahore","Faisalabad","Rawalpindi","Multan","Gujranwala","Sialkot","Bahawalpur","Sargodha","Sheikhupura","Jhelum","Gujrat","Kasur","Okara","Sahiwal","Rahim Yar Khan","Dera Ghazi Khan","Mianwali","Vehari","Khanewal","Chiniot","Jhang","Toba Tek Singh","Hafizabad","Mandi Bahauddin","Narowal","Pakpattan","Layyah","Bhakkar","Attock","Chakwal"],
  "Sindh": ["Karachi","Hyderabad","Sukkur","Larkana","Nawabshah","Mirpur Khas","Jacobabad","Shikarpur","Khairpur","Dadu","Thatta","Badin","Tando Allahyar","Tando Adam","Ghotki","Umerkot","Kashmore"],
  "Khyber Pakhtunkhwa": ["Peshawar","Mardan","Abbottabad","Mingora","Kohat","Bannu","Dera Ismail Khan","Swabi","Nowshera","Charsadda","Mansehra","Haripur","Chitral","Timergara","Tank","Hangu","Battagram"],
  "Balochistan": ["Quetta","Gwadar","Turbat","Khuzdar","Chaman","Hub","Sibi","Zhob","Loralai","Mastung","Pasni","Dera Bugti","Kalat","Nushki"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Azad Jammu & Kashmir": ["Muzaffarabad","Mirpur","Kotli","Bhimber","Rawalakot","Bagh","Hattian","Pallandri"],
  "Gilgit-Baltistan": ["Gilgit","Skardu","Hunza","Chilas","Ghizer","Astore","Khaplu","Shigar"],
};

const PAY = [
  { id: "cod",        label: "Cash on Delivery", icon: Banknote,    tag: "Pay when you receive" },
  { id: "easypaisa",  label: "Easypaisa",        icon: Smartphone,  tag: "Mobile wallet" },
  { id: "jazzcash",   label: "JazzCash",         icon: Wallet,      tag: "Mobile wallet" },
  { id: "card",       label: "Credit / Debit Card", icon: CreditCard, tag: "Visa / Master / UnionPay" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  phone: z.string().trim().regex(/^03\d{9}$/, "Enter valid 11-digit phone (03XXXXXXXXX)"),
  province: z.string().min(1, "Select province"),
  city: z.string().min(1, "Select city"),
  address: z.string().trim().min(10, "Full address required").max(300),
});

function OrderPage() {
  const { item, price, wa } = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", province: "", city: "", address: "", payment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "pay">("form");
  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v, ...(k === "province" ? { city: "" } : {}) }));

  const continueToPay = () => {
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setStep("pay");
  };

  const submitCOD = async () => {
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const order = saveOrder({ ...r.data, payment: form.payment || "cod", item: item || "Custom Order" });
    setSubmitting(false);
    toast.success("Order placed 💀");
    navigate({ to: "/receipt", search: { id: order.id } });
  };

  const hasPrice = price > 0;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-4 py-1.5 text-xs font-bold ring-1 ring-destructive/50">
          <ShieldAlert className="h-4 w-4 text-red-500" /> SECURE CHECKOUT
        </span>
        <h1 className="mt-3 text-3xl font-black uppercase md:text-4xl">Place your order</h1>
        {item && (
          <p className="mt-1 text-sm text-muted-foreground">
            Item: <span className="font-semibold text-foreground">{item}</span>
            {hasPrice && <> · <span className="font-black text-amber-400">Rs. {price}</span></>}
          </p>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-card">
        {/* Contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</Label>
            <Input className="mt-1.5" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Contact Number</Label>
            <Input className="mt-1.5" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="03XXXXXXXXX" inputMode="numeric" maxLength={11} />
          </div>
        </div>

        {/* Province + City */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Province</Label>
            <select
              className="mt-1.5 flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
            >
              <option value="">Select province</option>
              {Object.keys(PROVINCES).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> City</Label>
            <select
              className="mt-1.5 flex h-10 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              disabled={!form.province}
            >
              <option value="">{form.province ? "Select city" : "Select province first"}</option>
              {(PROVINCES[form.province] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <Label>Full Address / Details</Label>
          <Textarea
            className="mt-1.5 min-h-[100px]"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="House #, Street, Area, Landmark… (CNIC: also paste CNIC number)"
          />
        </div>

        {hasPrice ? (
          step === "form" ? (
            <Button onClick={continueToPay} size="lg" variant="cool" className="btn-neon w-full rounded-full text-base">
              Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-xs uppercase tracking-widest text-muted-foreground underline"
              >
                ← Edit details
              </button>
              <PayfastCheckout
                amount={price}
                purpose={item || "Wiki Order"}
                basketPrefix="ORD"
                buttonLabel={`Pay Rs.${price + 1} · Confirm Order`}
                hideContactFields
                prefillName={form.name}
                prefillPhone={form.phone}
                orderAddress={form.address}
                orderProvince={form.province}
                orderCity={form.city}
                whatsappAfter={
                  wa ||
                  `https://wa.me/923186376181?text=${encodeURIComponent(
                    `Salam! Payment done for: ${item || "Wiki Order"} (Rs. ${price}). Name: ${form.name}, Phone: ${form.phone}, City: ${form.city}, Address: ${form.address}`
                  )}`
                }
              />
            </div>
          )
        ) : (
          <>
            {/* Payment */}
            <div>
              <Label className="text-base font-bold">Payment Method</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PAY.map((p) => {
                  const active = form.payment === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update("payment", p.id)}
                      className={`card-hack group relative overflow-hidden rounded-xl border p-4 text-left transition ${
                        active ? "border-primary ring-2 ring-primary bg-primary/10" : "bg-card hover:border-primary/60"
                      }`}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                        <p.icon className="h-5 w-5" />
                      </span>
                      <div className="mt-3 font-bold">{p.label}</div>
                      <div className="text-xs text-muted-foreground">{p.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={submitCOD}
              disabled={submitting}
              size="lg"
              variant="cool"
              className="btn-neon w-full rounded-full text-base"
            >
              {submitting ? "Placing order…" : <>Place Order <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
