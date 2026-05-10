import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, Headphones, Zap, Star } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: featured = [] } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products").select("*")
        .eq("active", true).eq("featured", true).limit(8);
      return (data ?? []) as ProductCardData[];
    },
  });
  const { data: trending = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products").select("*")
        .eq("active", true).eq("trending", true).limit(8);
      return (data ?? []) as ProductCardData[];
    },
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(1_0_0/0.15),_transparent_60%)]" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Zap className="h-3.5 w-3.5" /> New WiFi 7 arrivals
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Faster WiFi.<br />Everywhere in your home.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/85 md:text-lg">
              Premium routers, mesh systems & networking gear from top brands. Free shipping on orders over $50.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-6 text-base font-semibold">
                  Shop now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop" search={{ category: "mesh" } as any}>
                <Button size="lg" variant="outline" className="h-12 border-white/40 bg-white/10 text-white hover:bg-white/20 px-6">
                  Explore Mesh
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
              <span className="ml-2 text-sm text-white/80">Rated 4.8/5 by 12,000+ customers</span>
            </div>
          </div>
          <div className="relative hidden md:block">
            <img src="https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=900" alt="WiFi Router" className="rounded-3xl shadow-glow" />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {[
            { icon: Truck, t: "Free Shipping", s: "On orders over $50" },
            { icon: ShieldCheck, t: "2-Year Warranty", s: "On all products" },
            { icon: Headphones, t: "Expert Support", s: "Network specialists" },
            { icon: Zap, t: "Fast Setup", s: "Plug & play guides" },
          ].map((f) => (
            <div key={t(f.t)} className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></span>
              <div>
                <div className="font-semibold text-sm">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Shop by category</h2>
            <p className="mt-1 text-muted-foreground">Find exactly what you need</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.slug } as any} className="group relative aspect-square overflow-hidden rounded-2xl border bg-secondary/40 hover-lift">
              <div className="absolute inset-0 gradient-hero opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="relative flex h-full items-end p-5">
                <div className="text-primary-foreground">
                  <div className="text-lg font-bold">{c.name}</div>
                  <div className="text-xs opacity-80">Shop now →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold">Featured products</h2>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-accent p-10 md:p-16">
          <div className="relative max-w-xl text-accent-foreground">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Limited offer</span>
            <h3 className="mt-2 text-3xl font-bold md:text-4xl">Save up to 30% on Mesh Systems</h3>
            <p className="mt-3 opacity-90">Whole-home coverage with seamless roaming. Limited stock.</p>
            <Link to="/shop" search={{ category: "mesh" } as any}>
              <Button size="lg" className="mt-6 bg-foreground text-background hover:bg-foreground/90">Shop the sale</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold">Trending now</h2>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">Loved by 12,000+ customers</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: "Sarah M.", r: "Perfect coverage in our 3-story home. Setup took 5 minutes!", p: "MeshNet Trio" },
            { n: "James L.", r: "My ping dropped by 30ms. Best gaming router I've owned.", p: "Velocity X8" },
            { n: "Priya K.", r: "Fast shipping & the cable quality is genuinely premium.", p: "Cat 8 Cable" },
          ].map((r) => (
            <div key={r.n} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}</div>
              <p className="mt-3 text-sm">"{r.r}"</p>
              <div className="mt-4 text-sm font-semibold">{r.n}</div>
              <div className="text-xs text-muted-foreground">Bought: {r.p}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function t(s: string) { return s; }
