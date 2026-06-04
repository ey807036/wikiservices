import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseMcqs, MCQ_EXAMPLE } from "@/lib/fia/mcq-parser";
import { uploadFiaFile, deleteFiaByUrl } from "@/lib/fia/storage";

type Category = {
  id: string; slug: string; name: string; subtitle: string;
  description: string; accent_color: string; sort_order: number;
  icon_url: string | null;
};

export function FiaMcqAdminSection() {
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string>("");
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);

  const load = async () => {
    const { data: c } = await supabase.from("fia_categories").select("*").order("sort_order");
    const list = (c ?? []) as Category[];
    setCats(list);
    if (list.length && !selectedId) setSelectedId(list[0].id);

    const { data: m } = await supabase.from("fia_mcqs").select("category_id");
    const cc: Record<string, number> = {};
    (m ?? []).forEach((r: any) => { cc[r.category_id] = (cc[r.category_id] ?? 0) + 1; });
    setCounts(cc);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const parsed = parseMcqs(paste);

  const handleUpload = async () => {
    if (!selectedId) { toast.error("Pehle category select karen"); return; }
    if (parsed.mcqs.length === 0) { toast.error("Koi valid MCQ nahi mila"); return; }
    setBusy(true);
    const rows = parsed.mcqs.map((m) => ({
      category_id: selectedId,
      question: m.question,
      options: m.options,
      correct_index: m.correct_index,
      explanation: m.explanation,
    }));
    const { error } = await supabase.from("fia_mcqs").insert(rows);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${rows.length} MCQs upload ho gaye!`);
    setPaste("");
    load();
  };

  const deleteAllInCategory = async (catId: string, name: string) => {
    if (!confirm(`Saare MCQs delete karen "${name}" se?`)) return;
    const { error } = await supabase.from("fia_mcqs").delete().eq("category_id", catId);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const deleteCategory = async (c: Category) => {
    if (!confirm(`Category "${c.name}" + uske saare MCQs delete?`)) return;
    const { error } = await supabase.from("fia_categories").delete().eq("id", c.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <section className="rounded-2xl p-5 space-y-5 border border-white/10 bg-card">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold">MCQ Manager (Bulk Upload)</h2>
        <button onClick={() => setShowAddCat(true)}
          className="text-xs px-3 py-1.5 rounded-full border border-[oklch(0.85_0.22_145/0.5)] hover:bg-[oklch(0.85_0.22_145/0.1)]">
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {cats.map((c) => (
          <CategoryTile key={c.id} c={c} selected={selectedId === c.id}
            count={counts[c.id] ?? 0}
            onSelect={() => setSelectedId(c.id)}
            onChanged={load}
            onClearQs={() => deleteAllInCategory(c.id, c.name)}
            onDelete={() => deleteCategory(c)} />
        ))}
      </div>

      <div>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Paste MCQs (selected: <strong style={{ color: cats.find((c) => c.id === selectedId)?.accent_color }}>
              {cats.find((c) => c.id === selectedId)?.name ?? "—"}
            </strong>)
          </span>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={14}
            placeholder={MCQ_EXAMPLE}
            className="mt-1 w-full bg-background border border-input rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[oklch(0.85_0.22_145)]" />
        </label>

        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer">📋 Format guide</summary>
          <div className="mt-2 p-3 rounded bg-muted/50 space-y-1">
            <p>Number se start karen, phir A) B) C) D). Correct ke aage <code className="text-[oklch(0.85_0.22_145)]">*</code>. Questions ke beech blank line.</p>
            <pre className="text-[10px] whitespace-pre-wrap mt-2">{MCQ_EXAMPLE}</pre>
          </div>
        </details>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs">
            <span className="text-[oklch(0.85_0.22_145)] font-bold">{parsed.mcqs.length}</span> valid ·{" "}
            <span className="text-red-400">{parsed.errors.length}</span> errors
            {parsed.errors.length > 0 && (
              <details className="inline-block ml-2">
                <summary className="cursor-pointer text-red-400">view errors</summary>
                <ul className="text-[10px] mt-1">
                  {parsed.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </details>
            )}
          </div>
          <button disabled={busy || parsed.mcqs.length === 0 || !selectedId}
            onClick={handleUpload}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[oklch(0.85_0.22_145)] text-black disabled:opacity-40">
            {busy ? "Uploading..." : `⬆ Upload ${parsed.mcqs.length} MCQs`}
          </button>
        </div>
      </div>

      {showAddCat && <AddCategoryModal onClose={() => setShowAddCat(false)} onSaved={() => { setShowAddCat(false); load(); }} />}
    </section>
  );
}

function AddCategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#22d3ee");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("fia_categories").insert({
      slug: slug.toLowerCase().trim(), name, description, accent_color: accent,
    });
    if (error) toast.error(error.message); else { toast.success("Created"); onSaved(); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <form onSubmit={save} className="rounded-2xl p-6 w-full max-w-sm space-y-3 bg-card border border-white/10">
        <h3 className="text-lg font-bold">New Category</h3>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. FIA)"
          className="w-full bg-background border border-input rounded px-3 py-2 text-sm" />
        <input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (e.g. fia)"
          className="w-full bg-background border border-input rounded px-3 py-2 text-sm" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"
          className="w-full bg-background border border-input rounded px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-xs">
          Accent color:
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-12 h-8" />
          <span>{accent}</span>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded border border-input">Cancel</button>
          <button type="submit" className="px-3 py-1.5 text-sm rounded bg-[oklch(0.85_0.22_145)] text-black font-semibold">Save</button>
        </div>
      </form>
    </div>
  );
}

function CategoryTile({
  c, selected, count, onSelect, onChanged, onClearQs, onDelete,
}: {
  c: Category; selected: boolean; count: number;
  onSelect: () => void; onChanged: () => void;
  onClearQs: () => void; onDelete: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const uploadIcon = async (file: File) => {
    setBusy(true);
    try {
      if (c.icon_url) await deleteFiaByUrl(c.icon_url);
      const url = await uploadFiaFile(file, `category-icons/${c.slug}`);
      const { error } = await supabase.from("fia_categories").update({ icon_url: url }).eq("id", c.id);
      if (error) throw error;
      toast.success(`${c.name} icon updated`);
      onChanged();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally { setBusy(false); }
  };

  const removeIcon = async () => {
    if (c.icon_url) await deleteFiaByUrl(c.icon_url);
    await supabase.from("fia_categories").update({ icon_url: null }).eq("id", c.id);
    toast.success("Icon removed");
    onChanged();
  };

  return (
    <div onClick={onSelect}
      className={`cursor-pointer rounded-lg p-3 border transition ${selected ? "ring-2" : ""}`}
      style={{
        borderColor: `${c.accent_color}66`,
        background: selected ? `${c.accent_color}15` : "transparent",
        boxShadow: selected ? `0 0 14px ${c.accent_color}55` : undefined,
      }}>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ border: `2px solid ${c.accent_color}`, boxShadow: `0 0 10px ${c.accent_color}80`, color: c.accent_color }}>
          {c.icon_url ? <img src={c.icon_url} alt="" className="w-full h-full object-cover" /> : <span>★</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm truncate" style={{ color: c.accent_color }}>{c.name}</div>
            <span className="text-[10px] text-muted-foreground shrink-0">{count} Qs</span>
          </div>
          <div className="text-[10px] text-muted-foreground truncate">{c.description}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
        <label className="text-[10px] px-2 py-0.5 rounded border cursor-pointer"
          style={{ borderColor: `${c.accent_color}80`, color: c.accent_color }}>
          {busy ? "..." : (c.icon_url ? "Change Icon" : "Upload Icon")}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadIcon(f); e.target.value = ""; }} />
        </label>
        {c.icon_url && (
          <button onClick={removeIcon} className="text-[10px] px-2 py-0.5 rounded border border-input">No Icon</button>
        )}
        <button onClick={onClearQs}
          className="text-[10px] px-2 py-0.5 rounded border border-yellow-500/40 text-yellow-400">Clear Qs</button>
        <button onClick={onDelete}
          className="text-[10px] px-2 py-0.5 rounded border border-red-500/40 text-red-400">Delete</button>
      </div>
    </div>
  );
}
