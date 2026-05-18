import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Plus, Trash2, Pencil, Image as ImageIcon, Video, X } from "lucide-react";

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
  sizes: string[];
  colors: string[];
  gallery: Record<string, string[]>;
};

const blank: Form = {
  title: "", slug: "", description: "", price: "", old_price: "",
  image_url: "", video_url: "", in_stock: true, active: true,
  sizes: ["S", "M", "L", "XL"], colors: [], gallery: {},
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function AdminStore() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(blank);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["admin-store-products"],
    queryFn: async () => {
      const { data } = await supabase.from("store_products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const uploadFile = async (file: File, label: string): Promise<string | null> => {
    setUploading(label);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${label}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("store-products").getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
      return null;
    } finally {
      setUploading(null);
    }
  };

  const uploadMain = async (file: File, kind: "image" | "video") => {
    const url = await uploadFile(file, kind);
    if (url) setForm((f) => ({ ...f, [kind === "image" ? "image_url" : "video_url"]: url }));
  };

  const uploadColorImg = async (file: File, color: string) => {
    const url = await uploadFile(file, `gallery-${slugify(color)}`);
    if (!url) return;
    setForm((f) => ({
      ...f,
      gallery: { ...f.gallery, [color]: [...(f.gallery[color] ?? []), url] },
    }));
  };

  const removeColorImg = (color: string, idx: number) => {
    setForm((f) => ({
      ...f,
      gallery: { ...f.gallery, [color]: (f.gallery[color] ?? []).filter((_, i) => i !== idx) },
    }));
  };

  const addColor = () => {
    const c = newColor.trim();
    if (!c) return;
    if (form.colors.includes(c)) return toast.error("Color already added");
    setForm({ ...form, colors: [...form.colors, c], gallery: { ...form.gallery, [c]: [] } });
    setNewColor("");
  };

  const removeColor = (c: string) => {
    const { [c]: _, ...rest } = form.gallery;
    setForm({ ...form, colors: form.colors.filter((x) => x !== c), gallery: rest });
  };

  const addSize = () => {
    const s = newSize.trim();
    if (!s) return;
    if (form.sizes.includes(s)) return;
    setForm({ ...form, sizes: [...form.sizes, s] });
    setNewSize("");
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
      sizes: form.sizes,
      colors: form.colors,
      gallery: form.gallery,
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
      sizes: p.sizes?.length ? p.sizes : ["S", "M", "L", "XL"],
      colors: p.colors ?? [],
      gallery: p.gallery ?? {},
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
        <p className="text-sm text-muted-foreground">Manage items, sizes, colors, and color-wise image galleries.</p>
      </div>

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

        {/* Default image & video */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Default Image</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL or upload" />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted p-3 text-sm hover:bg-secondary/50">
              <Upload className="h-4 w-4" />
              {uploading === "image" ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadMain(e.target.files[0], "image")} />
            </label>
            {form.image_url && <img src={form.image_url} alt="" className="h-24 w-24 object-cover rounded-lg border" />}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Video className="h-4 w-4" /> Video (optional, autoplay)</Label>
            <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="URL or upload" />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted p-3 text-sm hover:bg-secondary/50">
              <Upload className="h-4 w-4" />
              {uploading === "video" ? "Uploading…" : "Upload video"}
              <input type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && uploadMain(e.target.files[0], "video")} />
            </label>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-2 rounded-xl border bg-secondary/30 p-3">
          <Label>Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {form.sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-lg bg-card border px-2 py-1 text-xs font-bold">
                {s}
                <button type="button" onClick={() => setForm({ ...form, sizes: form.sizes.filter((x) => x !== s) })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="e.g. XXL" className="max-w-[160px]" />
            <Button type="button" size="sm" onClick={addSize}>Add size</Button>
          </div>
        </div>

        {/* Colors + per-color gallery */}
        <div className="space-y-3 rounded-xl border bg-secondary/30 p-3">
          <Label>Colors (with image gallery per color)</Label>
          <div className="flex gap-2">
            <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="e.g. Red, Black, Navy Blue" />
            <Button type="button" size="sm" onClick={addColor}>Add color</Button>
          </div>

          {form.colors.map((c) => (
            <div key={c} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">{c}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeColor(c)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.gallery[c] ?? []).map((src, i) => (
                  <div key={src + i} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeColorImg(c, i)}
                      className="absolute top-0 right-0 grid h-5 w-5 place-items-center bg-black/70 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-xs hover:bg-secondary/50">
                  {uploading === `gallery-${slugify(c)}` ? "…" : <Upload className="h-4 w-4" />}
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadColorImg(e.target.files[0], c)} />
                </label>
              </div>
            </div>
          ))}
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
                  <div className="text-xs text-muted-foreground">
                    Rs. {p.price} · {p.active ? "Active" : "Hidden"} · {(p.colors?.length ?? 0)} colors · {(p.sizes?.length ?? 0)} sizes
                  </div>
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
