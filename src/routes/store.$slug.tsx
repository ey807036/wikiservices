import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CreditCard, Database, MapPin, Phone, ShieldAlert, ShieldCheck, ShoppingBag, Star, Truck, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PayfastCheckout } from "@/components/site/payfast-checkout";
import { useAuth } from "@/lib/auth-context";
import { NeonLogo } from "@/components/site/neon-logo";
import { VerifiedBadge } from "@/components/site/verified-badge";
import e1 from "@/assets/emojis/e1.png";
import e3 from "@/assets/emojis/e3.png";
import e5 from "@/assets/emojis/e5.png";
import e11 from "@/assets/emojis/e11.png";
import e12 from "@/assets/emojis/e12.png";
import e13 from "@/assets/emojis/e13.png";
import e14 from "@/assets/emojis/e14.png";
import e15 from "@/assets/emojis/e15.png";
import e17 from "@/assets/emojis/e17.png";
import e21 from "@/assets/emojis/e21.png";
import e22 from "@/assets/emojis/e22.png";

const PRODUCT_EMOJIS = [e1, e3, e5, e11, e12, e13, e14, e15, e17, e21, e22];
const emojiFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PRODUCT_EMOJIS[h % PRODUCT_EMOJIS.length];
};
const soldFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return 100 + (h % 900);
};

export const Route = createFileRoute("/store/$slug")({
  validateSearch: (s: Record<string, unknown>) => ({
    buy: s.buy === "1" || s.buy === "true",
  }),
  component: StoreProduct,
});

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

const PROVINCES: Record<string, string[]> = {
  Punjab: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Jhelum", "Gujrat", "Kasur", "Okara", "Sahiwal", "Rahim Yar Khan", "Dera Ghazi Khan", "Mianwali", "Vehari", "Khanewal", "Chiniot", "Jhang", "Toba Tek Singh", "Hafizabad", "Mandi Bahauddin", "Narowal", "Pakpattan", "Layyah", "Bhakkar", "Attock", "Chakwal"],
  Sindh: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Thatta", "Badin", "Tando Allahyar", "Tando Adam", "Ghotki", "Umerkot", "Kashmore"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat", "Bannu", "Dera Ismail Khan", "Swabi", "Nowshera", "Charsadda", "Mansehra", "Haripur", "Chitral", "Timergara", "Tank", "Hangu", "Battagram"],
  Balochistan: ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Chaman", "Hub", "Sibi", "Zhob", "Loralai", "Mastung", "Pasni", "Dera Bugti", "Kalat", "Nushki"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Azad Jammu & Kashmir": ["Muzaffarabad", "Mirpur", "Kotli", "Bhimber", "Rawalakot", "Bagh", "Hattian", "Pallandri"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza", "Chilas", "Ghizer", "Astore", "Khaplu", "Shigar"],
};

function StoreProduct() {
  const { slug } = Route.useParams();
  const { buy } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const checkoutRef = useRef<HTMLDivElement | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-store"],
    queryFn: async () => (await supabase.from("site_settings").select("store_logo_url").eq("id", 1).maybeSingle()).data,
  });

  const { data: p, isLoading } = useQuery({
    queryKey: ["store-product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("store_products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
      return data;
    },
  });

  const sizes: string[] = (p as any)?.sizes?.length ? (p as any).sizes : DEFAULT_SIZES;
  const colors: string[] = (p as any)?.colors ?? [];
  const gallery: Record<string, string[]> = (p as any)?.gallery ?? {};

  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [activeImg, setActiveImg] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(Boolean(buy));
  const [payStep, setPayStep] = useState<"form" | "pay">("form");
  const [form, setForm] = useState({ name: "", phone: "", email: user?.email ?? "", province: "", city: "", address: "", notes: "" });

  useEffect(() => {
    if (buy) setCheckoutOpen(true);
  }, [buy]);

  useEffect(() => {
    if (!user) return;
    const meta: any = user.user_metadata || {};
    setForm((f) => ({
      ...f,
      name: f.name || meta.full_name || meta.name || user.email?.split("@")[0] || "",
      email: f.email || user.email || "",
      phone: f.phone || (meta.phone ? String(meta.phone).replace(/\D/g, "") : ""),
    }));
  }, [user]);

  const images = useMemo(() => {
    if (color && gallery[color]?.length) return gallery[color];
    if (p?.image_url) return [p.image_url];
    return [];
  }, [color, gallery, p?.image_url]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !p?.video_url) return;
    v.muted = false;
    v.play().then(() => setMuted(false)).catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, [p?.video_url]);

  if (isLoading) return <div className="container mx-auto p-8 text-muted-foreground">Loading…</div>;
  if (!p) return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-muted-foreground">Item nahi mila.</p>
      <Link to="/store" className="mt-2 inline-block text-primary underline">Back to Wiki Store</Link>
    </div>
  );

  const old = Number(p.old_price || 0);
  const price = Number(p.price);
  const discount = old > price ? Math.round(((old - price) / old) * 100) : 30;
  const needsSize = sizes.length > 0;
  const needsColor = colors.length > 0;
  const currentImg = images[activeImg] ?? p.image_url;

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v, ...(k === "province" ? { city: "" } : {}) }));
    if (payStep === "pay") setPayStep("form");
  };

  const selectedOptionsOk = () => {
    if (needsSize && !size) {
      toast.error("Size select karein");
      return false;
    }
    if (needsColor && !color) {
      toast.error("Color select karein");
      return false;
    }
    return true;
  };

  const openCheckout = () => {
    if (!selectedOptionsOk()) return;
    setCheckoutOpen(true);
    setPayStep("form");
    requestAnimationFrame(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const continueToPay = () => {
    if (!selectedOptionsOk()) return;
    if (form.name.trim().length < 2) return toast.error("Full name likhein");
    if (!/^03\d{9}$/.test(form.phone.trim())) return toast.error("Valid 11-digit phone likhein (03XXXXXXXXX)");
    if (!form.province) return toast.error("Region / province select karein");
    if (!form.city) return toast.error("City select karein");
    if (form.address.trim().length < 10) return toast.error("Full address likhein");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return toast.error("Email format ghalat hai");
    setPayStep("pay");
    requestAnimationFrame(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };


  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate({ to: "/store" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Wiki Store
        </button>

        {(settings as any)?.store_logo_url && (
          <div className="mt-4 flex justify-center">
            <NeonLogo src={(settings as any).store_logo_url} size={88} glow="var(--primary)" />
          </div>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border bg-card">
              {p.video_url ? (
                <>
                  <video
                    ref={videoRef}
                    src={p.video_url}
                    poster={currentImg || undefined}
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="aspect-square w-full object-cover pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? "Unmute" : "Mute"}
                    className="absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur ring-1 ring-white/30 hover:bg-black/80"
                  >
                    {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </>
              ) : currentImg ? (
                <img src={currentImg} alt={p.title} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center">
                  <img src={emojiFor(p.id)} alt="" className="h-24 w-24" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === activeImg ? "border-primary" : "border-border"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="mt-2 flex items-center gap-2 text-3xl font-black">
                <img src={emojiFor(p.id)} alt="" className="h-8 w-8" />
                {p.title}
                <VerifiedBadge color="green" size={20} />
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> 4.8</span>
                <span className="text-emerald-400 font-bold">· ✅ Sold {soldFor(p.id)}+</span>
                <span>· In stock</span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black text-primary">Rs. {price}</span>
                {old > 0 && <span className="text-lg text-muted-foreground line-through">Rs. {old}</span>}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-black text-accent-foreground">-{discount}%</span>
              </div>
              {p.description && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{p.description}</p>}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg border p-2"><Truck className="h-4 w-4 text-primary" /> Cash / Online</div>
                <div className="flex items-center gap-1.5 rounded-lg border p-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure PayFast</div>
              </div>
            </div>

            {needsSize && (
              <div className="space-y-2 rounded-2xl border bg-card p-4">
                <div className="text-sm font-bold">Size</div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSize(s); if (payStep === "pay") setPayStep("form"); }}
                      className={`min-w-[44px] rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${
                        size === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsColor && (
              <div className="space-y-2 rounded-2xl border bg-card p-4">
                <div className="text-sm font-bold">Color {color && <span className="font-normal text-muted-foreground">· {color}</span>}</div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setColor(c); setActiveImg(0); if (payStep === "pay") setPayStep("form"); }}
                      className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
                        color === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!checkoutOpen && (
              <Button onClick={openCheckout} size="lg" variant="cool" className="btn-neon h-12 w-full rounded-full text-base">
                <ShoppingBag className="mr-2 h-5 w-5" /> Buy Now · Size & Address
              </Button>
            )}

            {checkoutOpen && (
              <div ref={checkoutRef} className="space-y-5 rounded-2xl border bg-card p-5 shadow-card">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary ring-1 ring-primary/40">
                    <ShieldAlert className="h-3.5 w-3.5" /> Secure Checkout
                  </span>
                  <h2 className="mt-3 text-2xl font-black">Address & PayFast</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Store 1 jaisa region, city, full address aur PayFast payment yahin open hoga.</p>
                </div>

                {payStep === "form" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</Label>
                        <Input className="mt-1.5" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Contact Number</Label>
                        <Input className="mt-1.5" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))} placeholder="03XXXXXXXXX" inputMode="numeric" maxLength={11} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Email (optional)</Label>
                        <Input className="mt-1.5" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Region / Province</Label>
                        <select
                          className="mt-1.5 flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                          value={form.province}
                          onChange={(e) => update("province", e.target.value)}
                        >
                          <option value="">Select region</option>
                          {Object.keys(PROVINCES).map((province) => <option key={province} value={province}>{province}</option>)}
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
                          <option value="">{form.province ? "Select city" : "Select region first"}</option>
                          {(PROVINCES[form.province] ?? []).map((cityName) => <option key={cityName} value={cityName}>{cityName}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Full Address / Details</Label>
                      <Textarea
                        className="mt-1.5 min-h-[100px]"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="House #, Street, Area, Landmark…"
                      />
                    </div>
                    <div>
                      <Label>Order Notes (optional)</Label>
                      <Textarea className="mt-1.5" value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} />
                    </div>

                    <Button onClick={continueToPay} size="lg" variant="cool" className="btn-neon h-12 w-full rounded-full text-base">
                      Continue to PayFast <CreditCard className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button type="button" onClick={() => setPayStep("form")} className="text-xs uppercase tracking-widest text-muted-foreground underline">
                      ← Edit size / address
                    </button>
                    <PayfastCheckout
                      amount={price}
                      purpose={`Wiki Store: ${p.title}${size ? ` · Size ${size}` : ""}${color ? ` · ${color}` : ""}`}
                      basketPrefix="WS"
                      buttonLabel={`Pay Rs.${price + 1} · Confirm Wiki Order`}
                      hideContactFields
                      prefillName={form.name}
                      prefillPhone={form.phone}
                      prefillEmail={form.email}
                      orderAddress={form.address}
                      orderProvince={form.province}
                      orderCity={form.city}
                      intentType="store"
                      intentPayload={{
                        items: [{ id: p.id, slug: p.slug, title: p.title, price, qty: 1, image: currentImg, size, color }],
                        notes: form.notes,
                        province: form.province,
                        city: form.city,
                        address: form.address,
                      }}
                    />
                    {!user && <p className="text-center text-[11px] text-muted-foreground">Login optional hai; login ho to order account mein bhi save hoga.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
