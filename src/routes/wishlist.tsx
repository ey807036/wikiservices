import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-store";
import { ProductCard, type ProductCardData } from "@/components/site/product-card";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { user } = useAuth();
  const { ids } = useWishlist();
  const idArr = Array.from(ids);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist-products", idArr.sort().join(",")],
    enabled: idArr.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").in("id", idArr);
      return (data ?? []) as ProductCardData[];
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Sign in to view your wishlist</h1>
        <Link to="/auth" className="mt-4 inline-block text-primary font-semibold">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">My Wishlist</h1>
      <p className="text-muted-foreground">{idArr.length} saved item{idArr.length === 1 ? "" : "s"}</p>
      {idArr.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          No items yet. <Link to="/shop" className="text-primary font-semibold">Browse products</Link>
        </div>
      ) : isLoading ? (
        <div className="mt-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
