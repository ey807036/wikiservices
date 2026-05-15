import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Database, CheckCircle2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Hero */}
      <section className="container mx-auto px-4 py-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Wiki Store · Limited Drop
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
                <Link
                  key={p.id}
                  to="/store/$slug"
                  params={{ slug: p.slug }}
                  className="group relative rounded-2xl border bg-card overflow-hidden hover:shadow-[0_0_30px_oklch(0.65_0.25_25/0.3)] hover:border-primary/50 transition-all"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-secondary to-background overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><Database className="h-10 w-10" /></div>
                    )}
                    <span className="absolute top-2 left-2 rounded-full bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-wider px-2 py-1 shadow-lg">
                      -{discount}%
                    </span>
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
                    <Button size="sm" className="w-full mt-2 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold">
                      Buy now
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
