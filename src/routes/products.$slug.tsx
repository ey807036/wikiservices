import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Star, ShoppingCart, Truck, ShieldCheck, RotateCcw, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { money } from "@/lib/format";

export const Route = createFileRoute("/products/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;
  if (!p) return <div className="container mx-auto px-4 py-20 text-center">Product not found. <Link to="/shop" className="text-primary underline">Back to shop</Link></div>;

  const images = p.images?.length ? p.images : ["https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800"];
  const discount = p.compare_price ? Math.round((((p.compare_price as number) - (p.price as number)) / (p.compare_price as number)) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        {p.categories && <> / <Link to="/shop" search={{ category: (p.categories as any).slug }} className="hover:text-foreground">{(p.categories as any).name}</Link></>}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border bg-secondary/30">
            <img src={images[imgIdx]} alt={p.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden rounded-xl border-2 ${imgIdx === i ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {p.brand && <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.brand}</div>}
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(p.rating)) ? "fill-accent text-accent" : "text-muted"}`} />)}</div>
            <span className="text-sm text-muted-foreground">{Number(p.rating).toFixed(1)} · {p.review_count} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold">${money(p.price)}</span>
            {p.compare_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">${money(p.compare_price)}</span>
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-5 text-muted-foreground">{p.description}</p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <span className={`inline-flex h-2 w-2 rounded-full ${p.stock > 0 ? "bg-success" : "bg-destructive"}`} />
            <span className="font-medium">{p.stock > 0 ? `In stock (${p.stock} available)` : "Out of stock"}</span>
            {p.sku && <span className="text-muted-foreground">· SKU {p.sku}</span>}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))} className="p-3"><Plus className="h-4 w-4" /></button>
            </div>
            <Button
              size="lg"
              className="flex-1 h-12"
              disabled={p.stock === 0}
              onClick={() => {
                add({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image: images[0], stock: p.stock }, qty);
                toast.success(`Added ${qty} × ${p.name} to cart`);
              }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to cart
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border bg-secondary/30 p-4">
            {[
              { i: Truck, t: "Free shipping", s: "Over $50" },
              { i: ShieldCheck, t: "2-yr warranty", s: "Included" },
              { i: RotateCcw, t: "30-day returns", s: "Hassle-free" },
            ].map((f) => (
              <div key={f.t} className="text-center">
                <f.i className="mx-auto mb-1 h-5 w-5 text-primary" />
                <div className="text-xs font-semibold">{f.t}</div>
                <div className="text-[10px] text-muted-foreground">{f.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
