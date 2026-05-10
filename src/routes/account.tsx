import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, User, Heart, MapPin, LogOut, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { money } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/15 text-primary",
  processing: "bg-accent/20 text-accent",
  shipped: "bg-chart-4/20 text-chart-4",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

type Tab = "overview" | "orders" | "profile" | "address";

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return null;

  const totalSpent = orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const pendingCount = orders.filter((o: any) => ["pending", "confirmed", "processing", "shipped"].includes(o.status)).length;
  const deliveredCount = orders.filter((o: any) => o.status === "delivered").length;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Address", icon: MapPin },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <button onClick={() => signOut()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-1 rounded-2xl border bg-card p-2 h-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <Link to="/wishlist" className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
            <Heart className="h-4 w-4" /> Wishlist
          </Link>
          <Link to="/cart" className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
            <ShoppingBag className="h-4 w-4" /> Cart
          </Link>
        </aside>

        {/* Content */}
        <div>
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon={Package} label="Total Orders" value={String(orders.length)} />
                <StatCard icon={Clock} label="In Progress" value={String(pendingCount)} />
                <StatCard icon={CheckCircle2} label="Delivered" value={String(deliveredCount)} />
              </div>
              <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-accent/10 p-6">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="mt-1 text-3xl font-bold">{money(totalSpent)}</p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Recent Orders</h3>
                  <button onClick={() => setTab("orders")} className="text-xs text-primary hover:underline">View all →</button>
                </div>
                {orders.length === 0 ? (
                  <EmptyOrders />
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 3).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg bg-secondary/40 p-3 text-sm">
                        <div>
                          <div className="font-medium">{o.order_number}</div>
                          <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span>
                        <div className="font-semibold">{money(o.total)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              {orders.length === 0 ? <EmptyOrders /> : (
                <div className="space-y-3">
                  {orders.map((o: any) => (
                    <div key={o.id} className="rounded-2xl border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{o.order_number}</div>
                          <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span>
                        <div className="font-bold">{money(o.total)}</div>
                      </div>
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {o.order_items?.map((i: any) => (
                          <div key={i.id} className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary/50 p-2 pr-3 text-xs">
                            {i.product_image && <img src={i.product_image} alt="" className="h-10 w-10 rounded object-cover" />}
                            <div>
                              <div className="font-medium line-clamp-1">{i.product_name}</div>
                              <div className="text-muted-foreground">×{i.quantity} · {money(i.unit_price)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && <ProfileForm userId={user.id} email={user.email!} />}
          {tab === "address" && <AddressForm userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
      <Link to="/shop" className="mt-2 inline-block text-sm text-primary font-medium">Start shopping →</Link>
    </div>
  );
}

function ProfileForm({ userId, email }: { userId: string; email: string }) {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      return data;
    },
  });
  const [form, setForm] = useState({ full_name: "", phone: "" });
  useEffect(() => { if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "" }); }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile", userId] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="font-semibold text-lg">Profile Information</h3>
      <Field label="Email"><input value={email} disabled className="w-full rounded-lg border bg-muted px-3 py-2 text-sm" /></Field>
      <Field label="Full Name"><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
      <Field label="Phone"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
      <button disabled={save.isPending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
        {save.isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

function AddressForm({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      return data;
    },
  });
  const [form, setForm] = useState({ address: "", city: "", postal_code: "", country: "" });
  useEffect(() => {
    if (profile) setForm({ address: profile.address || "", city: profile.city || "", postal_code: profile.postal_code || "", country: profile.country || "" });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Address saved"); qc.invalidateQueries({ queryKey: ["profile", userId] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="font-semibold text-lg">Shipping Address</h3>
      <Field label="Street Address"><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City"><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
        <Field label="Postal Code"><input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
      </div>
      <Field label="Country"><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
      <button disabled={save.isPending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
        {save.isPending ? "Saving..." : "Save address"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
