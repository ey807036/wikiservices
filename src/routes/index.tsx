import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Wifi, Bluetooth, Radio, Car, Tv, Snowflake, Projector,
  Laptop, Monitor, Smartphone, Music, Camera, Lightbulb, Skull, Zap, ShieldAlert, Star,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const hacks = [
  { icon: Wifi,       name: "WiFi Jammer",        desc: "Block any WiFi signal in range" },
  { icon: Bluetooth,  name: "Bluetooth Jammer",   desc: "Kill nearby Bluetooth devices" },
  { icon: Radio,      name: "Signal Jammer",      desc: "Disrupt all wireless signals" },
  { icon: Car,        name: "Car Hack",           desc: "Unlock & control vehicles" },
  { icon: Tv,         name: "TV Hack",            desc: "Take over any smart TV" },
  { icon: Snowflake,  name: "AC Hack",            desc: "Control air conditioners" },
  { icon: Projector,  name: "Projector Hack",     desc: "Hijack projectors instantly" },
  { icon: Laptop,     name: "Laptop Hack",        desc: "Remote access any laptop" },
  { icon: Monitor,    name: "PC Hack",            desc: "Full PC takeover toolkit" },
  { icon: Smartphone, name: "Mobile Hack",        desc: "Android & iOS exploits" },
  { icon: Music,      name: "MP3 / Sound Hack",   desc: "Hijack speakers & audio" },
  { icon: Camera,     name: "Camera Hack",        desc: "CCTV & webcam access" },
  { icon: Lightbulb,  name: "Electric Bulb Hack", desc: "Smart bulb takeover" },
  { icon: Skull,      name: "& Much More 💀",     desc: "Custom hacks on request" },
];

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(1_0_0/0.15),_transparent_60%)]" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 text-center text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-5 py-2 text-sm md:text-base font-bold backdrop-blur ring-1 ring-destructive/50">
            <ShieldAlert className="h-5 w-5 text-red-500" /> UNDERGROUND WIKI STORE 💀
          </span>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            <span className="block text-gradient text-3xl md:text-5xl">Jammers & Hacking Devices</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/90 md:text-lg">
            WiFi jamming, Bluetooth jammer, signal jammer & full device hack kits — cars, TV, AC, projector, laptop, PC, mobile, MP3/sound, camera, electric bulb and much more 💀
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#arsenal">
              <Button size="lg" variant="cool" className="btn-neon h-12 px-7 text-base rounded-full">
                Explore Arsenal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
          <div className="mt-10 flex items-center justify-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
            <span className="ml-2 text-sm text-white/80">Trusted by 12,000+ underground users</span>
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
          <p className="mt-2 text-muted-foreground">Every device you need to jam, hack & control</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {hacks.map((h) => (
            <div
              key={h.name}
              className="card-hack group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/30" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                  <h.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{h.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{h.desc}</p>
                <Link to="/order" search={{ item: h.name }} className="mt-4 inline-block">
                  <Button size="sm" variant="cool" className="btn-neon mt-2 rounded-full px-5">
                    Buy Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
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
