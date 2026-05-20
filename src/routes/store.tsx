import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, CheckCircle2, Sparkles, Star, Play } from "lucide-react";
import { useState, useMemo } from "react";
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
  return 100 + (h % 900); // 100..999
};

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Wiki Store — Premium Items" },
      { name: "description", content: "Wiki Store: curated digital and physical items at -30% off." },
    ],
  }),
  component: WikiStore,
});

const CATS = [
  { id: "all", label: "All" },
  { id: "boy", label: "👦 Boys" },
  { id: "girl", label: "👧 Girls" },
  { id: "unisex", label: "✨ Unisex" },
];

function WikiStore() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [cat, setCat] = useState("all");

  if (path !== "/store") return <Outlet />;

  const { data: settings } = useQuery({
    queryKey: ["site-settings-store"],
    queryFn: async () =>
      (await supabase
        .from("site_settings")
        .select("store_logo_url, store_name, store_hero_tag, store_hero_title, store_hero_subtitle")
        .eq("id", 1)
        .maybeSingle()).data,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_products")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(
    () => (cat === "all" ? products : products.filter((p: any) => (p.category ?? "unisex") === cat)),
    [products, cat],
  );

  const s: any = settings ?? {};
  const heroTag = s.store_hero_tag || `${s.store_name || "Wiki Store"} · Limited Drop`;
  const heroTitle = s.store_hero_title || "Premium Items, -30% Off";
  const heroSubtitle = s.store_hero_subtitle || "Verified items ✅ — fast checkout, secure PayFast payment, instant order confirmation.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Store-only mini nav (clean, no hacking links) */}
      <div className="border-b bg-card/60 backdrop-blur sticky top-16 z-30">
        <div className="container mx-auto flex h-12 items-center justify-between px-4 text-sm">
          <Link to="/store" className="flex items-center gap-2 font-bold text-primary">
            <ShoppingBag className="h-4 w-4" /> Wiki Store <VerifiedBadge color="green" size={14} />
          </Link>
          <Link to="/my-orders" className="text-muted-foreground hover:text-foreground">My Orders</Link>
        </div>
      </div>

      {/* Logo + Hero */}
      <section className="container mx-auto px-4 py-8 text-center">
        {s.store_logo_url && (
          <div className="mb-4">
            <NeonLogo src={s.store_logo_url} size={104} glow="var(--primary)" />
          </div>
        )}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {heroTag}
        </div>
        <h1 className="mt-4 inline-flex items-center justify-center gap-2 text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {heroTitle}
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm font-bold text-emerald-400">
          Wiki Store <VerifiedBadge color="green" size={16} />
        </div>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{heroSubtitle}</p>

        {/* Category quick filter */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                cat === c.id
                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_var(--primary)]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Is category mein abhi koi item nahi.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p: any) => {
              const old = Number(p.old_price || 0);
              const price = Number(p.price);
              const discount = old > price ? Math.round(((old - price) / old) * 100) : 30;
              const sold = soldFor(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => navigate({ to: "/store/$slug", params: { slug: p.slug }, search: { buy: "1" } as any })}
                  className="group relative text-left rounded-2xl border bg-card overflow-hidden hover:shadow-[0_0_30px_oklch(0.65_0.25_25/0.3)] hover:border-primary/50 transition-all"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-secondary to-background overflow-hidden">
                    {p.video_url ? (
                      <video
                        src={p.video_url}
                        poster={p.image_url || undefined}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        disablePictureInPicture
                        controlsList="nodownload noplaybackrate noremoteplayback"
                        onContextMenu={(e) => e.preventDefault()}
                        className="h-full w-full object-cover pointer-events-none"
                      />
                    ) : p.image_url ? (
                      <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="grid h-full place-items-center text-4xl">
                        <img src={emojiFor(p.id)} alt="" className="h-16 w-16" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-full bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-wider px-2 py-1 shadow-lg">
                      -{discount}%
                    </span>
                    {p.video_url && (
                      <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white">
                        <Play className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {p.in_stock && (
                      <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm line-clamp-1 flex items-center gap-1.5">
                      <img src={emojiFor(p.id)} alt="" className="h-5 w-5 shrink-0" />
                      {p.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" /> 4.{(p.id?.charCodeAt(0) ?? 5) % 9}
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-emerald-400">✅ Sold {sold}+</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-primary">Rs. {price}</span>
                      {old > 0 && <span className="text-xs line-through text-muted-foreground">Rs. {old}</span>}
                    </div>
                    <span className="block w-full mt-2 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold py-2 text-center">
                      Buy Now →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
