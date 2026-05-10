import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import hacker from "@/assets/hacker-3d.png";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

/**
 * Auto-playing mobile hacker mascot:
 * 1. Walks in from off-screen left
 * 2. Reaches up and "pulls" the login sheet down from the top with a rope
 * 3. After user closes (or signs in), floats off to the bottom-left corner
 *    holding his laptop and idles there. Tap him anytime to re-open the sheet.
 */
type Phase = "idle" | "walk" | "pulling" | "open" | "parked";

const SESSION_KEY = "wikiservices_hacker_played";

export function MobileHackerLogin() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);

  // Kick off auto-animation once per session when mobile + signed-out
  useEffect(() => {
    if (!isMobile || user) return;
    if (startedRef.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setPhase("parked");
      return;
    }
    startedRef.current = true;
    const t1 = setTimeout(() => setPhase("walk"), 600);
    const t2 = setTimeout(() => setPhase("pulling"), 2000);
    const t3 = setTimeout(() => {
      setPhase("open");
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isMobile, user]);

  // Lock body scroll when sheet open
  useEffect(() => {
    if (phase === "open") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [phase]);

  if (!isMobile || user) return null;

  const close = () => setPhase("parked");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Access granted!");
    close();
  };

  // Sheet vertical position (% of own height): -100 hidden, 0 fully visible
  const sheetY =
    phase === "open" ? 0 :
    phase === "pulling" ? -25 :
    -100;

  // Hacker on-screen position
  const isWalkingPhase = phase === "walk" || phase === "pulling";
  const isParked = phase === "parked" || phase === "open";

  return (
    <>
      {/* ===== Pull-down login sheet ===== */}
      <div
        className="fixed inset-x-0 top-0 z-[60] pointer-events-none"
        style={{
          transform: `translateY(${sheetY}%)`,
          transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
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

      {/* ===== Rope from sheet to hacker's hand (visible during pulling) ===== */}
      {phase === "pulling" && (
        <div
          className="fixed left-1/2 top-0 z-[55] -ml-px w-0.5 origin-top bg-gradient-to-b from-primary/80 to-primary/30"
          style={{ height: "55vh", animation: "pulse 0.6s ease-in-out infinite" }}
        />
      )}

      {/* ===== Hacker mascot ===== */}
      <button
        type="button"
        aria-label="Open quick login"
        onClick={() => { if (phase !== "open") setPhase("open"); }}
        className="fixed z-[58] grid touch-none place-items-center md:hidden"
        style={{
          // Walking / pulling: roughly center-bottom area
          // Parked: bottom-left corner
          left: isParked ? "12px" : isWalkingPhase ? "calc(50% - 40px)" : "-90px",
          bottom: isParked ? "84px" : "30vh",
          width: isParked ? "64px" : "80px",
          height: isParked ? "64px" : "80px",
          transition: "left 1.2s cubic-bezier(0.22,1,0.36,1), bottom 1.2s cubic-bezier(0.22,1,0.36,1), width 0.6s, height 0.6s",
        }}
      >
        {/* Glow halo (only when parked, to mark it as a button) */}
        {isParked && (
          <>
            <span className="absolute inset-0 -z-10 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-md shadow-[0_0_25px_rgba(34,255,136,0.35)]" />
            <span className="absolute inset-0 -z-20 rounded-full bg-primary/20 blur-xl animate-pulse" />
          </>
        )}

        <img
          src={hacker}
          alt="Login helper"
          className="h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(34,255,136,0.55)]"
          style={{
            // Reach-up arm illusion via slight stretch + tilt during pulling
            transform:
              phase === "pulling" ? "translateY(-6px) scale(1.05)" :
              phase === "walk" ? "translateY(0)" :
              "translateY(0)",
            animation: isParked
              ? "float 3.5s ease-in-out infinite"
              : phase === "walk"
                ? "hackerBob 0.35s ease-in-out infinite"
                : phase === "pulling"
                  ? "hackerPull 0.5s ease-in-out infinite"
                  : undefined,
            transition: "transform 400ms ease",
          }}
        />

        {isParked && (
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/40 bg-background/90 px-2 py-0.5 font-mono text-[9px] text-primary">
            tap me
          </span>
        )}
      </button>

      {/* Local keyframes for walk bob & pull tug */}
      <style>{`
        @keyframes hackerBob {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-3px) }
        }
        @keyframes hackerPull {
          0%,100% { transform: translateY(-6px) scale(1.05) }
          50% { transform: translateY(-2px) scale(1.02) }
        }
      `}</style>
    </>
  );
}
