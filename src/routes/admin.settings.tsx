import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Volume2, VolumeX, Check, Upload, Image as ImageIcon } from "lucide-react";
import { THEMES } from "@/components/site/theme-provider";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"lucky" | "store" | null>(null);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundOn(localStorage.getItem("wikiservices_click_sound") !== "off");
    }
  }, []);

  const uploadLogo = async (file: File, kind: "lucky" | "store") => {
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logos/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("store-products").getPublicUrl(path);
      const field = kind === "lucky" ? "lucky_logo_url" : "store_logo_url";
      setForm((f: any) => ({ ...f, [field]: data.publicUrl }));
      toast.success("Logo uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      store_name: form.store_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      whatsapp_number: form.whatsapp_number,
      address: form.address,
      announcement: form.announcement,
      theme: form.theme ?? "matrix",
      lucky_logo_url: form.lucky_logo_url || null,
      store_logo_url: form.store_logo_url || null,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["site-theme"] });
    qc.invalidateQueries({ queryKey: ["site-settings-lucky"] });
    qc.invalidateQueries({ queryKey: ["site-settings-store"] });
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("wikiservices_click_sound", next ? "on" : "off");
    toast.success(next ? "Click sound enabled" : "Click sound muted");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Store Settings</h1>
      <p className="text-sm text-muted-foreground">Update store info, branding logos, theme.</p>

      <div className="mt-6 max-w-2xl space-y-6 rounded-2xl border bg-card p-6">
        <Field label="Store name">
          <Input value={form.store_name ?? ""} onChange={e => setForm({ ...form, store_name: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact email">
            <Input type="email" value={form.contact_email ?? ""} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
          </Field>
          <Field label="Contact phone">
            <Input value={form.contact_phone ?? ""} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
          </Field>
        </div>
        <Field label="WhatsApp number" hint="Digits only with country code, e.g. 923001234567">
          <Input value={form.whatsapp_number ?? ""} onChange={e => setForm({ ...form, whatsapp_number: e.target.value.replace(/\D/g, "") })} />
        </Field>
        <Field label="Store address">
          <Textarea rows={2} value={form.address ?? ""} onChange={e => setForm({ ...form, address: e.target.value })} />
        </Field>
        <Field label="Announcement bar" hint="Shown at top of site (leave empty to hide)">
          <Input value={form.announcement ?? ""} onChange={e => setForm({ ...form, announcement: e.target.value })} placeholder="🎉 Free shipping on orders above Rs. 5,000" />
        </Field>

        {/* Branding logos */}
        <div className="rounded-xl border bg-secondary/30 p-4 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Branding Logos (Round + Neon Glow)</h3>

          <LogoUpload
            label="Lucky Draw page logo"
            url={form.lucky_logo_url}
            onChange={(url) => setForm({ ...form, lucky_logo_url: url })}
            onUpload={(f) => uploadLogo(f, "lucky")}
            uploading={uploading === "lucky"}
          />

          <LogoUpload
            label="Wiki Store page logo"
            url={form.store_logo_url}
            onChange={(url) => setForm({ ...form, store_logo_url: url })}
            onUpload={(f) => uploadLogo(f, "store")}
            uploading={uploading === "store"}
          />
        </div>

        <Field label="Site theme" hint="Pick the color theme for the whole storefront">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {THEMES.map(t => {
              const active = (form.theme ?? "matrix") === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, theme: t.id })}
                  data-theme-preview={t.id}
                  className={`relative rounded-xl border-2 p-3 text-left transition ${active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"}`}
                >
                  <div className="flex gap-1.5">
                    <ThemeSwatch theme={t.id} role="bg" />
                    <ThemeSwatch theme={t.id} role="primary" />
                    <ThemeSwatch theme={t.id} role="accent" />
                  </div>
                  <div className="mt-2 text-xs font-semibold">{t.label}</div>
                  {active && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Mouse click sound">
          <Button type="button" variant="outline" onClick={toggleSound} className="gap-2">
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundOn ? "On" : "Muted"}
          </Button>
        </Field>

        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function LogoUpload({ label, url, onChange, onUpload, uploading }: {
  label: string; url?: string | null; onChange: (url: string) => void;
  onUpload: (f: File) => void; uploading: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {url ? (
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_var(--primary)]">
            <img src={url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-full border-2 border-dashed grid place-items-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Input value={url ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted p-2 text-xs hover:bg-secondary/50">
            <Upload className="h-3 w-3" />
            {uploading ? "Uploading…" : "Upload logo"}
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </label>
        </div>
      </div>
    </div>
  );
}

function ThemeSwatch({ theme, role }: { theme: string; role: "bg" | "primary" | "accent" }) {
  const map: Record<string, { bg: string; primary: string; accent: string }> = {
    matrix: { bg: "#0a1a0f", primary: "#5fff8f", accent: "#5fe6d6" },
    light: { bg: "#ffffff", primary: "#1f9d55", accent: "#0ea5a4" },
    cyber: { bg: "#0a1226", primary: "#4cc9f0", accent: "#b388ff" },
    amber: { bg: "#1a1206", primary: "#ffb74d", accent: "#ff7043" },
    purple: { bg: "#140a1f", primary: "#c084fc", accent: "#f472b6" },
    mono: { bg: "#0a0a0a", primary: "#fafafa", accent: "#5fff8f" },
  };
  const c = map[theme] ?? map.matrix;
  return <div className="h-6 w-6 rounded-md border border-border/60" style={{ background: c[role] }} />;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
