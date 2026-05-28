import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { money } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  images: string[];
  brand: string | null;
  rating: number;
  review_count: number;
  short_description: string | null;
  stock: number;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const { add } = useCart();
  const img = p.images?.[0] || "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800";
  const discount = p.compare_price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : 0;

  // Stable per-card animation offset so floats are not all in sync
  const delay = ((p.id?.charCodeAt(0) ?? 0) % 10) * 0.3;

  return (
    <div className="group relative rounded-2xl border border-primary/30 bg-black/80 hover-lift flex flex-col pt-24 px-4 pb-4 mt-20 shadow-card">
      {/* Floating round neon product image */}
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="absolute left-1/2 -top-20 grid h-40 w-40 -translate-x-1/2 place-items-center"
      >
        <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl opacity-90 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-3 rounded-full bg-[conic-gradient(from_0deg,transparent,var(--primary),transparent_50%,var(--primary),transparent)] blur-[2px] animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-5 rounded-full bg-black ring-2 ring-primary/60 shadow-[0_0_28px_var(--primary),inset_0_0_20px_var(--primary)]" />
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className="relative h-28 w-28 rounded-full object-cover ring-2 ring-primary/50 drop-shadow-[0_18px_25px_rgba(0,0,0,0.45)] animate-[float_4s_ease-in-out_infinite] group-hover:scale-110 transition-transform duration-500"
          style={{ animationDelay: `${delay}s` }}
        />

        {discount > 0 && (
          <span className="absolute -left-1 top-2 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground shadow-lg">
            -{discount}%
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute -right-1 top-2 z-10 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground shadow-lg">
            Sold out
          </span>
        )}
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col text-center">
        {p.brand && <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{p.brand}</div>}
        <Link to="/products/$slug" params={{ slug: p.slug }} className="mt-1 line-clamp-2 font-bold leading-tight hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-medium text-foreground">{Number(p.rating).toFixed(1)}</span>
          <span>({p.review_count})</span>
        </div>
        <div className="mt-2">
          <div className="text-xl font-extrabold text-primary">{money(p.price)}</div>
          {p.compare_price && (
            <div className="text-xs text-muted-foreground line-through">{money(p.compare_price)}</div>
          )}
        </div>
        <Button
          size="sm"
          variant="cool"
          className="mt-3 w-full rounded-full"
          disabled={p.stock === 0}
          onClick={(e) => {
            e.preventDefault();
            add({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image: img, stock: p.stock });
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Buy now
        </Button>
      </div>
    </div>
  );
}
