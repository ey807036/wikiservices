```tsx
import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/auth-context";
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
  const { user } = useAuth();
  const { has, toggle } = useWishlist();

  const wished = has(p.id);

  const img =
    p.images?.[0] ||
    "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800";

  const discount = p.compare_price
    ? Math.round(
        ((p.compare_price - p.price) / p.compare_price) * 100
      )
    : 0;

  const delay = ((p.id?.charCodeAt(0) ?? 0) % 10) * 0.3;

  return (
    <div className="group relative rounded-2xl border bg-gradient-to-br from-card to-secondary/30 hover-lift flex flex-col pt-24 px-4 pb-4 mt-20">

      {/* Floating image + glowing circle */}
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="absolute left-1/2 -top-20 -translate-x-1/2 block w-[80%] aspect-square"
      >

        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-primary/10 blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />

        <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/30 animate-[spin_18s_linear_infinite]" />

        <div className="absolute inset-6 rounded-full bg-primary/10 backdrop-blur-sm" />

        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className="relative h-full w-full object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.45)] animate-[float_4s_ease-in-out_infinite] group-hover:scale-110 transition-transform duration-500"
          style={{ animationDelay: `${delay}s` }}
        />

        {discount > 0 && (
          <span className="absolute -left-1 top-2 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground shadow-lg">
            -{discount}%
          </span>
        )}

        {p.stock === 0 && (
          <span className="absolute -right-1 top-2 z-10 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground shadow-lg">
            Sold
          </span>
        )}
      </Link>

      {/* Wishlist */}
      <button
        type="button"
        aria-label="Toggle wishlist"
        onClick={(e) => {
          e.preventDefault();

          if (!user) {
            toast.error("Sign in to save favorites");
            return;
          }

          toggle(p.id);

          toast.success(
            wished
              ? "Removed from wishlist"
              : "Added to wishlist"
          );
        }}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 backdrop-blur border shadow-sm hover:scale-110 transition-transform"
      >
        <Heart
          className={`h-4 w-4 ${
            wished
              ? "fill-accent text-accent"
              : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Card body */}
      <div className="flex flex-1 flex-col text-center">

        {p.brand && (
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {p.brand}
          </div>
        )}

        <Link
          to="/products/$slug"
          params={{ slug: p.slug }}
          className="mt-1 line-clamp-2 font-bold leading-tight hover:text-primary"
        >
          🔥 {p.name}
        </Link>

        <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-medium text-foreground">
            {Number(p.rating).toFixed(1)}
          </span>
          <span>({p.review_count})</span>
        </div>

        <div className="mt-2">
          <div className="text-xl font-extrabold text-primary">
            {money(p.price)}
          </div>

          {p.compare_price && (
            <div className="text-xs text-muted-foreground line-through">
              {money(p.compare_price)}
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="cool"
          className="mt-3 w-full rounded-full"
        >
          <Link
            to="/products/$slug"
            params={{ slug: p.slug }}
            className="flex items-center justify-center w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Quick View
          </Link>
        </Button>

      </div>
    </div>
  );
}
```
