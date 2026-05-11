import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, RefreshCw, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/fake-whatsapp")({ component: FakeWhatsAppPage });

const ADMIN_WA = "923186376181";
const waLink = (msg: string) =>
  `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

function genMaskedNumbers(seed: number) {
  const out: { masked: string }[] = [];
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const prefixes = ["300","301","302","303","310","311","312","320","321","333","342","345","346","347"];
  for (let i = 0; i < 12; i++) {
    const prefix = prefixes[Math.floor(rnd() * prefixes.length)];
    const rest = Array.from({ length: 7 }, () => Math.floor(rnd() * 10)).join("");
    const starCount = Math.floor(rnd() * 2) + 1;
    const masked = `+92${prefix}${rest.slice(0, 7 - starCount)}${"*".repeat(starCount)}`;
    out.push({ masked });
  }
  return out;
}

function FakeWhatsAppPage() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 99999) + 1);
  const numbers = useMemo(() => genMaskedNumbers(seed), [seed]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-6 rounded-3xl border-2 border-red-500/60 bg-gradient-to-br from-card via-card to-red-950/30 p-6 shadow-[0_0_40px_oklch(0.65_0.25_25/0.25)]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-red-400">
            Anonymous WhatsApp Numbers
          </span>
        </div>
        <h1 className="glitch-text mt-2 text-3xl md:text-4xl font-black uppercase tracking-wider text-red-400">
          Choose Your Number 💀
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick any half-shown Pakistani number below — each one is{" "}
          <span className="font-black text-amber-400">Rs. 150</span>. Tap a number to confirm
          your pick on WhatsApp instantly.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-3 py-1.5 text-sm font-black text-black shadow-[0_0_14px_oklch(0.85_0.18_85/0.55)]">
            💰 Rs. 150 / Number
          </div>
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 99999) + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-accent transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Shuffle
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {numbers.map((n, i) => (
            <a
              key={`${n.masked}-${i}`}
              href={waLink(`Salam! I want to BUY this Fake WhatsApp Number: ${n.masked} (Rs. 150). Please confirm.`)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border-2 border-emerald-500/40 bg-background/60 px-4 py-4 transition hover:border-emerald-400 hover:bg-emerald-500/10 hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <span className="font-mono text-base font-black text-emerald-300">
                  {n.masked}
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="rounded-md bg-amber-400/90 px-2 py-0.5 text-[10px] font-black uppercase text-black">
                  Rs. 150
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-red-300">
                  Buy →
                </span>
              </span>
            </a>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ⚡ All numbers are anonymous & untraceable · Delivery within minutes after payment confirmation
        </p>
      </div>
    </div>
  );
}
