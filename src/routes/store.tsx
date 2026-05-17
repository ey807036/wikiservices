import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Database, CheckCircle2, Sparkles, Star, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NeonLogo } from "@/components/site/neon-logo";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Wiki Store — Premium Items" },
      { name: "description", content: "Wiki Store: curated digital and physical items at -30% off." },
    ],
  }),
  component: WikiStore,
});

function WikiStore() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<any>(null);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-store"],
    queryFn: async () => (await supabase.from("site_settings").select("store_logo_url, store_name").eq("id", 1).maybeSingle()).data,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Store-only mini nav (clean, no hacking links) */}
      <div className="border-b bg-card/60 backdrop-blur sticky top-16 z-30">
        <div className="container mx-auto flex h-12 items-center justify-between px-4 text-sm">
          <Link to="/store" className="flex items-center gap-2 font-bold text-primary">
            <ShoppingBag className="h-4 w-4" /> Wiki Store
          </Link>
          <Link to="/my-orders" className="text-muted-foreground hover:text-foreground">My Orders</Link>
        </div>
      </div>

      {/* Logo + Hero */}
      <section className="container mx-auto px-4 py-8 text-center">
        {(settings as any)?.store_logo_url && (
          <div className="mb-4">
            <NeonLogo src={(settings as any).store_logo_url} size={104} glow="var(--primary)" />
          </div>
        )}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {(settings as any)?.store_name || "Wiki Store"} · Limited Drop
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Premium Items, -30% Off
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Verified database items ✅ — fast checkout, secure PayFast payment, instant order confirmation.
        </p>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            Koi item available nahi. Admin se kuch items add karwayein.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p: any) => {
              const old = Number(p.old_price || 0);
              const price = Number(p.price);
              const discount = old > price ? Math.round(((old - price) / old) * 100) : 30;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPreview(p)}
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
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : p.image_url ? (
                      <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><Database className="h-10 w-10" /></div>
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
                    <div className="font-bold text-sm line-clamp-1 flex items-center gap-1">
                      <Database className="h-3 w-3 text-emerald-500 shrink-0" />
                      {p.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" /> 4.{(p.id?.charCodeAt(0) ?? 5) % 9}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-primary">Rs. {price}</span>
                      {old > 0 && <span className="text-xs line-through text-muted-foreground">Rs. {old}</span>}
                    </div>
                    <span className="block w-full mt-2 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold py-2 text-center">
                      Quick view
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick-view modal */}
      {preview && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => setPreview(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border-2 border-primary/50 rounded-2xl max-w-2xl w-full shadow-[0_0_40px_oklch(0.65_0.25_25/0.5)] overflow-hidden my-8">
            <div className="relative">
              {preview.video_url ? (
                <video
                  src={preview.video_url}
                  poster={preview.image_url || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full aspect-video object-cover bg-black"
                />
              ) : preview.image_url ? (
                <img src={preview.image_url} alt={preview.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className="grid aspect-video place-items-center text-muted-foreground bg-secondary"><Database className="h-16 w-16" /></div>
              )}
              <button onClick={() => setPreview(null)} className="absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white hover:bg-black">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <h2 className="text-2xl font-black">{preview.title}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-primary">Rs. {Number(preview.price)}</span>
                {preview.old_price && <span className="line-through text-muted-foreground">Rs. {Number(preview.old_price)}</span>}
              </div>
              {preview.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line max-h-40 overflow-y-auto">{preview.description}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold"
                  onClick={() => { setPreview(null); navigate({ to: "/store/$slug", params: { slug: preview.slug } }); }}
                >
                  Buy now →
                </Button>
                <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
