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
  Laptop, Monitor, Smartphone, Music, Camera, Lightbulb, Skull, Zap, ShieldAlert, Star, Flame,
  Database, IdCard, MessageCircle, Crown,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

type Hack = {
  icon: any;
  name: string;
  desc: string;
  priceNum: number;
  sold: number;
  tone: string;
  logo?: "whatsapp" | "crown" | "database" | "danger" | "signal" | "drone";
  hot?: boolean;
  href?: string;       // external link (opens new tab)
  to?: string;         // internal route
  action?: "fakewa" | "pro";   // special handler
};

const fmt = (n: number) =>
  n >= 1000 ? `Rs. ${(n / 1000).toLocaleString()}${n % 1000 === 0 ? "k" : ""}` : `Rs. ${n}`;

const ADMIN_WA = "923186376181";
const waLink = (msg: string) => `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

const HACKS: Hack[] = [
  { icon: MessageCircle, name: "Fake WhatsApp Number", desc: "Anonymous WhatsApp numbers — pick & chat instantly", priceNum: 150, sold: 2000, tone: "whatsapp", logo: "whatsapp", hot: true, action: "fakewa" },
  { icon: Crown,         name: "Pro Accounts by Wiki", desc: "Netflix, CapCut Pro, Remini, Spotify, ChatGPT+, Canva & 20+ premium accounts", priceNum: 100, sold: 8200, tone: "premium", logo: "crown", hot: true, action: "pro" },
  { icon: Database,      name: "New SimData by Wiki",   desc: "Fresh 2024–2026 SIM owner data lookup (paid)", priceNum: 500, sold: 4500, tone: "data", logo: "database", hot: true },
  { icon: Wifi,          name: "WiFi Jammer",           desc: "Block any WiFi signal in range", priceNum: 5000, sold: 87, tone: "signal", logo: "signal", hot: true },
  { icon: Skull,         name: "All-in-One Device Hack 💀", desc: "Single device to control Car, TV, AC, Projector, Laptop, PC, Mobile, MP3/Sound, Camera, Bulb & more", priceNum: 5000, sold: 42, tone: "danger", logo: "danger" },
  { icon: IdCard,        name: "CNIC Colour Copy + Family Details", desc: "Full colour CNIC copy plus complete family record", priceNum: 5000, sold: 500, tone: "id", logo: "database" },
  { icon: Bluetooth,     name: "Bluetooth Jammer",      desc: "Kill nearby Bluetooth devices", priceNum: 10000, sold: 64, tone: "bluetooth", logo: "signal" },
  { icon: Smartphone,    name: "SIM Signal Jammer",     desc: "Block all SIM / mobile network signals in range", priceNum: 50000, sold: 1, tone: "sim", logo: "signal" },
  { icon: Camera,        name: "Drone Jammer & Controller", desc: "Jam, hijack & take control of nearby camera drones", priceNum: 50000, sold: 3, tone: "drone", logo: "drone" },
];


function Home() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-shop"],
    queryFn: async () =>
      (await supabase.from("site_settings").select("shop_logo_url, store_logo_url").eq("id", 1).maybeSingle()).data,
  });
  const shopLogo = (settings as any)?.shop_logo_url;
  const storeLogo = (settings as any)?.store_logo_url;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--primary)_18%,_transparent),_transparent_60%)]" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 text-center">
          {shopLogo && (
            <div className="mb-6 flex justify-center">
              <NeonLogo src={shopLogo} size={96} glow="var(--primary)" />
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-5 py-2 text-sm md:text-base font-bold backdrop-blur ring-1 ring-destructive/50">
            <ShieldAlert className="h-5 w-5 text-red-500" /> UNDERGROUND WIKI STORE 💀
          </span>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            <span className="inline-flex items-center justify-center gap-2 text-gradient text-3xl md:text-5xl">
              Jammers & Hacking Devices <VerifiedBadge color="green" size={24} />
            </span>
          </h1>
          <p className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-lg font-black uppercase tracking-wider md:text-2xl">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_oklch(0.65_0.25_25/0.5)]">Jam</span>
            <span className="text-red-500/60">·</span>
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_oklch(0.65_0.25_25/0.5)]">Hijack</span>
            <span className="text-red-500/60">·</span>
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_oklch(0.65_0.25_25/0.5)]">Control Anything</span>
            <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
          </p>
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {[
              [Wifi, "WiFi"], [Bluetooth, "Bluetooth"], [Smartphone, "SIM"], [Camera, "Drone Cam"],
              [Car, "Car"], [Tv, "TV"], [Snowflake, "AC"], [Laptop, "Laptop"],
              [Monitor, "PC"], [Music, "Sound"], [Lightbulb, "Bulb"], [Skull, "& More"],
            ].map(([Icon, label]: any) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/30">
                <Icon className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/sim-database">
              <Button
                size="lg"
                className="h-12 px-7 text-base rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_25px_oklch(0.65_0.25_25/0.7)] hover:opacity-90 animate-pulse"
              >
                <Skull className="mr-2 h-4 w-4" /> Free SimData <VerifiedBadge color="green" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* INTRO VIDEO (moved to top per request) */}
      <IntroVideo />

      {/* 1 RUPEE OFFER */}
      <section className="container mx-auto px-4 pt-8">
        <Link to="/lucky-draw" className="block mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/70 bg-gradient-to-br from-red-950/80 via-black to-red-950/60 p-6 md:p-8 shadow-[0_0_50px_oklch(0.65_0.25_25/0.7)] animate-pulse hover:scale-[1.01] transition-transform">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-[radial-gradient(ellipse_at_top,_oklch(0.7_0.28_25/0.5),_transparent_70%)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-400/30 blur-3xl" />
            <div className="relative grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="text-5xl md:text-6xl drop-shadow-[0_0_20px_oklch(0.85_0.18_85/0.8)]">💰</div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-300 ring-1 ring-yellow-400/50">
                  🔥 New Offer · Daily 10 PM
                </div>
                <h3 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-red-400 via-rose-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_14px_oklch(0.65_0.25_25/0.8)]">
                  1 Rupee Lucky Draw 💰
                </h3>
                <p className="mt-1 text-sm md:text-base text-red-100/90">
                  Sirf <b className="text-yellow-300">Rs.1</b> invest karein — har raat <b className="text-red-300">10 baje Quran-andazi</b>, aik lucky user ko <b>sara paisa</b> mil jaye ga (account mein withdraw).
                </p>
              </div>
              <Button size="lg" className="h-12 px-6 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_25px_oklch(0.65_0.25_25/0.8)]">
                Join Rs.1 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>
      </section>

      {/* WIKI STORE (Store 2) CTA */}
      <section className="container mx-auto px-4 pt-6">
        <Link to="/store" className="block mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/60 bg-gradient-to-br from-card via-card to-primary/10 p-6 md:p-7 shadow-[0_0_40px_-8px_var(--primary)] hover:scale-[1.01] transition-transform">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--primary)_25%,_transparent),_transparent_70%)]" />
            <div className="relative grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
              {storeLogo ? (
                <NeonLogo src={storeLogo} size={72} glow="var(--primary)" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/40">
                  <ShoppingBag className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/40">
                  <Sparkles className="h-3 w-3" /> Wiki Store · Store 2
                </div>
                <h3 className="mt-2 text-2xl md:text-3xl font-black tracking-tight">
                  Visit Wiki Store
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Premium verified items — clothing, gadgets & more at <b className="text-primary">-30% off</b>.
                </p>
              </div>
              <Button size="lg" className="h-12 px-6 rounded-full font-black uppercase tracking-wider">
                Open Store <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>
      </section>


      {/* ARSENAL */}
      <section id="arsenal" className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Zap className="h-3.5 w-3.5" /> Hack Arsenal
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Pick your weapon</h2>
          <p className="mt-2 text-muted-foreground">Sorted low → high · grab the cheap ones first</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {HACKS.map((h) => {
            const Icon = h.icon;
            const isHot = !!h.hot;
            return (
              <div
                key={h.name}
                className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-transform duration-300 hover:-translate-y-1 ${isHot ? "ring-2 ring-red-500/70" : ""}`}
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
                  <ProductMark logo={h.logo} Icon={Icon} tone={h.tone} />
                  <h3 className={`mt-4 flex items-center gap-1.5 text-lg font-bold ${isHot ? "text-red-500" : ""}`}>
                    {h.name} <VerifiedBadge color="green" size={16} />
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.desc}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-3 py-1 text-sm font-black text-black shadow-[0_0_14px_oklch(0.85_0.18_85/0.55)]">
                      {fmt(h.priceNum)}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/40">
                      ✅ {h.sold.toLocaleString()} sold
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
                        price: h.priceNum,
                        wa: waLink(`Salam! Payment done for: ${h.name} (Rs. ${h.priceNum}). Please process my order.`),
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

      {/* PROMO */}
      <section className="container mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl gradient-accent p-10 md:p-16 text-center">
          <div className="relative mx-auto max-w-2xl text-accent-foreground">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Limited Drop 💀</span>
            <h3 className="mt-2 text-3xl font-bold md:text-4xl">Custom builds on demand</h3>
            <p className="mt-3 opacity-90">
              Need a hack we didn't list? DM us — we build custom jammers, exploit kits & spy gear on request.
            </p>
            <Link to="/shop">
              <Button size="lg" className="btn-neon mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90">
                Order Custom <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
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
    <section className="container mx-auto px-4 pt-8">
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

import {
  WhatsAppLogo, IdCardRealLogo, DroneRealLogo, JammerRealLogo, SimRealLogo,
  DatabaseRealLogo, DangerRealLogo,
} from "@/components/site/brand-logos";

function ProductMark({ logo, Icon, tone }: { logo?: Hack["logo"]; Icon: any; tone: string }) {
  if (logo === "whatsapp") return <WhatsAppLogo />;
  if (tone === "id") return <IdCardRealLogo />;
  if (tone === "drone") return <DroneRealLogo />;
  if (tone === "signal" || tone === "bluetooth") return <JammerRealLogo />;
  if (tone === "sim") return <SimRealLogo />;
  if (tone === "data") return <DatabaseRealLogo />;
  if (tone === "danger") return <DangerRealLogo />;

  const toneClass: Record<string, string> = {
    premium: "from-yellow-300 via-amber-500 to-orange-600 text-black",
  };
  return (
    <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${toneClass[tone] ?? "from-slate-500 to-slate-800"} shadow-[0_0_22px_color-mix(in_oklab,var(--primary)_45%,transparent)] ring-2 ring-white/20 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
      <Icon className="h-7 w-7 text-white drop-shadow" />
    </span>
  );
}
