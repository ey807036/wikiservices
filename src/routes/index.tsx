import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, ShoppingBag, Sparkles } from "lucide-react";
import { NeonLogo } from "@/components/site/neon-logo";
import { VerifiedBadge } from "@/components/site/verified-badge";
import {
  ArrowRight, Wifi, Bluetooth, Car, Tv, Snowflake,
  Laptop, Monitor, Smartphone, Music, Camera, Lightbulb, Skull, ShieldAlert, Flame,
} from "lucide-react";
import {
  WhatsAppLogo, IdCardRealLogo, DroneRealLogo, JammerRealLogo, SimRealLogo,
  DatabaseRealLogo, DangerRealLogo,
} from "@/components/site/brand-logos";

export const Route = createFileRoute("/")({ component: Home });

const fmt = (n: number) =>
  n >= 1000 ? `Rs. ${(n / 1000).toLocaleString()}${n % 1000 === 0 ? "k" : ""}` : `Rs. ${n}`;

const ADMIN_WA = "923186376181";
const waLink = (msg: string) => `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

function Home() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-shop"],
    queryFn: async () =>
      (await supabase
        .from("site_settings")
        .select("shop_logo_url, store_logo_url, shop_hero_tag, shop_hero_title, shop_hero_subtitle, lucky_title, lucky_subtitle")
        .eq("id", 1)
        .maybeSingle()).data,
  });
  const { data: items = [] } = useQuery({
    queryKey: ["home-items"],
    queryFn: async () =>
      (await supabase.from("home_items" as any).select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  const s = (settings as any) ?? {};
  const shopLogo = s.shop_logo_url;
  const storeLogo = s.store_logo_url;
  const heroTag = s.shop_hero_tag || "UNDERGROUND WIKI STORE 💀";
  const heroTitle = s.shop_hero_title || "Jammers & Hacking Devices";
  const heroSubtitle = s.shop_hero_subtitle || "Jam · Hijack · Control Anything";
  const luckyTitle = s.lucky_title || "1 Rupee Lucky Draw 💰";
  const luckySubtitle = s.lucky_subtitle || "Sirf Rs.1 invest karein — har raat 10 baje Quran-andazi, aik lucky user ko sara paisa mil jaye ga.";

  return (
    <div>
      {/* HERO — compact */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--primary)_18%,_transparent),_transparent_60%)]" />
        <div className="container relative mx-auto px-4 pt-6 pb-8 md:pt-10 md:pb-12 text-center">
          {shopLogo && (
            <div className="mb-3 flex justify-center">
              <NeonLogo src={shopLogo} size={80} glow="var(--primary)" />
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-4 py-1.5 text-xs md:text-sm font-bold backdrop-blur ring-1 ring-destructive/50">
            <ShieldAlert className="h-4 w-4 text-red-500" /> {heroTag}
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl">
            <span className="inline-flex items-center justify-center gap-2 text-gradient">
              {heroTitle} <VerifiedBadge color="green" size={22} />
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-base font-black uppercase tracking-wider md:text-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
            {heroSubtitle}
          </p>
          <div className="mx-auto mt-3 flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
            {[
              [Wifi, "WiFi"], [Bluetooth, "Bluetooth"], [Smartphone, "SIM"], [Camera, "Drone Cam"],
              [Car, "Car"], [Tv, "TV"], [Snowflake, "AC"], [Laptop, "Laptop"],
              [Monitor, "PC"], [Music, "Sound"], [Lightbulb, "Bulb"], [Skull, "& More"],
            ].map(([Icon, label]: any) => (
              <span key={label} className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-red-500/30">
                <Icon className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/sim-database">
              <Button
                size="lg"
                className="h-11 px-6 text-sm rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_25px_oklch(0.65_0.25_25/0.7)] hover:opacity-90"
              >
                <Skull className="mr-2 h-4 w-4" /> Free SimData <VerifiedBadge color="green" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO VIDEO — tight spacing */}
      <IntroVideo />

      {/* COMPACT CTA ROW */}
      <section className="container mx-auto px-4 pt-3">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          <Link to="/lucky-draw" className="group relative overflow-hidden rounded-2xl border border-red-500/60 bg-gradient-to-br from-red-950/80 via-black to-red-900/50 p-3 shadow-[0_0_25px_-8px_oklch(0.65_0.25_25/0.8)] hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="text-3xl drop-shadow-[0_0_10px_oklch(0.85_0.18_85/0.8)]">💰</div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-yellow-300">🔥 Daily 10 PM</div>
                <h3 className="text-sm font-black leading-tight bg-gradient-to-r from-red-400 to-yellow-300 bg-clip-text text-transparent truncate">
                  {luckyTitle}
                </h3>
                <p className="text-[11px] text-red-100/80 truncate">{luckySubtitle}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-red-300 shrink-0 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          <Link to="/store" className="group relative overflow-hidden rounded-2xl border border-primary/60 bg-gradient-to-br from-card via-card to-primary/10 p-3 shadow-[0_0_25px_-8px_var(--primary)] hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <NeonLogo src={storeLogo} size={40} glow="var(--primary)" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/40 shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-primary inline-flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Wiki Store · -30%
                </div>
                <h3 className="text-sm font-black leading-tight truncate flex items-center gap-1">
                  Visit Wiki Store <VerifiedBadge color="green" size={12} />
                </h3>
                <p className="text-[11px] text-muted-foreground truncate">Premium verified items, fast checkout.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* ITEMS GRID — no heading */}
      <section id="arsenal" className="container mx-auto px-4 py-6">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [perspective:1000px]">
          {items.map((h: any) => {
            const isHot = !!h.hot;
            return (
              <div
                key={h.id}
                className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:[transform:translateY(-6px)_rotateX(4deg)_rotateY(-4deg)] [transform-style:preserve-3d] ${isHot ? "ring-2 ring-red-500/70" : ""}`}
              >
                {isHot && (
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_12px_oklch(0.65_0.25_25/0.8)] animate-pulse">
                    <Flame className="h-3 w-3" /> Hot
                  </span>
                )}
                <span className="absolute right-3 top-3 z-10 rotate-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-pink-500 to-red-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-[0_0_18px_oklch(0.7_0.27_350/0.7)] ring-2 ring-white/30">
                  50% OFF 🔥
                </span>
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition ${isHot ? "bg-red-500/30 group-hover:bg-red-500/50" : "bg-primary/10 group-hover:bg-primary/30"}`} />
                <div className="relative">
                  <NeonOrbitMark logoUrl={h.logo_url} tone={h.icon_tone} />
                  <h3 className={`mt-4 flex items-center gap-1.5 text-lg font-bold ${isHot ? "text-red-500" : ""}`}>
                    {h.name} <VerifiedBadge color="green" size={16} />
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-3 py-1 text-sm font-black text-black shadow-[0_0_14px_oklch(0.85_0.18_85/0.55)]">
                      {fmt(Number(h.price))}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/40">
                      ✅ {Number(h.sold_count).toLocaleString()} sold
                    </span>
                  </div>
                  {h.action === "fakewa" ? (
                    <Link to="/fake-whatsapp" className="mt-3 block">
                      <Button size="sm" variant="cool" className="btn-neon mt-1 rounded-full px-5">
                        Buy Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : h.action === "pro" ? (
                    <Link to="/pro-accounts" className="mt-3 block">
                      <Button size="sm" variant="cool" className="btn-neon mt-1 rounded-full px-5">
                        Browse <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      to="/order"
                      search={{
                        item: h.name,
                        price: Number(h.price),
                        wa: waLink(`Salam! Payment done for: ${h.name} (Rs. ${Number(h.price)}). Please process my order.`),
                      }}
                      className="mt-3 block"
                    >
                      <Button size="sm" variant="cool" className="btn-neon mt-1 rounded-full px-5">
                        Buy Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function IntroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };
  return (
    <section className="container mx-auto px-4 pt-3">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border ring-2 ring-red-500/40 shadow-[0_0_30px_oklch(0.65_0.25_25/0.4)]">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <video
            ref={ref}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/intro.gif"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <button
            type="button"
            onClick={toggle}
            aria-label={muted ? "Unmute" : "Mute"}
            className="absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur ring-1 ring-white/30 hover:bg-black/80 transition"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Item logo with rotating green neon ring around it and a subtle 3D tilt.
 * Uses a custom logo image if provided, otherwise falls back to brand SVGs by tone.
 */
function NeonOrbitMark({ logoUrl, tone }: { logoUrl?: string | null; tone: string }) {
  return (
    <div className="relative inline-grid h-16 w-16 place-items-center [transform-style:preserve-3d]">
      {/* Rotating neon ring */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #22ff88 60deg, transparent 140deg, #00ffaa 220deg, transparent 320deg)",
          filter: "blur(2px)",
          animation: "spin 3.5s linear infinite",
        }}
      />
      <span className="pointer-events-none absolute inset-[3px] rounded-full bg-card" />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-emerald-400/50 shadow-[0_0_20px_#22ff88aa]" />
      <div className="relative grid h-12 w-12 place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 [transform:translateZ(10px)]">
        <ItemMark logoUrl={logoUrl} tone={tone} />
      </div>
    </div>
  );
}

function ItemMark({ logoUrl, tone }: { logoUrl?: string | null; tone: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" />;
  }
  if (tone === "whatsapp") return <WhatsAppLogo />;
  if (tone === "id") return <IdCardRealLogo />;
  if (tone === "drone") return <DroneRealLogo />;
  if (tone === "signal" || tone === "bluetooth") return <JammerRealLogo />;
  if (tone === "sim") return <SimRealLogo />;
  if (tone === "data") return <DatabaseRealLogo />;
  if (tone === "danger") return <DangerRealLogo />;
  if (tone === "premium") {
    return (
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 text-black font-black shadow-[0_0_18px_oklch(0.85_0.18_85/0.6)] ring-2 ring-white/30">
        ★
      </span>
    );
  }
  return <JammerRealLogo />;
}
