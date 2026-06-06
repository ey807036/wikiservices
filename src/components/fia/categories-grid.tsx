import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NEON_GREEN = "oklch(0.85 0.22 145)";

type Category = {
  id: string; slug: string; name: string; subtitle: string;
  description: string; accent_color: string; icon_url: string | null;
};

export function FiaCategoriesGrid() {
  const { data: categories } = useQuery({
    queryKey: ["fia_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fia_categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  return (
    <section id="categories-section" className="px-3 py-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span style={{ color: NEON_GREEN }}>◂</span>
        <span style={{ color: NEON_GREEN, textShadow: "0 0 10px oklch(0.85 0.22 145 / 0.6)" }}>Start Test</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories?.map((c) => (
          <Link key={c.id} to="/fia-preparation/$slug" params={{ slug: c.slug }}
            className="group relative rounded-2xl p-4 flex flex-col items-center text-center transition-transform hover:-translate-y-1"
            style={{
              background: "oklch(0.14 0.04 260 / 0.7)",
              border: `1px solid ${c.accent_color}55`,
              boxShadow: `0 0 18px ${c.accent_color}33, inset 0 0 24px ${c.accent_color}15`,
            }}>
            <div className="w-16 h-16 rounded-full mb-2 flex items-center justify-center font-bold text-lg overflow-hidden"
              style={{
                background: c.icon_url ? "transparent" : `radial-gradient(circle, ${c.accent_color}30 0%, transparent 70%)`,
                border: `2px solid ${c.accent_color}`,
                color: c.accent_color,
                textShadow: c.icon_url ? undefined : `0 0 10px ${c.accent_color}`,
                boxShadow: `0 0 16px ${c.accent_color}80`,
              }}>
              {c.icon_url ? <img src={c.icon_url} alt={c.name} className="w-full h-full object-cover" /> : "★"}
            </div>
            <div className="text-lg font-bold" style={{ color: c.accent_color, textShadow: `0 0 8px ${c.accent_color}80` }}>
              {c.name}
            </div>
            <div className="text-xs font-semibold" style={{ color: `${c.accent_color}cc` }}>{c.subtitle}</div>
            <div className="text-[10px] text-white/70 mt-1 leading-tight">{c.description}</div>
            <div className="mt-3 text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1 font-bold tracking-wider"
              style={{ borderColor: NEON_GREEN, color: NEON_GREEN, boxShadow: `0 0 12px oklch(0.85 0.22 145 / 0.4)` }}>
              ▶ START TEST
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
