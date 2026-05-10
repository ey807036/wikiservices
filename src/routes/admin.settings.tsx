import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

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

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      store_name: form.store_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      whatsapp_number: form.whatsapp_number,
      address: form.address,
      announcement: form.announcement,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
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

        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
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
