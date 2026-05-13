import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Crown, ShieldAlert, X } from "lucide-react";
import { PayfastCheckout } from "@/components/site/payfast-checkout";

export const Route = createFileRoute("/pro-accounts")({ component: ProAccountsPage });

const ADMIN_WA = "923186376181";
const waLink = (msg: string) =>
  `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

type Acc = { name: string; emoji: string; cat: string; color: string };

const ACCOUNTS: Acc[] = [
  // Streaming
  { name: "Netflix Premium",    emoji: "🎬", cat: "Streaming",  color: "from-red-600 to-rose-700" },
  { name: "Amazon Prime",       emoji: "📦", cat: "Streaming",  color: "from-sky-500 to-blue-700" },
  { name: "Disney+ Hotstar",    emoji: "🏰", cat: "Streaming",  color: "from-blue-500 to-indigo-700" },
  { name: "YouTube Premium",    emoji: "▶️", cat: "Streaming",  color: "from-red-500 to-red-700" },
  { name: "Spotify Premium",    emoji: "🎵", cat: "Streaming",  color: "from-emerald-500 to-green-700" },
  // Editing
  { name: "CapCut Pro",         emoji: "✂️", cat: "Editing",    color: "from-slate-700 to-zinc-900" },
  { name: "Remini Pro",         emoji: "🪄", cat: "Editing",    color: "from-fuchsia-500 to-purple-700" },
  { name: "Picsart Gold",       emoji: "🎨", cat: "Editing",    color: "from-pink-500 to-rose-600" },
  { name: "VN Editor Pro",      emoji: "🎞️", cat: "Editing",    color: "from-amber-500 to-orange-600" },
  { name: "Lightroom Premium",  emoji: "📸", cat: "Editing",    color: "from-blue-500 to-cyan-700" },
  { name: "Canva Pro",          emoji: "🖌️", cat: "Editing",    color: "from-cyan-500 to-blue-600" },
  { name: "Adobe Creative Cloud", emoji: "🅰️", cat: "Editing",  color: "from-red-600 to-rose-800" },
  // AI Tools
  { name: "ChatGPT Plus",       emoji: "🤖", cat: "AI Tools",   color: "from-emerald-600 to-teal-700" },
  { name: "Midjourney",         emoji: "🌌", cat: "AI Tools",   color: "from-violet-600 to-indigo-800" },
  { name: "Grammarly Premium",  emoji: "✍️", cat: "AI Tools",   color: "from-green-500 to-emerald-700" },
  // Social Media
  { name: "Instagram (Verified)", emoji: "📷", cat: "Social",   color: "from-pink-500 via-fuchsia-500 to-orange-500" },
  { name: "Facebook (Aged)",    emoji: "📘", cat: "Social",     color: "from-blue-600 to-indigo-700" },
  { name: "TikTok (Bot Boost)", emoji: "🎶", cat: "Social",     color: "from-zinc-800 to-black" },
  { name: "Snapchat Plus",      emoji: "👻", cat: "Social",     color: "from-yellow-400 to-amber-500" },
  { name: "Telegram Premium",   emoji: "✈️", cat: "Social",     color: "from-sky-500 to-blue-700" },
  { name: "WhatsApp Business",  emoji: "💬", cat: "Social",     color: "from-emerald-500 to-green-700" },
  { name: "Twitter / X Blue",   emoji: "𝕏",  cat: "Social",     color: "from-zinc-700 to-black" },
  // Other
  { name: "VPN Premium",        emoji: "🛡️", cat: "Other",      color: "from-indigo-600 to-violet-800" },
  { name: "Crunchyroll Mega",   emoji: "🍙", cat: "Other",      color: "from-orange-500 to-red-600" },
];

const CATEGORIES = ["Streaming", "Editing", "AI Tools", "Social", "Other"];

function ProAccountsPage() {
  const [picked, setPicked] = useState<Acc | null>(null);
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-6 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-card via-card to-amber-950/20 p-6 shadow-[0_0_40px_oklch(0.85_0.18_85/0.25)]">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Premium Pro Accounts
          </span>
        </div>
        <h1 className="glitch-text mt-2 text-3xl md:text-4xl font-black uppercase tracking-wider text-amber-300">
          Pro Accounts Store 👑
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick any premium account below — each one is just{" "}
          <span className="font-black text-amber-400">Rs. 100</span>. Tap to confirm
          on WhatsApp.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-3 py-1.5 text-sm font-black text-black shadow-[0_0_14px_oklch(0.85_0.18_85/0.55)]">
            💰 Rs. 100 / Account
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/40">
            ✅ Instant Delivery
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-[11px] font-bold text-red-400 ring-1 ring-red-500/40">
            <ShieldAlert className="h-3 w-3" /> 100% Working
          </span>
        </div>

        {CATEGORIES.map((cat) => {
          const list = ACCOUNTS.filter((a) => a.cat === cat);
          if (!list.length) return null;
          return (
            <div key={cat} className="mt-7">
              <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-amber-300/90">
                ⚡ {cat}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {list.map((a) => (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => setPicked(a)}
                    className="group flex items-center justify-between rounded-2xl border-2 border-amber-500/30 bg-background/60 p-3 transition hover:border-amber-400 hover:bg-amber-500/10 hover:scale-[1.03] text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${a.color} text-lg shadow-md ring-1 ring-white/20`}>
                        {a.emoji}
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-foreground">{a.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                          Rs. 100
                        </span>
                      </span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300">
                      Buy →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          ⚡ All accounts come with warranty · Replacement guaranteed if any issue
        </p>
      </div>
    </div>
  );
}
