import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Upload, Image as ImageIcon, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/checker")({ component: AdminChecker });

function AdminChecker() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["checker-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("checker_settings").select("*").eq("id", 1).maybeSingle();
      return data as any;
    },
  });

  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "hero" | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (data) setForm(data); }, [data]);

  async function upload(file: File, kind: "logo" | "hero") {
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `checker/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("store-products").getPublicUrl(path);
      const field = kind === "logo" ? "logo_url" : "hero_image_url";
      setForm((f: any) => ({ ...f, [field]: pub.publicUrl }));
      toast.success(`${kind} uploaded`);
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("checker_settings").update({
      title: form.title || "Wiki Checker",
      subtitle: form.subtitle || "",
      hero_image_url: form.hero_image_url || null,
      logo_url: form.logo_url || null,
      base_url: (form.base_url || "http://51.210.208.26/ints").replace(/\/$/, ""),
      enabled: !!form.enabled,
      delay_ms: Number(form.delay_ms) || 800,
      timeout_ms: Number(form.timeout_ms) || 25000,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["checker-settings"] });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wiki Checker Settings</h1>
        <p className="text-sm text-muted-foreground">Manage branding, images, and behavior of the bulk checker page.</p>
        <a href="/wiki-checker" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Open Wiki Checker <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enabled</Label>
            <p className="text-xs text-muted-foreground">Turn the public checker page on or off.</p>
          </div>
          <Switch checked={!!form.enabled} onCheckedChange={(v) => setForm((f: any) => ({ ...f, enabled: v }))} />
        </div>

        <div className="grid gap-2">
          <Label>Title</Label>
          <Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Subtitle</Label>
          <Textarea rows={2} value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                <img src={form.logo_url} alt="logo" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-muted"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
              )}
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo")} />
              <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={uploading === "logo"}>
                <Upload className="mr-2 h-4 w-4" /> {uploading === "logo" ? "Uploading…" : "Upload logo"}
              </Button>
              {form.logo_url && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logo_url: "" })}>Remove</Button>}
            </div>
            <Input placeholder="…or paste URL" value={form.logo_url ?? ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Hero background image</Label>
            <div className="flex items-center gap-3">
              {form.hero_image_url ? (
                <img src={form.hero_image_url} alt="hero" className="h-14 w-24 rounded-lg object-cover" />
              ) : (
                <div className="grid h-14 w-24 place-items-center rounded-lg bg-muted"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
              )}
              <input ref={heroRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "hero")} />
              <Button variant="outline" size="sm" onClick={() => heroRef.current?.click()} disabled={uploading === "hero"}>
                <Upload className="mr-2 h-4 w-4" /> {uploading === "hero" ? "Uploading…" : "Upload hero"}
              </Button>
              {form.hero_image_url && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, hero_image_url: "" })}>Remove</Button>}
            </div>
            <Input placeholder="…or paste URL" value={form.hero_image_url ?? ""} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2 md:col-span-3">
            <Label>Panel base URL</Label>
            <Input value={form.base_url ?? ""} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="http://51.210.208.26/ints" />
            <p className="text-xs text-muted-foreground">Must include /ints (no trailing slash).</p>
          </div>
          <div className="space-y-2">
            <Label>Delay between checks (ms)</Label>
            <Input type="number" value={form.delay_ms ?? 800} onChange={(e) => setForm({ ...form, delay_ms: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Per-account timeout (ms)</Label>
            <Input type="number" value={form.timeout_ms ?? 25000} onChange={(e) => setForm({ ...form, timeout_ms: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
