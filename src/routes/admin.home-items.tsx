import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/home-items")({ component: AdminHomeItems });

const TONES = ["whatsapp", "premium", "data", "signal", "bluetooth", "sim", "drone", "danger", "id"];
const ACTIONS = [
  { v: "", l: "Default (Buy Now → /order)" },
  { v: "fakewa", l: "Fake WhatsApp page" },
  { v: "pro", l: "Pro Accounts page" },
];

const empty = {
  name: "", description: "", price: "0", sold_count: "0",
  logo_url: "", icon_tone: "signal", hot: false, action: "", href: "",
  sort_order: "0", active: true,
};

function AdminHomeItems() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-home-items"],
    queryFn: async () => (await supabase.from("home_items" as any).select("*").order("sort_order")).data ?? [],
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      ...p,
      price: String(p.price),
      sold_count: String(p.sold_count),
      sort_order: String(p.sort_order),
      logo_url: p.logo_url ?? "", action: p.action ?? "", href: p.href ?? "",
    });
    setOpen(true);
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `home-items/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("store-products").getPublicUrl(path);
      setForm((f: any) => ({ ...f, logo_url: data.publicUrl }));
      toast.success("Logo uploaded");
    } catch (e: any) { toast.error(e.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sold_count: parseInt(form.sold_count, 10) || 0,
      logo_url: form.logo_url || null,
      icon_tone: form.icon_tone,
      hot: !!form.hot,
      action: form.action || null,
      href: form.href || null,
      sort_order: parseInt(form.sort_order, 10) || 0,
      active: !!form.active,
    };
    const res = editing
      ? await supabase.from("home_items" as any).update(payload).eq("id", editing.id)
      : await supabase.from("home_items" as any).insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Saved" : "Created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-home-items"] });
    qc.invalidateQueries({ queryKey: ["home-items"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this home page item?")) return;
    const { error } = await supabase.from("home_items" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-home-items"] });
    qc.invalidateQueries({ queryKey: ["home-items"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home page items</h1>
          <p className="text-sm text-muted-foreground">Edit the "Hack Arsenal" grid on the homepage — name, price, logo, sold count, everything.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit item" : "New home item"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Price (Rs)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Sold count</Label><Input type="number" value={form.sold_count} onChange={e => setForm({ ...form, sold_count: e.target.value })} /></div>
              <div>
                <Label>Icon tone (style)</Label>
                <Select value={form.icon_tone} onValueChange={v => setForm({ ...form, icon_tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Click action</Label>
                <Select value={form.action || "__none__"} onValueChange={v => setForm({ ...form, action: v === "__none__" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Default (Buy Now → /order)</SelectItem>
                    {ACTIONS.filter(a => a.v).map(a => <SelectItem key={a.v} value={a.v}>{a.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Custom logo / image</Label>
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="" className="h-16 w-16 rounded-xl border object-cover" />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-xl border bg-secondary"><ImageIcon className="h-5 w-5 opacity-60" /></div>
                  )}
                  <label className="cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-secondary/60">
                    <Upload className="mr-2 inline h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
                    <input hidden type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                  </label>
                  {form.logo_url && <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, logo_url: "" })}>Remove</Button>}
                </div>
                <Input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="…or paste image URL" />
              </div>
              <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} /></div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.hot} onCheckedChange={v => setForm({ ...form, hot: v })} /> 🔥 Hot</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} /> Active</label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">{editing ? "Save" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr><th className="p-3">Item</th><th className="p-3">Price</th><th className="p-3">Sold</th><th className="p-3">Tone</th><th className="p-3">Order</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {items.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.logo_url
                      ? <img src={p.logo_url} alt="" className="h-10 w-10 rounded object-cover" />
                      : <div className="grid h-10 w-10 place-items-center rounded bg-secondary"><ImageIcon className="h-4 w-4 opacity-60" /></div>}
                    <div>
                      <div className="font-medium">{p.name} {p.hot && <span className="text-red-500">🔥</span>}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-semibold">Rs. {Number(p.price).toLocaleString()}</td>
                <td className="p-3">{p.sold_count}</td>
                <td className="p-3 text-muted-foreground">{p.icon_tone}</td>
                <td className="p-3">{p.sort_order}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
