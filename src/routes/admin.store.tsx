import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Plus, Trash2, Pencil, Image as ImageIcon, Video } from "lucide-react";

export const Route = createFileRoute("/admin/store")({ component: AdminStore });

type Form = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  old_price: string;
  image_url: string;
  video_url: string;
  in_stock: boolean;
  active: boolean;
};

const blank: Form = {
  title: "", slug: "", description: "", price: "", old_price: "",
  image_url: "", video_url: "", in_stock: true, active: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function AdminStore() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(blank);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-store-products"],
    queryFn: async () => {
      const { data } = await supabase.from("store_products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const upload = async (file: File, kind: "image" | "video") => {
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() || (kind === "image" ? "jpg" : "mp4");
      const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("store-products").getPublicUrl(path);
      setForm((f) => ({ ...f, [kind === "image" ? "image_url" : "video_url"]: data.publicUrl }));
      toast.success(`${kind} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    if (!form.price || isNaN(Number(form.price))) return toast.error("Valid price required");
    setSaving(true);
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description || null,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      image_url: form.image_url || null,
      video_url: form.video_url || null,
      in_stock: form.in_stock,
      active: form.active,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("store_products").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("store_products").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Updated" : "Product added");
    setForm(blank);
    qc.invalidateQueries({ queryKey: ["admin-store-products"] });
    qc.invalidateQueries({ queryKey: ["store-products"] });
  };

  const edit = (p: any) => {
    setForm({
      id: p.id, title: p.title, slug: p.slug, description: p.description ?? "",
      price: String(p.price), old_price: p.old_price ? String(p.old_price) : "",
      image_url: p.image_url ?? "", video_url: p.video_url ?? "",
      in_stock: p.in_stock, active: p.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("store_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-store-products"] });
    qc.invalidateQueries({ queryKey: ["store-products"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wiki Store</h1>
        <p className="text-sm text-muted-foreground">Add and manage store items. Image/video upload supported.</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold">
          <Plus className="h-4 w-4" /> {form.id ? "Edit Item" : "Add New Item"}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
          <div><Label>Price (Rs.)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div><Label>Old Price (optional)</Label><Input type="number" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} /></div>
        </div>

        <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

        {/* Image upload */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Image</Label>
            <div className="flex items-center gap-2">
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL or upload below" />
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted p-3 text-sm hover:bg-secondary/50">
              <Upload className="h-4 w-4" />
              {uploading === "image" ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "image")} />
            </label>
            {form.image_url && <img src={form.image_url} alt="" className="h-24 w-24 object-cover rounded-lg border" />}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Video className="h-4 w-4" /> Video (optional)</Label>
            <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="URL or upload below" />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted p-3 text-sm hover:bg-secondary/50">
              <Upload className="h-4 w-4" />
              {uploading === "video" ? "Uploading…" : "Upload video"}
              <input type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "video")} />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} /> In stock</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active (visible)</label>
        </div>

        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : (form.id ? "Update" : "Add Item")}</Button>
          {form.id && <Button variant="outline" onClick={() => setForm(blank)}>Cancel</Button>}
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b p-4 font-bold">All Items ({items.length})</div>
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No items yet. Add one above.</div>
        ) : (
          <div className="divide-y">
            {items.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-3">
                {p.image_url
                  ? <img src={p.image_url} className="h-14 w-14 rounded-lg object-cover border" alt="" />
                  : <div className="h-14 w-14 rounded-lg bg-secondary grid place-items-center"><ImageIcon className="h-5 w-5 opacity-50" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">Rs. {p.price} · {p.active ? "Active" : "Hidden"} · {p.in_stock ? "In stock" : "Out"}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
