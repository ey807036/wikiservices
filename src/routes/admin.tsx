import { createFileRoute, Outlet, Link, useNavigate, useRouterState, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, Tags, Users, Wifi, ArrowLeft, Ticket } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isAdmin) { navigate({ to: "/" }); }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading admin...</div>;
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg gradient-hero"><Wifi className="h-4 w-4 text-primary-foreground" /></span>
          WifiHub Admin
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to as any} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="flex items-center gap-2 border-t border-sidebar-border px-6 py-4 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        {/* Mobile top nav */}
        <div className="flex gap-1 overflow-x-auto border-b bg-card p-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to as any} className="shrink-0 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground">
              {n.label}
            </Link>
          ))}
        </div>
        <main className="p-6 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
