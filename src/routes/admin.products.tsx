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
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const empty = {
  name: "", slug: "", description: "", short_description: "",
  price: "0", compare_price: "", stock: "0", sku: "", brand: "",
  images: "", video_url: "", category_id: "", featured: false, trending: false, active: true,
};

function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*")).data ?? [],
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const imageList = () => String(form.images || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const setImages = (urls: string[]) => setForm((f: any) => ({ ...f, images: urls.join(", ") }));
  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `store-one/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("store-products").upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
        const { data } = supabase.storage.from("store-products").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setImages([...imageList(), ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      ...p,
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : "",
      stock: String(p.stock),
      images: (p.images ?? []).join(", "),
      video_url: p.video_url ?? "",
      category_id: p.category_id ?? "",
      sku: p.sku ?? "", brand: p.brand ?? "", description: p.description ?? "", short_description: p.short_description ?? "",
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: form.description || null,
      short_description: form.short_description || null,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: parseInt(form.stock, 10) || 0,
      sku: form.sku || null,
      brand: form.brand || null,
      category_id: form.category_id || null,
      images: form.images.split(",").map((s: string) => s.trim()).filter(Boolean),
      video_url: form.video_url || null,
      featured: !!form.featured, trending: !!form.trending, active: !!form.active,
    };
    const res = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Product updated" : "Product created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
              <div><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Price *</Label><Input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Compare-at price</Label><Input type="number" step="0.01" value={form.compare_price} onChange={e => setForm({ ...form, compare_price: e.target.value })} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="sm:col-span-2 space-y-3">
                <Label>Images (multiple upload + manual URLs)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {imageList().map((src: string, i: number) => (
                    <div key={src + i} className="relative aspect-square overflow-hidden rounded-lg border bg-secondary/40">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setImages(imageList().filter((_: string, idx: number) => idx !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/85 text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed bg-secondary/30 text-xs text-muted-foreground hover:bg-secondary/60">
                    {uploading ? "Uploading…" : <><Upload className="h-5 w-5" />Upload</>}
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => uploadImages(e.target.files)} />
                  </label>
                </div>
                <Textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} placeholder="Image URLs, comma-separated" />
              </div>
              <div className="sm:col-span-2"><Label>Short description</Label><Input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.trending} onCheckedChange={v => setForm({ ...form, trending: v })} /> Trending</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} /> Active</label>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">{editing ? "Save changes" : "Create product"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                      : <div className="grid h-10 w-10 place-items-center rounded bg-secondary"><ImageIcon className="h-4 w-4 opacity-60" /></div>}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                <td className="p-3 font-semibold">{money(p.price)}</td>
                <td className="p-3">{p.stock}</td>
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
