import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-store";
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
  const { add } = useCart();
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const wished = has(p.id);
  const img = p.images?.[0] || "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800";
  const discount = p.compare_price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : 0;

  return (
    <div className="group rounded-2xl border bg-card hover-lift overflow-hidden flex flex-col">
      <Link to="/products/$slug" params={{ slug: p.slug }} className="block relative aspect-square overflow-hidden bg-secondary/40">
        <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
            -{discount}%
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground">
            Sold out
          </span>
        )}
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            if (!user) { toast.error("Sign in to save favorites"); return; }
            toggle(p.id);
            toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur border shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {p.brand && <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{p.brand}</div>}
        <Link to="/products/$slug" params={{ slug: p.slug }} className="mt-1 line-clamp-2 font-semibold leading-tight hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-medium text-foreground">{Number(p.rating).toFixed(1)}</span>
          <span>({p.review_count})</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold">${money(p.price)}</div>
            {p.compare_price && (
              <div className="text-xs text-muted-foreground line-through">${money(p.compare_price)}</div>
            )}
          </div>
          <Button
            size="sm"
            disabled={p.stock === 0}
            onClick={(e) => {
              e.preventDefault();
              add({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image: img, stock: p.stock });
              toast.success("Added to cart");
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
