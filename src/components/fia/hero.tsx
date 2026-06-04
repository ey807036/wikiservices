import { FiaNeonLogo } from "./neon-logo";
import { FiaVerifiedBadge } from "./verified-badge";
import heroBook from "@/assets/fia-hero-book.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Settings = {
  fia_main_logo_url: string | null;
  fia_secondary_logo_url: string | null;
  fia_hero_title: string;
  fia_hero_subtitle: string;
  fia_hero_tagline: string;
  fia_brand_title: string;
  fia_brand_byline: string;
};

export function FiaHero() {
  const { data: settings } = useQuery({
    queryKey: ["fia_site_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("fia_main_logo_url, fia_secondary_logo_url, fia_hero_title, fia_hero_subtitle, fia_hero_tagline, fia_brand_title, fia_brand_byline")
        .eq("id", 1).maybeSingle();
      return data as unknown as Settings | null;
    },
  });

  const heroTitle = settings?.fia_hero_title ?? "WIKI PREP";
  const heroSubtitle = settings?.fia_hero_subtitle ?? "Your Success Starts Here";
  const heroTagline = settings?.fia_hero_tagline ?? "Best platform for FIA, FPSC, PPSC, NTS and all other competitive exam preparation.";
  const brandTitle = settings?.fia_brand_title ?? "FIA PREPARATION";
  const brandByline = settings?.fia_brand_byline ?? "BY WIKI";

  const [firstWord, ...restTitle] = heroTitle.split(" ");
  const secondWord = restTitle.join(" ");

  return (
    <section className="px-3 pt-4 pb-8">
      <div className="relative rounded-2xl overflow-hidden p-5"
        style={{
          background: "linear-gradient(160deg, oklch(0.16 0.05 270) 0%, oklch(0.13 0.04 260) 60%, oklch(0.15 0.06 290) 100%)",
          border: "1px solid oklch(0.6 0.2 280 / 0.4)",
          boxShadow: "0 0 28px oklch(0.6 0.2 280 / 0.25), inset 0 0 40px oklch(0.5 0.2 260 / 0.15)",
        }}>
        <img src={heroBook} alt="" aria-hidden
          className="absolute -top-2 -right-6 w-40 sm:w-56 opacity-90 pointer-events-none select-none" />

        <h1 className="relative text-3xl sm:text-4xl font-bold leading-tight">
          <span style={{
            background: "linear-gradient(90deg, oklch(0.85 0.18 200), oklch(0.78 0.2 240))",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{firstWord}</span>
          {secondWord && <>{" "}<span style={{
            background: "linear-gradient(90deg, oklch(0.78 0.22 320), oklch(0.8 0.2 340))",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{secondWord}</span></>}
        </h1>
        <p className="relative mt-3 text-base font-semibold text-white max-w-[60%]">{heroSubtitle}</p>
        <p className="relative mt-1 text-xs text-white/70 max-w-[62%] leading-relaxed">{heroTagline}</p>

        <div className="relative mt-5 grid grid-cols-2 gap-2 text-[10px]">
          <Stat icon="📘" title="10,000+" sub="MCQs" color="oklch(0.78 0.2 200)" />
          <Stat icon="🎯" title="Exam Style" sub="Practice" color="oklch(0.8 0.2 145)" />
          <Stat icon="📈" title="Instant" sub="Results" color="oklch(0.8 0.2 320)" />
          <Stat icon="🏆" title="Track Your" sub="Progress" color="oklch(0.85 0.2 80)" />
        </div>
      </div>

      <div className="mt-10 text-center">
        <div className="relative inline-block">
          <FiaNeonLogo size={120} src={settings?.fia_main_logo_url ?? undefined} />
          {settings?.fia_secondary_logo_url && (
            <div className="absolute -bottom-1 -right-2 rounded-full overflow-hidden border-2"
              style={{ width: 52, height: 52, borderColor: "oklch(0.85 0.25 145)", boxShadow: "0 0 16px oklch(0.85 0.25 145 / 0.7)" }}>
              <img src={settings.fia_secondary_logo_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mt-4 border"
          style={{ borderColor: "oklch(0.78 0.2 145 / 0.5)", background: "oklch(0.78 0.2 145 / 0.1)", boxShadow: "0 0 18px oklch(0.78 0.2 145 / 0.3)" }}>
          <FiaVerifiedBadge size={16} />
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "oklch(0.85 0.2 145)" }}>
            Verified · Official
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold inline-flex items-center justify-center gap-2 flex-wrap"
          style={{ color: "oklch(0.85 0.22 145)", textShadow: "0 0 14px oklch(0.85 0.22 145 / 0.7)" }}>
          <span>{brandTitle}</span>
          <FiaVerifiedBadge size={26} />
        </h2>
        <p className="mt-2 text-xs text-zinc-400 tracking-wider">{brandByline}</p>

        <p className="mt-4 max-w-md mx-auto text-zinc-300 text-sm leading-relaxed px-2">
          Apni post select karein — har subject mein random MCQs ka test khelain.
          Sahi jawab <span className="text-[oklch(0.85_0.22_145)] font-semibold">green</span>,
          ghalat <span className="text-[oklch(0.7_0.28_25)] font-semibold">red</span>,
          end mein cool result screen.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: "oklch(0.22 0.04 250)", border: "1px solid oklch(0.85 0.22 145 / 0.3)", color: "oklch(0.85 0.22 145)" }}>
          ✨ 100% FREE · Mobile Friendly · Instant Results
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, title, sub, color }: { icon: string; title: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
      style={{ background: "oklch(0.18 0.03 260 / 0.6)", border: `1px solid ${color}` }}>
      <span style={{ filter: `drop-shadow(0 0 6px ${color})` }}>{icon}</span>
      <div className="leading-tight">
        <div className="font-bold text-xs" style={{ color }}>{title}</div>
        <div className="text-white/70 text-[9px]">{sub}</div>
      </div>
    </div>
  );
}
