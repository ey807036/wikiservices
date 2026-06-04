import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FiaVerifiedBadge } from "@/components/fia/verified-badge";
import { FiaNeonLogo } from "@/components/fia/neon-logo";
import { FiaMcqAdminSection } from "@/components/fia/mcq-admin-section";
import { uploadFiaFile, deleteFiaByUrl } from "@/lib/fia/storage";
import type { FiaPostData } from "@/components/fia/post-card";

export const Route = createFileRoute("/admin/fia")({
  head: () => ({ meta: [{ title: "FIA Preparation Admin — Wikiservices" }] }),
  component: AdminFiaPage,
});

type Settings = {
  fia_main_logo_url: string | null;
  fia_secondary_logo_url: string | null;
  fia_header_brand: string;
  fia_hero_title: string;
  fia_hero_subtitle: string;
  fia_hero_tagline: string;
  fia_brand_title: string;
  fia_brand_byline: string;
  fia_footer_text: string;
};

const DEFAULT_SETTINGS: Settings = {
  fia_main_logo_url: null,
  fia_secondary_logo_url: null,
  fia_header_brand: "FIA · WIKI",
  fia_hero_title: "WIKI PREP",
  fia_hero_subtitle: "Your Success Starts Here",
  fia_hero_tagline: "Best platform for FIA, FPSC, PPSC, NTS and all other competitive exam preparation.",
  fia_brand_title: "FIA PREPARATION",
  fia_brand_byline: "BY WIKI",
  fia_footer_text: "© 2026 FIA Preparation by Wiki. All rights reserved.",
};

function AdminFiaPage() {
  const [posts, setPosts] = useState<FiaPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FiaPostData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("fia_posts").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data ?? []) as FiaPostData[]);
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("site_settings")
      .select("fia_main_logo_url, fia_secondary_logo_url, fia_header_brand, fia_hero_title, fia_hero_subtitle, fia_hero_tagline, fia_brand_title, fia_brand_byline, fia_footer_text")
      .eq("id", 1).maybeSingle();
    if (data) setSettings({ ...DEFAULT_SETTINGS, ...(data as unknown as Settings) });
  };

  useEffect(() => { loadPosts(); loadSettings(); }, []);

  const handleDelete = async (post: FiaPostData) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    for (const url of [...(post.images ?? []), ...(post.videos ?? [])]) {
      await deleteFiaByUrl(url);
    }
    const { error } = await supabase.from("fia_posts").delete().eq("id", post.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadPosts(); }
  };

  const uploadLogo = async (file: File, kind: "main" | "secondary") => {
    try {
      const url = await uploadFiaFile(file, "site");
      const column = kind === "main" ? "fia_main_logo_url" : "fia_secondary_logo_url";
      const { error: upErr } = await supabase.from("site_settings")
        .update({ [column]: url, updated_at: new Date().toISOString() } as any).eq("id", 1);
      if (upErr) throw upErr;
      toast.success(`${kind === "main" ? "Main" : "Small"} logo updated`);
      loadSettings();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    }
  };

  const removeLogo = async (kind: "main" | "secondary") => {
    const column = kind === "main" ? "fia_main_logo_url" : "fia_secondary_logo_url";
    const url = kind === "main" ? settings.fia_main_logo_url : settings.fia_secondary_logo_url;
    if (url) await deleteFiaByUrl(url);
    await supabase.from("site_settings").update({ [column]: null } as any).eq("id", 1);
    toast.success("Removed");
    loadSettings();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <FiaNeonLogo size={56} src={settings.fia_main_logo_url ?? undefined} />
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            FIA Preparation Admin <FiaVerifiedBadge size={18} />
          </h1>
          <p className="text-sm text-muted-foreground">Logos, homepage text, posts aur MCQs yahan se manage karen.</p>
        </div>
      </div>

      {/* Branding */}
      <section className="rounded-2xl p-5 border border-white/10 bg-card">
        <h2 className="text-lg font-bold mb-4">FIA Branding (Logos)</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Big circle = main FIA logo. Choota circle = apni dosri picture upload kar saktay hain (saath dikhegi).
        </p>
        <div className="flex items-center gap-8 flex-wrap">
          <div className="relative">
            <FiaNeonLogo size={120} src={settings.fia_main_logo_url ?? undefined} />
            {settings.fia_secondary_logo_url && (
              <div className="absolute -bottom-1 -right-2 rounded-full overflow-hidden border-2"
                style={{ width: 48, height: 48, borderColor: "oklch(0.85 0.25 145)", boxShadow: "0 0 12px oklch(0.85 0.25 145 / 0.7)" }}>
                <img src={settings.fia_secondary_logo_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <LogoUploader label="Main Logo (Big Circle)" current={settings.fia_main_logo_url}
              onUpload={(f) => uploadLogo(f, "main")} onRemove={() => removeLogo("main")} />
            <LogoUploader label="Small Circle Logo (Overlay)" current={settings.fia_secondary_logo_url}
              onUpload={(f) => uploadLogo(f, "secondary")} onRemove={() => removeLogo("secondary")} />
          </div>
        </div>
      </section>

      <HomepageContentEditor settings={settings} onSaved={loadSettings} />

      {/* Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Manage Posts</h2>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 rounded-lg font-bold text-sm bg-[oklch(0.85_0.22_145)] text-black hover:opacity-90"
            style={{ boxShadow: "0 0 18px oklch(0.85 0.22 145 / 0.5)" }}>+ NEW POST</button>
        </div>

        {loading ? <p className="text-muted-foreground">Loading...</p> :
          posts.length === 0 ? (
            <div className="rounded-2xl p-10 text-center text-muted-foreground border border-white/10">
              No posts yet. Click <strong>+ NEW POST</strong> to add one.
            </div>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p.id} className="rounded-xl p-4 flex items-center gap-4 border border-white/10 bg-card">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">no img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {p.images?.length ?? 0} img · {p.videos?.length ?? 0} video · {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => { setEditing(p); setShowForm(true); }}
                      className="text-xs px-3 py-1.5 rounded border border-input hover:bg-muted">Edit</button>
                    <button onClick={() => handleDelete(p)}
                      className="text-xs px-3 py-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </section>

      <FiaMcqAdminSection />

      {showForm && (
        <PostFormModal post={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); loadPosts(); }} />
      )}
    </div>
  );
}

function LogoUploader({ label, current, onUpload, onRemove }: {
  label: string; current: string | null;
  onUpload: (f: File) => Promise<void>; onRemove: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs px-3 py-2 rounded-lg border border-[oklch(0.85_0.22_145/0.4)] hover:bg-[oklch(0.85_0.22_145/0.1)] cursor-pointer">
        {busy ? "Uploading..." : `Upload ${label}`}
        <input type="file" accept="image/*" className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            setBusy(true); await onUpload(f); setBusy(false);
            e.target.value = "";
          }} />
      </label>
      {current && (
        <button onClick={onRemove} className="text-xs px-2 py-1 rounded border border-red-500/40 text-red-400">Remove</button>
      )}
    </div>
  );
}

function HomepageContentEditor({ settings, onSaved }: { settings: Settings; onSaved: () => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm(settings); }, [settings]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      fia_header_brand: form.fia_header_brand,
      fia_hero_title: form.fia_hero_title,
      fia_hero_subtitle: form.fia_hero_subtitle,
      fia_hero_tagline: form.fia_hero_tagline,
      fia_brand_title: form.fia_brand_title,
      fia_brand_byline: form.fia_brand_byline,
      fia_footer_text: form.fia_footer_text,
      updated_at: new Date().toISOString(),
    } as any).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Homepage text updated"); onSaved(); }
  };

  const Field = ({ label, k, area }: { label: string; k: keyof Settings; area?: boolean }) => (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {area ? (
        <textarea value={(form[k] as string) ?? ""} rows={2}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          className="mt-1 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm" />
      ) : (
        <input value={(form[k] as string) ?? ""}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          className="mt-1 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm" />
      )}
    </label>
  );

  return (
    <section className="rounded-2xl p-5 space-y-3 border border-white/10 bg-card">
      <h2 className="text-lg font-bold">FIA Homepage Wording</h2>
      <p className="text-xs text-muted-foreground">Saari FIA page ki wording yahan se badlein.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Header Brand" k="fia_header_brand" />
        <Field label="Hero Title (2 words colored)" k="fia_hero_title" />
        <Field label="Hero Subtitle" k="fia_hero_subtitle" />
        <Field label="Brand Title (under logo)" k="fia_brand_title" />
        <Field label="Brand Byline" k="fia_brand_byline" />
        <Field label="Footer Text" k="fia_footer_text" />
      </div>
      <Field label="Hero Tagline" k="fia_hero_tagline" area />
      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="px-4 py-2 rounded-lg bg-[oklch(0.85_0.22_145)] text-black text-sm font-semibold disabled:opacity-50">
          {saving ? "Saving..." : "Save Homepage Text"}
        </button>
      </div>
    </section>
  );
}

function PostFormModal({ post, onClose, onSaved }: {
  post: FiaPostData | null; onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [images, setImages] = useState<string[]>(post?.images ?? []);
  const [videos, setVideos] = useState<string[]>(post?.videos ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (files: FileList | null, kind: "image" | "video") => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFiaFile(file, kind === "image" ? "images" : "videos");
        uploaded.push(url);
      } catch (e: any) {
        toast.error(e.message ?? "Upload failed");
      }
    }
    if (kind === "image") setImages((cur) => [...cur, ...uploaded]);
    else setVideos((cur) => [...cur, ...uploaded]);
    setUploading(false);
  };

  const removeFile = async (url: string, kind: "image" | "video") => {
    await deleteFiaByUrl(url);
    if (kind === "image") setImages((c) => c.filter((u) => u !== url));
    else setVideos((c) => c.filter((u) => u !== url));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const payload = { title: title.trim(), description, images, videos };
    const { error } = post
      ? await supabase.from("fia_posts").update(payload).eq("id", post.id)
      : await supabase.from("fia_posts").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(post ? "Updated" : "Created");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSave} className="rounded-2xl p-6 w-full max-w-lg my-8 bg-card border border-white/10">
        <h2 className="text-xl font-bold mb-4">{post ? "Edit Post" : "New Post"}</h2>

        <label className="block mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="mt-1 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm" />
        </label>

        <label className="block mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className="mt-1 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm" />
        </label>

        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Images</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(url, "image")}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition">×</button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-input hover:border-[oklch(0.85_0.22_145)] flex items-center justify-center cursor-pointer text-xs text-muted-foreground text-center px-2">
              {uploading ? "..." : "+ Image"}
              <input type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => handleUpload(e.target.files, "image")} />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Videos</span>
          <div className="mt-2 space-y-2">
            {videos.map((url) => (
              <div key={url} className="relative rounded-lg overflow-hidden bg-black">
                <video src={url} controls className="w-full max-h-48" />
                <button type="button" onClick={() => removeFile(url, "video")}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs w-7 h-7 rounded-full">×</button>
              </div>
            ))}
            <label className="block rounded-lg border-2 border-dashed border-input hover:border-[oklch(0.85_0.22_145)] cursor-pointer text-xs text-muted-foreground text-center py-4">
              {uploading ? "Uploading..." : "+ Add Video(s)"}
              <input type="file" multiple accept="video/*" className="hidden"
                onChange={(e) => handleUpload(e.target.files, "video")} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input text-sm">Cancel</button>
          <button type="submit" disabled={saving || uploading}
            className="px-4 py-2 rounded-lg bg-[oklch(0.85_0.22_145)] text-black text-sm font-semibold disabled:opacity-50">
            {saving ? "Saving..." : (post ? "Update" : "Create")}
          </button>
        </div>
      </form>
    </div>
  );
}
