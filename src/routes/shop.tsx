import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/product-card";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";

type Search = { category?: string; q?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: Shop,
});

function Shop() {
  const { category, q } = Route.useSearch();
  const [price, setPrice] = useState<[number, number]>([0, PRICE_FILTER_MAX]);
  const [sort, setSort] = useState("newest");
  const [brands, setBrands] = useState<string[]>([]);

  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category, q],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories!inner(slug)").eq("active", true);
      if (category) query = query.eq("categories.slug", category);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data } = await query.limit(200);
      return (data ?? []) as (ProductCardData & { categories: { slug: string } })[];
    },
  });

  const allBrands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[], [products]);

  const filtered = useMemo(() => {
    let r = products.filter((p) => Number(p.price) >= price[0] && Number(p.price) <= price[1]);
    if (brands.length) r = r.filter((p) => p.brand && brands.includes(p.brand));
    switch (sort) {
      case "price-asc": r = [...r].sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": r = [...r].sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "rating": r = [...r].sort((a, b) => Number(b.rating) - Number(a.rating)); break;
    }
    return r;
  }, [products, price, brands, sort]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Categories</h4>
        <div className="space-y-2">
          <Link to="/shop" className={`block text-sm ${!category ? "font-semibold text-primary" : "text-muted-foreground"}`}>All products</Link>
          {cats.map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.slug }} className={`block text-sm ${category === c.slug ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Price</h4>
        <Slider value={price} min={0} max={500} step={10} onValueChange={(v) => setPrice([v[0], v[1]])} />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{money(price[0])}</span><span>{money(price[1])}</span>
        </div>
      </div>
      {allBrands.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Brand</h4>
          <div className="space-y-2">
            {allBrands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={brands.includes(b)} onCheckedChange={(v) => setBrands(v ? [...brands, b] : brands.filter(x => x !== b))} />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{category ? cats.find(c => c.slug === category)?.name ?? "Shop" : q ? `Search: ${q}` : "All Products"}</h1>
        <p className="text-muted-foreground">{filtered.length} products</p>
      </div>
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">{Filters}</aside>
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden"><SlidersHorizontal className="mr-2 h-4 w-4" />Filters</Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72"><div className="mt-8">{Filters}</div></SheetContent>
            </Sheet>
            <div className="ml-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
