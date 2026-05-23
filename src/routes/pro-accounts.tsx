import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Crown, ShieldAlert, X } from "lucide-react";
import { PayfastCheckout } from "@/components/site/payfast-checkout";
import {
  NetflixLogo, YouTubeLogo, SpotifyLogo, InstagramLogo, TikTokLogo,
  FacebookLogo, SnapchatLogo, TelegramLogo, TwitterLogo, ChatGPTLogo,
  CanvaLogo, CapCutLogo, AmazonLogo, DisneyLogo, AdobeLogo, VPNLogo,
  WhatsAppLogo,
} from "@/components/site/brand-logos";

export const Route = createFileRoute("/pro-accounts")({ component: ProAccountsPage });

const ADMIN_WA = "923186376181";
const waLink = (msg: string) =>
  `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

type Acc = { name: string; Logo: React.FC<{ className?: string }>; cat: string };

const ACCOUNTS: Acc[] = [
  // Streaming
  { name: "Netflix Premium",      Logo: NetflixLogo,   cat: "Streaming" },
  { name: "Amazon Prime",         Logo: AmazonLogo,    cat: "Streaming" },
  { name: "Disney+ Hotstar",      Logo: DisneyLogo,    cat: "Streaming" },
  { name: "YouTube Premium",      Logo: YouTubeLogo,   cat: "Streaming" },
  { name: "Spotify Premium",      Logo: SpotifyLogo,   cat: "Streaming" },
  // Editing
  { name: "CapCut Pro",           Logo: CapCutLogo,    cat: "Editing" },
  { name: "Canva Pro",            Logo: CanvaLogo,     cat: "Editing" },
  { name: "Adobe Creative Cloud", Logo: AdobeLogo,     cat: "Editing" },
  // AI Tools
  { name: "ChatGPT Plus",         Logo: ChatGPTLogo,   cat: "AI Tools" },
  // Social Media
  { name: "Instagram (Verified)", Logo: InstagramLogo, cat: "Social" },
  { name: "Facebook (Aged)",      Logo: FacebookLogo,  cat: "Social" },
  { name: "TikTok (Bot Boost)",   Logo: TikTokLogo,    cat: "Social" },
  { name: "Snapchat Plus",        Logo: SnapchatLogo,  cat: "Social" },
  { name: "Telegram Premium",     Logo: TelegramLogo,  cat: "Social" },
  { name: "WhatsApp Business",    Logo: WhatsAppLogo,  cat: "Social" },
  { name: "Twitter / X Blue",     Logo: TwitterLogo,   cat: "Social" },
  // Other
  { name: "VPN Premium",          Logo: VPNLogo,       cat: "Other" },
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
                      <a.Logo className="h-10 w-10" />
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

      {picked && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur" onClick={() => setPicked(null)}>
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-400/60 bg-black p-5 shadow-[0_0_40px_oklch(0.85_0.18_85/0.4)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${picked.color} text-lg ring-1 ring-white/20`}>{picked.emoji}</span>
                <div>
                  <div className="text-sm font-black text-amber-300">{picked.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-400">Rs. 100 · Pro Account</div>
                </div>
              </div>
              <button onClick={() => setPicked(null)} className="rounded-full p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <PayfastCheckout
              amount={100}
              purpose={`Pro Account: ${picked.name}`}
              basketPrefix="PRO"
              buttonLabel={`Pay Rs.101 · ${picked.name}`}
              whatsappAfter={waLink(`Salam! Payment done for Pro Account: ${picked.name} (Rs. 100). Please deliver login details.`)}
            />
            <a
              href={waLink(`Salam! I want to BUY: ${picked.name} (Pro Account · Rs. 100). Please confirm.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center text-[11px] uppercase tracking-widest text-emerald-400 underline"
            >
              Ya WhatsApp par order karein
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

