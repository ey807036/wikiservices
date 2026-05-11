import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, Search, LogOut, LayoutDashboard, Package, Heart, MoreVertical, Gift, Wallet, Megaphone } from "lucide-react";
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
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/my-orders", label: "Order History" },
];

export function Header() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/shop", search: { q: q.trim() } as any });
  };

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
              {NAV.filter((n) => n.label !== "Shop").map((n) => (
                <Link key={n.label} to={n.to as any} onClick={() => setOpen(false)} className="text-lg font-medium">
                  {n.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <img src={logo} alt="Wikiservices" className="h-9 w-9 drop-shadow-[0_0_12px_oklch(0.85_0.27_145/0.5)]" width={36} height={36} />
          <span className="hidden sm:inline text-glow">Wikiservices</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
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

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {wishCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More"><MoreVertical className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild><Link to="/refer"><Gift className="mr-2 h-4 w-4" />Refer & Earn</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/refer"><Wallet className="mr-2 h-4 w-4" />My Balance</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("WhatsApp Channel — Coming Soon 💀")}>
                <Megaphone className="mr-2 h-4 w-4" />WhatsApp Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
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
