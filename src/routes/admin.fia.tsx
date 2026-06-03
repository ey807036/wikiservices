import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Upload, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/fia")({ component: AdminFia });

type Post = { id: string; slug: string; name: string; accent_color: string; sort_order: number; active: boolean };
type Subject = { id: string; post_id: string; slug: string; name: string; sort_order: number; active: boolean };
type Question = { id: string; subject_id: string; question: string; options: string[]; correct_answer: string };

function AdminFia() {
  const [tab, setTab] = useState<"logos" | "posts" | "subjects" | "questions">("logos");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FIA Preparation</h1>
        <p className="text-sm text-muted-foreground">Manage logos, posts, subjects & MCQs</p>
      </div>
      <div className="flex flex-wrap gap-2 border-b">
        {(["logos", "posts", "subjects", "questions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "logos" && <LogosTab />}
      {tab === "posts" && <PostsTab />}
      {tab === "subjects" && <SubjectsTab />}
      {tab === "questions" && <QuestionsTab />}
    </div>
  );
}

function LogosTab() {
  const [logo, setLogo] = useState<string | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "badge" | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("fia_logo_url, fia_badge_url")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLogo(data.fia_logo_url);
          setBadge(data.fia_badge_url);
        }
      });
  }, []);

  const upload = async (file: File, field: "fia_logo_url" | "fia_badge_url") => {
    setUploading(field === "fia_logo_url" ? "logo" : "badge");
    try {
      const path = `fia/${field}-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("store-products").getPublicUrl(path);
      const url = pub.publicUrl;
      await supabase.from("site_settings").update({ [field]: url }).eq("id", 1);
      if (field === "fia_logo_url") setLogo(url);
      else setBadge(url);
      toast.success("Uploaded ✅");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Main Logo (Bookmark)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logo ? (
            <img src={logo} alt="" className="h-32 w-32 object-contain rounded-lg border" />
          ) : (
            <div className="h-32 w-32 rounded-lg border-2 border-dashed grid place-items-center text-muted-foreground text-xs">
              No logo
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "fia_logo_url")}
            />
            <Button asChild variant="outline" size="sm">
              <span>
                <Upload className="h-3.5 w-3.5 mr-1" /> {uploading === "logo" ? "Uploading..." : "Upload logo"}
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Round Green Badge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {badge ? (
            <img src={badge} alt="" className="h-32 w-32 object-cover rounded-full border ring-2 ring-emerald-400" />
          ) : (
            <div className="h-32 w-32 rounded-full border-2 border-dashed border-emerald-400 grid place-items-center text-muted-foreground text-xs">
              No badge
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "fia_badge_url")}
            />
            <Button asChild variant="outline" size="sm">
              <span>
                <Upload className="h-3.5 w-3.5 mr-1" /> {uploading === "badge" ? "Uploading..." : "Upload badge"}
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

function PostsTab() {
  const [items, setItems] = useState<Post[]>([]);
  const [form, setForm] = useState({ slug: "", name: "", accent_color: "#22d3ee" });

  const load = async () => {
    const { data } = await supabase.from("fia_posts").select("*").order("sort_order");
    setItems((data ?? []) as Post[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.slug || !form.name) return toast.error("Slug & name required");
    const { error } = await supabase.from("fia_posts").insert({ ...form, sort_order: items.length + 1 });
    if (error) return toast.error(error.message);
    setForm({ slug: "", name: "", accent_color: "#22d3ee" });
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this post and all its subjects/questions?")) return;
    await supabase.from("fia_posts").delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="h-8 w-8 rounded-full" style={{ background: p.accent_color }} />
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.slug}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [postId, setPostId] = useState<string>("");
  const [form, setForm] = useState({ slug: "", name: "" });

  const load = async () => {
    const { data: p } = await supabase.from("fia_posts").select("*").order("sort_order");
    setPosts((p ?? []) as Post[]);
    if (!postId && p?.[0]) setPostId(p[0].id);
    const { data: s } = await supabase.from("fia_subjects").select("*").order("sort_order");
    setSubjects((s ?? []) as Subject[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!postId || !form.slug || !form.name) return toast.error("All fields required");
    const filtered = subjects.filter((s) => s.post_id === postId);
    const { error } = await supabase.from("fia_subjects").insert({
      post_id: postId, slug: form.slug, name: form.name, sort_order: filtered.length + 1,
    });
    if (error) return toast.error(error.message);
    setForm({ slug: "", name: "" });
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete subject and its questions?")) return;
    await supabase.from("fia_subjects").delete().eq("id", id);
    load();
  };

  const filtered = subjects.filter((s) => s.post_id === postId);

  return (
    <Card>
      <CardHeader><CardTitle>Subjects</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Select value={postId} onValueChange={setPostId}>
          <SelectTrigger><SelectValue placeholder="Select post" /></SelectTrigger>
          <SelectContent>
            {posts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="slug (e.g. english)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add subject</Button>
        </div>
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.slug}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [postId, setPostId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [bulk, setBulk] = useState("");
  const [single, setSingle] = useState({ q: "", o1: "", o2: "", o3: "", o4: "", ans: "" });

  const loadPosts = async () => {
    const { data } = await supabase.from("fia_posts").select("*").order("sort_order");
    setPosts((data ?? []) as Post[]);
    if (!postId && data?.[0]) setPostId(data[0].id);
  };
  const loadSubjects = async () => {
    if (!postId) return;
    const { data } = await supabase.from("fia_subjects").select("*").eq("post_id", postId).order("sort_order");
    setSubjects((data ?? []) as Subject[]);
    if (data?.[0]) setSubjectId(data[0].id);
    else setSubjectId("");
  };
  const loadQuestions = async () => {
    if (!subjectId) return setQuestions([]);
    const { data } = await supabase.from("fia_questions").select("*").eq("subject_id", subjectId).order("sort_order");
    setQuestions((data ?? []) as Question[]);
  };

  useEffect(() => { loadPosts(); }, []);
  useEffect(() => { loadSubjects(); }, [postId]);
  useEffect(() => { loadQuestions(); }, [subjectId]);

  const addOne = async () => {
    if (!subjectId) return toast.error("Pick a subject");
    const opts = [single.o1, single.o2, single.o3, single.o4].filter(Boolean);
    if (opts.length < 2 || !single.q || !single.ans) return toast.error("Fill q, 2+ options, answer");
    const { error } = await supabase.from("fia_questions").insert({
      subject_id: subjectId, question: single.q, options: opts, correct_answer: single.ans,
      sort_order: questions.length + 1,
    });
    if (error) return toast.error(error.message);
    setSingle({ q: "", o1: "", o2: "", o3: "", o4: "", ans: "" });
    loadQuestions();
  };

  const addBulk = async () => {
    if (!subjectId) return toast.error("Pick a subject");
    try {
      const parsed = JSON.parse(bulk);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      const rows = parsed.map((r: any, i: number) => ({
        subject_id: subjectId,
        question: r.question,
        options: r.options,
        correct_answer: r.correct_answer,
        sort_order: questions.length + i + 1,
      }));
      const { error } = await supabase.from("fia_questions").insert(rows);
      if (error) throw error;
      toast.success(`Added ${rows.length} MCQs`);
      setBulk("");
      loadQuestions();
    } catch (e: any) {
      toast.error(e.message ?? "Invalid JSON");
    }
  };

  const del = async (id: string) => {
    await supabase.from("fia_questions").delete().eq("id", id);
    loadQuestions();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Select Subject</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Select value={postId} onValueChange={setPostId}>
            <SelectTrigger><SelectValue placeholder="Post" /></SelectTrigger>
            <SelectContent>
              {posts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add single MCQ</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Textarea placeholder="Question text" value={single.q} onChange={(e) => setSingle({ ...single, q: e.target.value })} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Option A" value={single.o1} onChange={(e) => setSingle({ ...single, o1: e.target.value })} />
            <Input placeholder="Option B" value={single.o2} onChange={(e) => setSingle({ ...single, o2: e.target.value })} />
            <Input placeholder="Option C" value={single.o3} onChange={(e) => setSingle({ ...single, o3: e.target.value })} />
            <Input placeholder="Option D" value={single.o4} onChange={(e) => setSingle({ ...single, o4: e.target.value })} />
          </div>
          <Input placeholder="Correct answer (must match one option exactly)" value={single.ans} onChange={(e) => setSingle({ ...single, ans: e.target.value })} />
          <Button onClick={addOne}><Plus className="h-4 w-4 mr-1" /> Add MCQ</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk add (paste JSON)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Format: <code>{`[{"question":"...","options":["A","B","C","D"],"correct_answer":"A"}]`}</code>
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea rows={6} placeholder='[{"question":"...","options":["..."],"correct_answer":"..."}]' value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <Button onClick={addBulk}><Plus className="h-4 w-4 mr-1" /> Import JSON</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing MCQs ({questions.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-2 rounded-lg border p-3">
              <div className="flex-1 text-sm">
                <div className="font-medium">{i + 1}. {q.question}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Options: {q.options.join(" · ")}
                </div>
                <div className="text-xs text-emerald-600">✓ {q.correct_answer}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(q.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { Label as _L } from "@/components/ui/label"; void _L;
