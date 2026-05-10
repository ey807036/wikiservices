import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image_url: "" });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const openNew = () => { setEditing(null); setForm({ name: "", slug: "", description: "", image_url: "" }); setOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image_url: c.image_url ?? "" }); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: form.description || null,
      image_url: form.image_url || null,
    };
    const res = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Updated" : "Created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} category</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div><Label>Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Description</th><th className="p-3"></th></tr></thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 text-muted-foreground line-clamp-1">{c.description ?? "—"}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
