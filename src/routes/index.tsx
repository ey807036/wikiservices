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
    <div className="store-one-shell">
      {/* HERO — compact */}
      <section className="store-one-hero relative overflow-hidden border-b border-primary/60">
        <div className="store-one-circuit absolute inset-0" />
        <div className="container relative mx-auto grid gap-6 px-4 pt-6 pb-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pt-10 md:pb-12">
          <div className="text-center md:text-left">
          {shopLogo && (
            <div className="mb-3 flex justify-center md:justify-start">
              <NeonLogo src={shopLogo} size={96} glow="var(--primary)" />
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-xs md:text-sm font-black uppercase backdrop-blur ring-1 ring-white/50 shadow-[0_0_22px_rgba(255,255,255,0.25)]">
            <ShieldAlert className="h-4 w-4 text-white" />
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.55)]">{heroTag}</span>
          </span>
          <h1 className="mt-3 text-4xl font-black uppercase leading-[0.92] md:text-6xl">
            <span className="inline-flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]">Jammers &amp;</span>
              <span className="text-gradient">Hacking Devices</span>
              <VerifiedBadge color="green" size={22} />
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-base font-black uppercase tracking-wider md:mx-0 md:text-xl text-red-600 drop-shadow-[0_0_14px_rgba(220,38,38,0.7)]">
            {heroSubtitle}
          </p>
          <div className="mx-auto mt-3 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 md:mx-0 md:justify-start">
            {[
              [Wifi, "WiFi"], [Bluetooth, "Bluetooth"], [Smartphone, "SIM"], [Camera, "Drone Cam"],
              [Car, "Car"], [Tv, "TV"], [Snowflake, "AC"], [Laptop, "Laptop"],
              [Monitor, "PC"], [Music, "Sound"], [Lightbulb, "Bulb"], [Skull, "& More"],
            ].map(([Icon, label]: any) => (
              <span key={label} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary ring-1 ring-primary/45 shadow-[0_0_10px_oklch(0.85_0.27_145/0.18)]">
                <Icon className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link to="/sim-database">
              <Button
                size="lg"
                className="h-12 px-8 text-sm rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_28px_rgba(220,38,38,0.75)] hover:opacity-90"
              >
                <Skull className="mr-2 h-4 w-4" /> Free SimData <VerifiedBadge color="green" size={16} />
              </Button>
            </Link>
          </div>
          </div>
          <div className="relative mx-auto hidden h-72 w-72 place-items-center md:grid">
            <div className="absolute inset-0 rounded-full border-2 border-primary shadow-[0_0_42px_oklch(0.85_0.27_145/0.8)]" />
            <div className="absolute inset-6 rounded-full border border-primary/35 animate-[spin_18s_linear_infinite]" />
            <div className="grid h-52 w-52 place-items-center rounded-full bg-black/70 ring-1 ring-primary/60 shadow-[inset_0_0_34px_oklch(0.85_0.27_145/0.25)]">
              <span className="text-center text-5xl drop-shadow-[0_0_18px_oklch(0.85_0.27_145/0.75)]">💀</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO VIDEO — tight spacing */}
      <IntroVideo />

      {/* COMPACT CTA ROW */}
      <section className="container mx-auto px-4 pt-3">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          <Link to="/lucky-draw" className="group relative overflow-hidden rounded-2xl border border-primary/60 bg-gradient-to-br from-black via-card to-primary/10 p-3 shadow-[0_0_25px_-8px_var(--primary)] hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="text-3xl drop-shadow-[0_0_10px_oklch(0.85_0.18_85/0.8)]">💰</div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-primary">🔥 Daily 10 PM</div>
                <h3 className="text-sm font-black leading-tight text-primary truncate">
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
                className={`group relative overflow-hidden rounded-2xl border border-primary/30 bg-black/80 p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:[transform:translateY(-6px)_rotateX(4deg)_rotateY(-4deg)] [transform-style:preserve-3d] ${isHot ? "ring-2 ring-primary/70" : ""}`}
              >
                {isHot && (
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_12px_oklch(0.85_0.27_145/0.8)] animate-pulse">
                    <Flame className="h-3 w-3" /> Hot
                  </span>
                )}
                <span className="absolute right-3 top-3 z-10 rotate-6 rounded-lg bg-gradient-to-br from-primary via-success to-primary px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_18px_oklch(0.85_0.27_145/0.7)] ring-2 ring-white/30">
                  50% OFF 🔥
                </span>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl transition group-hover:bg-primary/40" />
                <div className="relative">
                  <NeonOrbitMark logoUrl={h.logo_url} tone={h.icon_tone} />
                  <h3 className={`mt-4 flex items-center gap-1.5 text-lg font-bold ${isHot ? "text-primary" : ""}`}>
                    {h.name} <VerifiedBadge color="green" size={16} />
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary via-success to-primary px-3 py-1 text-sm font-black text-primary-foreground shadow-[0_0_14px_oklch(0.85_0.27_145/0.55)]">
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
    <div className="relative inline-grid h-20 w-20 place-items-center [transform-style:preserve-3d]">
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
      <span className="pointer-events-none absolute inset-[4px] rounded-full bg-black" />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-emerald-400/50 shadow-[0_0_20px_#22ff88aa]" />
      <div className="relative grid h-16 w-16 place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 [transform:translateZ(10px)]">
        <ItemMark logoUrl={logoUrl} tone={tone} />
      </div>
    </div>
  );
}

function ItemMark({ logoUrl, tone }: { logoUrl?: string | null; tone: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/50 shadow-[0_0_22px_oklch(0.85_0.27_145/0.45)]" />;
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
