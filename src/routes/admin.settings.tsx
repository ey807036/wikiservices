import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Volume2, VolumeX, Check } from "lucide-react";
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

  useEffect(() => { if (data) setForm(data); }, [data]);

  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundOn(localStorage.getItem("wikiservices_click_sound") !== "off");
    }
  }, []);

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
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["site-theme"] });
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
      <p className="text-sm text-muted-foreground">Update store info shown across the site.</p>

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
