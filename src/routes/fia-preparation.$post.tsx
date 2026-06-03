import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ArrowLeft, Play } from "lucide-react";

export const Route = createFileRoute("/fia-preparation/$post")({
  component: PostPage,
});

type Post = { id: string; slug: string; name: string; accent_color: string; description: string | null };
type Subject = { id: string; slug: string; name: string; sort_order: number };

function PostPage() {
  const { post } = useParams({ from: "/fia-preparation/$post" });
  const [postData, setPostData] = useState<Post | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase
        .from("fia_posts")
        .select("*")
        .eq("slug", post)
        .maybeSingle();
      if (!p) return;
      setPostData(p as Post);

      const { data: s } = await supabase
        .from("fia_subjects")
        .select("*")
        .eq("post_id", p.id)
        .eq("active", true)
        .order("sort_order");
      setSubjects((s ?? []) as Subject[]);

      const { data: q } = await supabase
        .from("fia_questions")
        .select("subject_id")
        .in("subject_id", (s ?? []).map((x: any) => x.id));
      const c: Record<string, number> = {};
      (q ?? []).forEach((row: any) => {
        c[row.subject_id] = (c[row.subject_id] ?? 0) + 1;
      });
      setCounts(c);
    })();
  }, [post]);

  const accent = postData?.accent_color ?? "#22d3ee";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />
      <section className="container mx-auto px-4 py-8">
        <Link
          to="/fia-preparation"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all posts
        </Link>
        <div className="mt-4">
          <h1
            className="text-3xl font-black tracking-tight sm:text-5xl"
            style={{ color: accent, textShadow: `0 0 24px ${accent}80` }}
          >
            {postData?.name ?? "Loading..."} Preparation
          </h1>
          {postData?.description && (
            <p className="mt-2 text-sm text-zinc-300">{postData.description}</p>
          )}
        </div>

        <h2 className="mt-8 mb-4 text-lg font-bold text-white">Subjects</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const total = counts[s.id] ?? 0;
            const disabled = total === 0;
            return (
              <Link
                key={s.id}
                to={disabled ? "/fia-preparation/$post" : "/fia-preparation/$post/$subject"}
                params={{ post, subject: s.slug }}
                onClick={(e) => disabled && e.preventDefault()}
                className={`group flex items-center justify-between rounded-xl border bg-zinc-900/60 p-4 transition-all ${
                  disabled ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5"
                }`}
                style={{
                  borderColor: accent + "55",
                  boxShadow: disabled ? undefined : `0 0 18px ${accent}33`,
                }}
              >
                <div>
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-xs text-zinc-400">
                    {total} MCQs {disabled && "· coming soon"}
                  </div>
                </div>
                <div
                  className="grid h-10 w-10 place-items-center rounded-full"
                  style={{
                    color: accent,
                    backgroundColor: accent + "1f",
                    boxShadow: `0 0 12px ${accent}66`,
                  }}
                >
                  <Play className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}
