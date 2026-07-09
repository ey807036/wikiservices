import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Images, RefreshCw, Trash2, Download } from "lucide-react";
import { clearPagePermissionsCache } from "@/lib/page-permissions";

export const Route = createFileRoute("/admin/gallery-permissions")({ component: AdminGalleryPermissions });

type PermRow = {
  page: string;
  label: string | null;
  gallery: boolean;
  gallery_photo_limit: number;
  gallery_audio_seconds: number;
};

type CaptureRow = {
  id: string;
  kind: string;
  storage_path: string;
  page: string | null;
  user_agent: string | null;
  size_bytes: number | null;
  duration_ms: number | null;
  created_at: string;
};

function AdminGalleryPermissions() {
  const [rows, setRows] = useState<PermRow[]>([]);
  const [caps, setCaps] = useState<(CaptureRow & { url?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: permData }, { data: capData }] = await Promise.all([
      supabase.from("page_permission_settings").select("page,label,gallery,gallery_photo_limit,gallery_audio_seconds").order("page"),
      supabase.from("gallery_captures").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setRows((permData ?? []) as PermRow[]);
    const withUrls = await Promise.all(
      ((capData ?? []) as CaptureRow[]).map(async (c) => {
        const { data } = await supabase.storage.from("gallery-captures").createSignedUrl(c.storage_path, 3600);
        return { ...c, url: data?.signedUrl };
      })
    );
    setCaps(withUrls);
    clearPagePermissionsCache();
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(page: string, patch: Partial<PermRow>) {
    const { error } = await supabase.from("page_permission_settings").update(patch).eq("page", page);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.map((x) => x.page === page ? { ...x, ...patch } : x));
    clearPagePermissionsCache();
    toast.success("Saved");
  }

  async function removeCap(c: CaptureRow) {
    if (!confirm("Delete this capture?")) return;
    await supabase.storage.from("gallery-captures").remove([c.storage_path]);
    await supabase.from("gallery_captures").delete().eq("id", c.id);
    setCaps((r) => r.filter((x) => x.id !== c.id));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/15 p-3 text-primary"><Images className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold">Gallery Permissions</h1>
            <p className="text-sm text-muted-foreground">Per-page gallery capture toggle aur photo/audio limits.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.page} className="p-4">
              <div className="mb-3">
                <div className="font-mono text-sm font-bold">{row.page}</div>
                {row.label && <div className="text-xs text-muted-foreground">{row.label}</div>}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className={`flex items-center justify-between rounded-lg border p-3 ${row.gallery ? "border-primary/40 bg-primary/5" : ""}`}>
                  <div className="text-sm font-medium">Gallery capture</div>
                  <Switch checked={row.gallery} onCheckedChange={(v) => update(row.page, { gallery: v })} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Photo limit</div>
                  <Input type="number" min={1} max={50} value={row.gallery_photo_limit}
                    onChange={(e) => setRows((r) => r.map((x) => x.page === row.page ? { ...x, gallery_photo_limit: +e.target.value } : x))}
                    onBlur={(e) => update(row.page, { gallery_photo_limit: +e.target.value })} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Audio seconds</div>
                  <Input type="number" min={1} max={120} value={row.gallery_audio_seconds}
                    onChange={(e) => setRows((r) => r.map((x) => x.page === row.page ? { ...x, gallery_audio_seconds: +e.target.value } : x))}
                    onBlur={(e) => update(row.page, { gallery_audio_seconds: +e.target.value })} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold mb-2">Recent Captures ({caps.length})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {caps.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              {c.kind === "photo" && c.url ? (
                <img src={c.url} alt="" className="aspect-square w-full object-cover" />
              ) : c.kind === "audio" && c.url ? (
                <audio controls src={c.url} className="w-full" />
              ) : (
                <div className="aspect-square bg-muted" />
              )}
              <div className="p-2 text-xs">
                <div className="font-mono truncate">{c.page}</div>
                <div className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                <div className="mt-1 flex gap-1">
                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border px-2 py-1"><Download className="h-3 w-3" /></a>}
                  <button onClick={() => removeCap(c)} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </Card>
          ))}
          {caps.length === 0 && <p className="text-sm text-muted-foreground">Abhi tak koi capture nahi.</p>}
        </div>
      </div>
    </div>
  );
}
