import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight, Wifi, Bluetooth, Car, Tv, Snowflake,
  Laptop, Monitor, Smartphone, Music, Camera, Lightbulb, Skull, Zap, ShieldAlert, Star, Flame,
  Database, IdCard, MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

type Hack = {
  icon: any;
  name: string;
  desc: string;
  priceNum: number;
  sold: number;
  hot?: boolean;
  href?: string;       // external link (opens new tab)
  to?: string;         // internal route
  action?: "fakewa";   // special handler
};

const fmt = (n: number) =>
  n >= 1000 ? `Rs. ${(n / 1000).toLocaleString()}${n % 1000 === 0 ? "k" : ""}` : `Rs. ${n}`;

const ADMIN_WA = "923186376181";
const waLink = (msg: string) => `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

const HACKS: Hack[] = [
  { icon: MessageCircle, name: "Fake WhatsApp Number", desc: "Anonymous WhatsApp numbers — pick & chat instantly", priceNum: 150, sold: 2000, hot: true, action: "fakewa" },
  { icon: Database,      name: "New SimData Service",   desc: "Fresh 2024–2026 SIM owner data lookup (paid)", priceNum: 500, sold: 4500, hot: true, href: waLink("Salam! I want to buy 'New SimData Service' (Rs. 500). Please share details.") },
  { icon: Wifi,          name: "WiFi Jammer",           desc: "Block any WiFi signal in range", priceNum: 5000, sold: 87, hot: true },
  { icon: Skull,         name: "All-in-One Device Hack 💀", desc: "Single device to control Car, TV, AC, Projector, Laptop, PC, Mobile, MP3/Sound, Camera, Bulb & more", priceNum: 5000, sold: 42 },
  { icon: IdCard,        name: "CNIC Colour Copy + Family Details", desc: "Full colour CNIC copy plus complete family record", priceNum: 5000, sold: 500, href: waLink("Salam! I want 'CNIC Colour Copy + Family Details' (Rs. 5000). Please share details.") },
  { icon: Bluetooth,     name: "Bluetooth Jammer",      desc: "Kill nearby Bluetooth devices", priceNum: 10000, sold: 64 },
  { icon: Smartphone,    name: "SIM Signal Jammer",     desc: "Block all SIM / mobile network signals in range", priceNum: 50000, sold: 1 },
  { icon: Camera,        name: "Drone Jammer & Controller", desc: "Jam, hijack & take control of nearby camera drones", priceNum: 50000, sold: 3 },
];

// Generate random masked WhatsApp-style numbers
function genMaskedNumbers(seed: number) {
  const out: { full: string; masked: string }[] = [];
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 8; i++) {
    const prefix = ["300","301","302","303","310","311","312","320","321","333","345"][Math.floor(rnd() * 11)];
    const rest = Array.from({ length: 7 }, () => Math.floor(rnd() * 10)).join("");
    const full = `92${prefix}${rest}`;
    const masked = `+92 ${prefix} ${rest.slice(0,3)}XX${rest.slice(5)}`;
    out.push({ full, masked });
  }
  return out;
}

function FakeWhatsAppDialog() {
  const [open, setOpen] = useState(false);
  const numbers = useMemo(() => genMaskedNumbers(Date.now() % 100000), [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="cool" className="btn-neon mt-1 rounded-full px-5">
          Pick Number <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glitch-box border-2 border-red-500/60 bg-gradient-to-br from-card via-card to-red-950/30">
        <DialogHeader>
          <DialogTitle className="glitch-text text-2xl font-black uppercase tracking-wider text-red-400">
            Choose Anonymous Number 💀
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Pick any half-shown number — clicking will message us on WhatsApp to confirm your pick.
        </p>
        <div className="mt-2 grid gap-2 max-h-[50vh] overflow-y-auto pr-1">
          {numbers.map((n) => (
            <a
              key={n.masked}
              href={waLink(`Salam! I want to BUY this Fake WhatsApp Number: ${n.masked} (Rs. 150). Please confirm.`)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-background/60 px-4 py-3 font-mono text-sm font-bold text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/10 transition"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" /> {n.masked}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Select →</span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--primary)_18%,_transparent),_transparent_60%)]" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-5 py-2 text-sm md:text-base font-bold backdrop-blur ring-1 ring-destructive/50">
            <ShieldAlert className="h-5 w-5 text-red-500" /> UNDERGROUND WIKI STORE 💀
          </span>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            <span className="block text-gradient text-3xl md:text-5xl">Jammers & Hacking Devices</span>
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
            <a href="#arsenal">
              <Button size="lg" variant="cool" className="btn-neon h-12 px-7 text-base rounded-full">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link to="/sim-database">
              <Button
                size="lg"
                className="h-12 px-7 text-base rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_25px_oklch(0.65_0.25_25/0.7)] hover:opacity-90 animate-pulse"
              >
                <Skull className="mr-2 h-4 w-4" /> Free SimData
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
            <span className="ml-2 text-sm text-muted-foreground">Trusted by 12,000+ underground users</span>
          </div>
        </div>
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
                className={`card-hack group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card ${isHot ? "ring-2 ring-red-500/70" : ""}`}
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
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/20 text-red-500 ring-1 ring-red-500/40 shadow-[0_0_14px_oklch(0.65_0.25_25/0.55)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className={`mt-4 text-lg font-bold ${isHot ? "text-red-500" : ""}`}>{h.name}</h3>
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
                    <div className="mt-3"><FakeWhatsAppDialog /></div>
                  ) : h.href ? (
                    <a href={h.href} target="_blank" rel="noreferrer" className="mt-3 block">
                      <Button size="sm" variant="cool" className="btn-neon mt-1 rounded-full px-5">
                        Buy Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </a>
                  ) : (
                    <Link to="/order" search={{ item: h.name }} className="mt-3 block">
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
