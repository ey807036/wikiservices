import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FiaHero } from "@/components/fia/hero";
import { FiaPreloadVideos } from "@/components/fia/result-video-circle";
import { FiaCategoriesGrid } from "@/components/fia/categories-grid";
import { FiaPostCard, type FiaPostData } from "@/components/fia/post-card";

export const Route = createFileRoute("/fia-preparation")({
  head: () => ({
    meta: [
      { title: "FIA Preparation by Wiki — Verified MCQs & Posts" },
      { name: "description", content: "FIA Preparation by Wiki — verified MCQs, posts and study material for FIA, PPSC, FPSC, NTS, ASF and Police." },
    ],
  }),
  component: FiaPreparationPage,
});

function FiaPreparationPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["fia_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fia_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as FiaPostData[];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["fia_site_settings_chrome"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("fia_footer_text")
        .eq("id", 1).maybeSingle();
      return data as unknown as { fia_footer_text: string } | null;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />
      <FiaHero />

      <div className="max-w-6xl mx-auto">
        <FiaCategoriesGrid />
      </div>

      <main className="px-4 pb-20 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6"
          style={{ color: "oklch(0.85 0.22 145)", textShadow: "0 0 12px oklch(0.85 0.22 145 / 0.6)" }}>
          Latest Posts
        </h2>

        {isLoading && <p className="text-center text-zinc-400">Loading posts...</p>}
        {!isLoading && (!posts || posts.length === 0) && (
          <div className="rounded-2xl p-10 text-center text-zinc-400 border border-white/10 bg-white/5">
            No posts yet. Admin se posts add karwaen.
          </div>
        )}
        {posts && posts.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <FiaPostCard key={p.id} post={p} />)}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-zinc-500 border-t border-white/10">
        {settings?.fia_footer_text ?? "© 2026 FIA Preparation by Wiki. All rights reserved."}
      </footer>
    </div>
  );
}
