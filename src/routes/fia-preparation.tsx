import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { BookOpen, GraduationCap, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/fia-preparation")({
  head: () => ({
    meta: [
      { title: "FIA Preparation — MCQs Test & Practice | Wikiservices" },
      {
        name: "description",
        content:
          "Free FIA preparation MCQs for Constable, UDC, LDC, Assistant, ASI & Sub Inspector. Practice tests with instant results.",
      },
    ],
  }),
  component: FiaPreparationPage,
});

type Post = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  accent_color: string;
};

type Settings = {
  fia_logo_url: string | null;
  fia_badge_url: string | null;
};

function FiaPreparationPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Settings>({ fia_logo_url: null, fia_badge_url: null });
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: q }] = await Promise.all([
        supabase.from("fia_posts").select("*").eq("active", true).order("sort_order"),
        supabase.from("site_settings").select("fia_logo_url, fia_badge_url").eq("id", 1).maybeSingle(),
        supabase.from("fia_subjects").select("post_id, id").eq("active", true),
      ]);
      setPosts((p ?? []) as Post[]);
      if (s) setSettings(s as Settings);
      const c: Record<string, number> = {};
      (q ?? []).forEach((row: any) => {
        c[row.post_id] = (c[row.post_id] ?? 0) + 1;
      });
      setCounts(c);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      {/* HERO with logo slot + green badge */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Main bookmark logo */}
            <div className="relative">
              {settings.fia_logo_url ? (
                <img
                  src={settings.fia_logo_url}
                  alt="FIA Preparation Logo"
                  className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                />
              ) : (
                <div className="grid h-28 w-28 sm:h-36 sm:w-36 place-items-center rounded-2xl border-2 border-dashed border-cyan-400/40 bg-cyan-500/5 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                  <BookOpen className="h-12 w-12" />
                </div>
              )}
              {/* Round green neon badge */}
              <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3">
                {settings.fia_badge_url ? (
                  <img
                    src={settings.fia_badge_url}
                    alt="Badge"
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.9)]"
                  />
                ) : (
                  <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400 text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.85)] animate-pulse">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            <h1 className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
              FIA PREPARATION
            </h1>
            <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
              Apni post select karein — har subject mein random MCQs ka test khelain.
              Sahi jawab <span className="font-bold text-emerald-300">green</span>, ghalat{" "}
              <span className="font-bold text-rose-300">red</span>, end mein cool result screen.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> 100% FREE · Mobile Friendly · Instant Results
            </div>
          </div>
        </div>
      </section>

      {/* POSTS GRID */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="mb-6 text-center text-2xl font-black text-white">
          Select Your Post
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/fia-preparation/$post"
              params={{ post: p.slug }}
              className="group relative overflow-hidden rounded-2xl border bg-zinc-900/60 p-4 transition-transform hover:-translate-y-1"
              style={{
                borderColor: p.accent_color + "55",
                boxShadow: `0 0 22px ${p.accent_color}33`,
              }}
            >
              <div
                className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at center, ${p.accent_color}22, transparent 70%)`,
                }}
              />
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl font-black"
                style={{
                  color: p.accent_color,
                  backgroundColor: p.accent_color + "1f",
                  boxShadow: `0 0 16px ${p.accent_color}66`,
                }}
              >
                {p.name.charAt(0)}
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-bold text-white">{p.name}</div>
                <div className="text-[11px] text-zinc-400">
                  {counts[p.id] ?? 0} subjects
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold" style={{ color: p.accent_color }}>
                Explore <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
            Loading posts...
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
