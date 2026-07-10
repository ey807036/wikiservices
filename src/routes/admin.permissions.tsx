import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Mic, Bell, MapPin, Trash2, Plus, RefreshCw, ShieldCheck, Images } from "lucide-react";
import { clearPagePermissionsCache, type PagePermRow } from "@/lib/page-permissions";

export const Route = createFileRoute("/admin/permissions")({ component: AdminPermissions });

const SUGGESTED = [
  { page: "*", label: "All pages (global default)" },
  { page: "/sim-database", label: "SIM Database" },
  { page: "/admin", label: "Admin panel" },
  { page: "/fia-preparation", label: "FIA Preparation" },
  { page: "/", label: "Home page" },
];

function AdminPermissions() {
  const [rows, setRows] = useState<PagePermRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newPage, setNewPage] = useState("");
  const [newLabel, setNewLabel] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_permission_settings")
      .select("*")
      .order("page");
    if (error) toast.error(error.message);
    else setRows((data ?? []) as PagePermRow[]);
    setLoading(false);
    clearPagePermissionsCache();
  }

  useEffect(() => { load(); }, []);

  async function updateRow(page: string, patch: Partial<PagePermRow>) {
    setSaving(page);
    const { error } = await supabase
      .from("page_permission_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("page", page);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.map((row) => (row.page === page ? { ...row, ...patch } : row)));
    clearPagePermissionsCache();
    toast.success("Saved");
  }

  async function addRow(page: string, label: string) {
    const trimmed = page.trim();
    if (!trimmed) { toast.error("Page path required"); return; }
    if (rows.some((r) => r.page === trimmed)) { toast.error("Already exists"); return; }
    const { data, error } = await supabase
      .from("page_permission_settings")
      .insert({ page: trimmed, label: label.trim() || null, camera: false, microphone: false, notifications: false, location: false })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setRows((r) => [...r, data as PagePermRow].sort((a, b) => a.page.localeCompare(b.page)));
    setNewPage(""); setNewLabel("");
    clearPagePermissionsCache();
    toast.success("Added");
  }

  async function removeRow(page: string) {
    if (page === "*") { toast.error("Global default row cannot be deleted"); return; }
    if (!confirm(`Delete permission rule for "${page}"?`)) return;
    const { error } = await supabase.from("page_permission_settings").delete().eq("page", page);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.filter((row) => row.page !== page));
    clearPagePermissionsCache();
    toast.success("Deleted");
  }

  const existingPages = new Set(rows.map((r) => r.page));
  const suggestions = SUGGESTED.filter((s) => !existingPages.has(s.page));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/15 p-3 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Page Permissions</h1>
            <p className="text-sm text-muted-foreground">
              Har page ke liye control karein ke Camera / Microphone / Notifications ki browser permission maangi jaye ya nahi.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Add page rule</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder='Page path e.g. "/sim-database" or "*" for global'
            value={newPage}
            onChange={(e) => setNewPage(e.target.value)}
          />
          <Input
            placeholder="Label (optional)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <Button onClick={() => addRow(newPage, newLabel)}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Quick add:</span>
            {suggestions.map((s) => (
              <button
                key={s.page}
                onClick={() => addRow(s.page, s.label)}
                className="rounded-full border px-2.5 py-1 text-xs hover:bg-accent"
              >
                {s.label} <span className="text-muted-foreground">({s.page})</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Koi rule set nahi hai. Upar se add karein.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.page} className="p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-sm font-bold">{row.page}</div>
                  {row.label && <div className="text-xs text-muted-foreground">{row.label}</div>}
                </div>
                {row.page !== "*" && (
                  <Button variant="ghost" size="icon" onClick={() => removeRow(row.page)} disabled={saving === row.page}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ToggleRow
                  icon={<Camera className="h-4 w-4" />}
                  label="Camera"
                  checked={row.camera}
                  disabled={saving === row.page}
                  onChange={(v) => updateRow(row.page, { camera: v })}
                />
                <ToggleRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  checked={row.location}
                  disabled={saving === row.page}
                  onChange={(v) => updateRow(row.page, { location: v })}
                />
                <ToggleRow
                  icon={<Mic className="h-4 w-4" />}
                  label="Microphone"
                  checked={row.microphone}
                  disabled={saving === row.page}
                  onChange={(v) => updateRow(row.page, { microphone: v })}
                />
                <ToggleRow
                  icon={<Bell className="h-4 w-4" />}
                  label="Notifications"
                  checked={row.notifications}
                  disabled={saving === row.page}
                  onChange={(v) => updateRow(row.page, { notifications: v })}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Rules:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Exact page match sab se pehle apply hota hai.</li>
          <li>Warna longest matching prefix (e.g. <code>/admin</code> covers <code>/admin/orders</code>).</li>
          <li>Warna global default row <code>*</code>.</li>
          <li>Kisi bhi permission ko OFF karne se browser popup us page par nahi aayega.</li>
        </ul>
      </div>
    </div>
  );
}

function ToggleRow({
  icon, label, checked, disabled, onChange,
}: { icon: React.ReactNode; label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${checked ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon} {label}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
