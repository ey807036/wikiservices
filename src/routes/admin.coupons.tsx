import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });

type Coupon = {
  id: string; code: string; discount_type: "percent" | "fixed"; discount_value: number;
  min_subtotal: number; active: boolean; expires_at: string | null;
  usage_limit: number | null; used_count: number;
};

const blank = { code: "", discount_type: "percent" as "percent" | "fixed", discount_value: 10, min_subtotal: 0, active: true, expires_at: "", usage_limit: "" };

function AdminCoupons() {
  const qc = useQueryClient();
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data as Coupon[] ?? [],
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(blank);

  const startNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const startEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: Number(c.discount_value),
      min_subtotal: Number(c.min_subtotal), active: c.active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
      usage_limit: c.usage_limit?.toString() ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) { toast.error("Code required"); return; }
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_subtotal: Number(form.min_subtotal),
      active: form.active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    };
    const { error } = editing
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Coupon updated" : "Coupon created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />New coupon</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th>
              <th className="p-3">Min subtotal</th><th className="p-3">Used</th>
              <th className="p-3">Status</th><th className="p-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No coupons yet.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono font-bold">{c.code}</td>
                <td className="p-3 capitalize">{c.discount_type}</td>
                <td className="p-3">{c.discount_type === "percent" ? `${c.discount_value}%` : money(c.discount_value)}</td>
                <td className="p-3">{money(c.min_subtotal)}</td>
                <td className="p-3 text-muted-foreground">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {c.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit coupon" : "New coupon"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.discount_type} onValueChange={(v: any) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (Rs.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min subtotal (Rs.)</Label><Input type="number" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: Number(e.target.value) })} /></div>
              <div><Label>Usage limit</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value as any })} placeholder="Unlimited" /></div>
            </div>
            <div><Label>Expires at</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <Button onClick={save}>{editing ? "Save changes" : "Create coupon"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
