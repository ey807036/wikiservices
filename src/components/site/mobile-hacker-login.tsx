import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import hacker from "@/assets/hacker-3d.png";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Briefcase } from "lucide-react";
import { toast } from "sonner";

/**
 * Mobile auto-animation like the reference:
 * character enters by itself, grabs the hanging rope/handle with his hand,
 * pulls it down, then the login sheet drops from the top.
 */
type Phase =
  | "off"
  | "walking"
  | "grabbing"
  | "pulling"
  | "open"
  | "standing";

export function MobileHackerLogin() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("off");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);
  const pullTimersRef = useRef<number[]>([]);

  const clearPullTimers = () => {
    pullTimersRef.current.forEach(clearTimeout);
    pullTimersRef.current = [];
  };

  const playPullSequence = () => {
    clearPullTimers();
    setPhase("grabbing");
    pullTimersRef.current = [
      window.setTimeout(() => setPhase("pulling"), 420),
      window.setTimeout(() => setPhase("open"), 1550),
    ];
  };

  // Auto-play sequence on mobile visit (signed-out only)
  useEffect(() => {
    if (!isMobile || user) return;
    if (startedRef.current) return;
    startedRef.current = true;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("walking"), 450));
    timers.push(window.setTimeout(() => setPhase("grabbing"), 2150));
    timers.push(window.setTimeout(() => setPhase("pulling"), 2700));
    timers.push(window.setTimeout(() => setPhase("open"), 3850));
    return () => {
      timers.forEach(clearTimeout);
      clearPullTimers();
    };
  }, [isMobile, user]);

  // Lock body scroll while sheet open
  useEffect(() => {
    if (phase === "open") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [phase]);

  if (!isMobile || user) return null;

  const close = () => setPhase("standing");
  const reopen = () => {
    if (phase === "open" || phase === "walking" || phase === "pulling") return;
    playPullSequence();
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Access granted!");
    close();
  };

  // ----- positions -----
  // Sheet: hidden → tugged down by the rope → open
  const sheetY =
    phase === "open"    ? 0   :
    phase === "pulling" ? -18 :
    phase === "grabbing" ? -96 :
    -100;

  // Character horizontal position (right offset in px from right edge)
  const charRight =
    phase === "off"     ? -128 :
    phase === "walking" ? 150  :
    150;

  const flipped = phase === "walking"; // facing left while walking
  const isStanding = phase === "open" || phase === "standing" || phase === "grabbing" || phase === "pulling";
  const armUp = phase === "grabbing" || phase === "pulling" || phase === "open";

  const showBriefcase = phase === "grabbing" || phase === "pulling" || phase === "open" || phase === "standing";
  const showRope = phase === "grabbing" || phase === "pulling" || phase === "open";

  return (
    <>
      {/* ===== Pull-down login sheet ===== */}
      <div
        className="fixed inset-x-0 top-0 z-[60] pointer-events-none md:hidden"
        style={{
          transform: `translateY(${sheetY}%)`,
          transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-sm rounded-b-3xl border border-t-0 border-primary/40 bg-card/95 p-5 pb-7 shadow-[0_20px_60px_-10px_rgba(34,255,136,0.4)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-wider text-primary">&gt; quick_login</div>
            {phase === "open" && (
              <button onClick={close} aria-label="Close" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <form onSubmit={signIn} className="space-y-2">
            <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full gap-1" disabled={loading}>
              {loading ? "..." : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
          <div className="mt-3 flex items-center justify-between text-xs">
            <Link to="/auth" search={{ mode: "signup" } as any} onClick={close} className="text-primary underline-offset-2 hover:underline">
              Create account
            </Link>
            <Link to="/auth" onClick={close} className="text-muted-foreground hover:text-foreground">
              Full sign in →
            </Link>
          </div>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-primary/30" />
        </div>
      </div>

      {/* ===== Rope/handle visibly pulled by the character ===== */}
      {showRope && (
        <div
          className="fixed z-[58] flex flex-col items-center md:hidden pointer-events-none"
          style={{
            right: `${charRight + 46}px`,
            top: phase === "pulling" || phase === "open" ? "258px" : "18px",
            transition: "top 900ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="h-[170px] w-[3px] rounded-full bg-primary/70 shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_70%,transparent)]" />
          <div className="-mt-1 h-5 w-8 rounded-full border border-primary/60 bg-card/95 shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_45%,transparent)]" />
        </div>
      )}

      {/* ===== Ground line shadow under character/briefcase ===== */}
      <div
        className="fixed bottom-[72px] right-0 z-[57] h-[2px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent md:hidden pointer-events-none"
      />

      {/* ===== Briefcase on the ground ===== */}
      {showBriefcase && (
        <div
          className="fixed bottom-[78px] z-[58] grid h-9 w-9 place-items-center rounded-md border border-primary/40 bg-primary/10 backdrop-blur-md md:hidden pointer-events-none"
          style={{
            right: `${charRight - 44}px`,
            animation: "fadeInUp 0.4s ease-out",
          }}
        >
          <Briefcase className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* ===== Character ===== */}
      <button
        type="button"
        aria-label="Open quick login"
        onClick={reopen}
        className="fixed bottom-[78px] z-[59] grid h-[120px] w-[80px] touch-none place-items-end md:hidden"
        style={{
          right: `${charRight}px`,
          transition: "right 1.6s cubic-bezier(0.32,0,0.32,1)",
        }}
      >
        <img
          src={hacker}
          alt="Login helper"
          className="h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(34,255,136,0.45)]"
          style={{
            transform: `scaleX(${flipped ? -1 : 1}) ${armUp ? "translateY(-4px)" : "translateY(0)"}`,
            animation:
              phase === "walking"  ? "hackerWalk 0.4s ease-in-out infinite" :
              phase === "grabbing" || phase === "pulling" ? "hackerPull 0.62s ease-in-out infinite" :
              isStanding           ? "hackerIdle 3.2s ease-in-out infinite" :
              undefined,
            transition: "transform 350ms ease",
          }}
        />
        {phase === "standing" && (
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/40 bg-background/90 px-2 py-0.5 font-mono text-[9px] text-primary">
            pull
          </span>
        )}
      </button>

      <style>{`
        @keyframes hackerWalk {
          0%,100% { transform: scaleX(-1) translateY(0) }
          50%     { transform: scaleX(-1) translateY(-3px) }
        }
        @keyframes hackerPull {
          0%,100% { transform: translateY(-4px) rotate(-1deg) scale(1.02) }
          50%     { transform: translateY(3px) rotate(2deg) scale(1.04) }
        }
        @keyframes hackerIdle {
          0%,100% { transform: translateY(0) }
          50%     { transform: translateY(-2px) }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </>
  );
}
