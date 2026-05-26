import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, Search, LogOut, LayoutDashboard, Package, MoreVertical, Zap } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VerifiedBadge } from "@/components/site/verified-badge";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/store", label: "Wiki Store" },
  { to: "/my-orders", label: "Order History" },
];

export function Header() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isStore = path.startsWith("/store");
  const isOrderHistory = path.startsWith("/my-orders");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/shop", search: { q: q.trim() } as any });
  };

  // In Wiki Store (Store 2) we hide Home/Shop nav so user stays in store world.
  const visibleNav = isStore || isOrderHistory
    ? NAV.filter((n) => n.to === "/store" || n.to === "/my-orders")
    : NAV;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="mt-8 flex flex-col gap-4">
              {visibleNav.filter((n) => n.label !== "Shop").map((n) => (
                <Link key={n.label} to={n.to as any} onClick={() => setOpen(false)} className="text-lg font-medium">
                  {n.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {isStore ? (
          <Link to="/store" className="flex items-center gap-2 font-bold text-xl">
            <img src={logo} alt="Wiki Store" className="h-9 w-9 drop-shadow-[0_0_12px_oklch(0.85_0.27_145/0.5)]" width={36} height={36} />
            <span className="hidden sm:inline-flex items-center gap-1 text-glow">
              Wiki Store <VerifiedBadge color="green" size={16} />
            </span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-1.5 font-bold">
            <img src={logo} alt="Wikiservices" className="h-9 w-9 drop-shadow-[0_0_12px_oklch(0.85_0.27_145/0.5)]" width={36} height={36} />
            <span className="hidden sm:inline-flex items-center gap-1 text-glow text-xl">
              Wikiservices <VerifiedBadge color="green" size={16} />
            </span>
            <span className="inline-flex sm:hidden items-center gap-1 text-[13px] font-black uppercase tracking-tight leading-none bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
              Wiki Cyber Store <VerifiedBadge color="red" size={12} />
            </span>
          </Link>
        )}

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {visibleNav.map((n) => (
            <Link
              key={n.label}
              to={n.to as any}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search routers, mesh, accessories..."
              className="h-10 w-full rounded-full border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link to="/cart">
            <Button
              variant="ghost"
              size="icon"
              className={`relative rounded-full ring-1 transition-all ${
                path.startsWith("/cart")
                  ? "ring-emerald-400/80 text-emerald-300 bg-emerald-500/15 shadow-[0_0_18px_oklch(0.78_0.22_145/0.7)]"
                  : "ring-red-500/50 text-red-400 hover:text-red-300 shadow-[0_0_12px_-2px_oklch(0.65_0.25_25/0.7)]"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>

          {!isStore && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More"
                className="rounded-full ring-1 ring-red-500/50 text-red-400 hover:text-red-300 hover:bg-red-500/10 shadow-[0_0_12px_-2px_oklch(0.65_0.25_25/0.7)] data-[state=open]:ring-emerald-400/80 data-[state=open]:text-emerald-300 data-[state=open]:bg-emerald-500/15 data-[state=open]:shadow-[0_0_18px_oklch(0.78_0.22_145/0.7)]"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-[200] w-60 border-red-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white shadow-[0_10px_40px_oklch(0.65_0.25_25/0.4)] backdrop-blur"
            >
              <DropdownMenuItem asChild className="group cursor-pointer rounded-lg focus:bg-red-500/20 focus:text-white text-white">
                <Link to="/refer">
                  <span className="mr-2 grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow-[inset_0_-2px_3px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_6px_oklch(0.75_0.18_60/0.5)] transition-transform group-hover:scale-110 group-hover:-rotate-6">
                    <Zap className="h-4 w-4" />
                  </span>
                  <span className="font-semibold">Refer & Earn</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="group cursor-pointer rounded-lg focus:bg-red-500/20 focus:text-white text-white">
                <Link to="/refer">
                  <span className="mr-2 grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow-[inset_0_-2px_3px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_6px_oklch(0.7_0.18_150/0.5)] text-base transition-transform group-hover:scale-110 group-hover:rotate-6">
                    💰
                  </span>
                  <span className="font-semibold">My Balance</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("WhatsApp Channel — Coming Soon 💀")}
                className="group cursor-pointer rounded-lg focus:bg-red-500/20 focus:text-white text-white"
              >
                <span className="mr-2 grid h-6 w-6 place-items-center rounded-md bg-[#25D366] text-white shadow-[inset_0_-2px_3px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_6px_rgba(37,211,102,0.5)] transition-transform group-hover:scale-110 group-hover:-rotate-6">
                  <svg viewBox="0 0 32 32" className="h-3.5 w-3.5" fill="currentColor"><path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.09 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z"/></svg>
                </span>
                <span className="font-semibold">WhatsApp Channel</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="group cursor-pointer rounded-lg focus:bg-red-500/20 focus:text-white text-white">
                <Link to="/refer">
                  <span className="mr-2 grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white shadow-[inset_0_-2px_3px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_6px_oklch(0.6_0.25_310/0.5)] text-base transition-transform group-hover:scale-110 group-hover:rotate-6">
                    🎁
                  </span>
                  <span className="font-semibold">Promo Code</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full ring-1 ring-red-500/50 text-red-400 hover:text-red-300 hover:bg-red-500/10 shadow-[0_0_12px_-2px_oklch(0.65_0.25_25/0.7)] data-[state=open]:ring-emerald-400/80 data-[state=open]:text-emerald-300 data-[state=open]:bg-emerald-500/15 data-[state=open]:shadow-[0_0_18px_oklch(0.78_0.22_145/0.7)]"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/account"><Package className="mr-2 h-4 w-4" />My Orders</Link></DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild><Link to="/auth">Sign in</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/auth" search={{ mode: "signup" } as any}>Create account</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
