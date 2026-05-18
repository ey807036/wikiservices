import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Database, Truck, ShieldCheck, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { PayfastCheckout } from "@/components/site/payfast-checkout";
import { useAuth } from "@/lib/auth-context";
import { NeonLogo } from "@/components/site/neon-logo";

export const Route = createFileRoute("/store/$slug")({
  component: StoreProduct,
});

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

function StoreProduct() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  // Compute image list — gallery[color] if available, else main image
  const images = useMemo(() => {
    if (color && gallery[color]?.length) return gallery[color];
    if (p?.image_url) return [p.image_url];
    return [];
  }, [color, gallery, p?.image_url]);

  if (isLoading) return <div className="container mx-auto p-8 text-muted-foreground">Loading…</div>;
  if (!p) return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-muted-foreground">Item nahi mila.</p>
      <Link to="/store" className="text-primary underline mt-2 inline-block">Back to Wiki Store</Link>
    </div>
  );

  const old = Number(p.old_price || 0);
  const price = Number(p.price);
  const discount = old > price ? Math.round(((old - price) / old) * 100) : 30;
  const needsSize = sizes.length > 0;
  const needsColor = colors.length > 0;
  const canCheckout =
    address.trim().length > 5 &&
    city.trim().length > 1 &&
    (!needsSize || !!size) &&
    (!needsColor || !!color);

  const currentImg = images[activeImg] ?? p.image_url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate({ to: "/store" })} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Wiki Store
        </button>

        {(settings as any)?.store_logo_url && (
          <div className="mt-4 flex justify-center">
            <NeonLogo src={(settings as any).store_logo_url} size={88} glow="var(--primary)" />
          </div>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {/* Media */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border bg-card">
              {p.video_url ? (
                <video
                  src={p.video_url}
                  poster={currentImg || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full aspect-square object-cover"
                />
              ) : currentImg ? (
                <img src={currentImg} alt={p.title} className="w-full aspect-square object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center text-muted-foreground"><Database className="h-16 w-16" /></div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 shrink-0 rounded-lg border-2 overflow-hidden ${i === activeImg ? "border-primary" : "border-border"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + checkout */}
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-xs font-bold">
                <Database className="h-3 w-3" /> Verified Database <CheckCircle2 className="h-3 w-3" />
              </div>
              <h1 className="mt-2 text-3xl font-black">{p.title}</h1>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" /> 4.8 · In stock
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black text-primary">Rs. {price}</span>
                {old > 0 && <span className="text-lg line-through text-muted-foreground">Rs. {old}</span>}
                <span className="rounded-full bg-accent text-accent-foreground text-xs font-black px-2 py-0.5">-{discount}%</span>
              </div>
              {p.description && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{p.description}</p>}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg border p-2"><Truck className="h-4 w-4 text-primary" /> Cash / Online</div>
                <div className="flex items-center gap-1.5 rounded-lg border p-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure PayFast</div>
              </div>
            </div>

            {/* Size selector */}
            {needsSize && (
              <div className="rounded-2xl border bg-card p-4 space-y-2">
                <div className="text-sm font-bold">Size</div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
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

            {/* Color selector */}
            {needsColor && (
              <div className="rounded-2xl border bg-card p-4 space-y-2">
                <div className="text-sm font-bold">Color {color && <span className="text-muted-foreground font-normal">· {color}</span>}</div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setColor(c); setActiveImg(0); }}
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

            {/* Shipping form */}
            <div className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="text-sm font-bold">Shipping details</div>
              <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            {/* Payfast checkout */}
            {canCheckout ? (
              <PayfastCheckout
                amount={price}
                purpose={`Wiki Store: ${p.title}${size ? ` · Size ${size}` : ""}${color ? ` · ${color}` : ""}`}
                basketPrefix="WS"
                requireAuth
                orderAddress={address}
                orderCity={city}
                intentType="store"
                intentPayload={{
                  items: [{ id: p.id, slug: p.slug, title: p.title, price, qty: 1, image: currentImg, size, color }],
                  notes,
                }}
              />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-muted p-4 text-center text-sm text-muted-foreground">
                {needsSize && !size && "Size select karein. "}
                {needsColor && !color && "Color select karein. "}
                Address aur city likhein, phir payment option khulega.
              </div>
            )}
            {!user && (
              <p className="text-[11px] text-center text-muted-foreground">
                Login required so order aap k account mein save ho.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
