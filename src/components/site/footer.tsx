import { Link } from "@tanstack/react-router";
import { Wifi } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary/30">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-primary-foreground">
              <Wifi className="h-5 w-5" />
            </span>
            WifiHub
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Premium WiFi gear, mesh systems & networking accessories for fast, reliable connections everywhere.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop" search={{ category: "routers" } as any}>Routers</Link></li>
            <li><Link to="/shop" search={{ category: "mesh" } as any}>Mesh Systems</Link></li>
            <li><Link to="/shop" search={{ category: "accessories" } as any}>Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth">Sign in</Link></li>
            <li><Link to="/account">My Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Get 10% off</h4>
          <p className="text-sm text-muted-foreground mb-3">Subscribe for deals & launches.</p>
          <form className="flex gap-2">
            <input className="h-10 flex-1 rounded-md border bg-background px-3 text-sm" placeholder="Email" />
            <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WifiHub. All rights reserved.
      </div>
    </footer>
  );
}
