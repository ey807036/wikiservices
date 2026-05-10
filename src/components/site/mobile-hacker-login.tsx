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
 * Mobile auto-animation that mimics the reference video:
 *   1. Character walks in from the RIGHT carrying a briefcase
 *   2. Stops near the center, sets the briefcase down on the ground
 *   3. Reaches up — the login form drops down from the top
 *   4. Stays STANDING on the ground beside the form (never floats away)
 *      The briefcase stays put on the floor next to him.
 *   5. Closing the form just hides it; the character keeps standing there
 *      so the user can re-open by tapping him.
 */
type Phase =
  | "off"        // off-screen right
  | "walking"    // walking left
  | "stopping"   // putting briefcase down
  | "reaching"   // arm up, sheet starts dropping
  | "open"       // sheet fully visible, character stands beside it
  | "standing";  // sheet closed, character stays standing on ground

const SESSION_KEY = "wikiservices_hacker_played_v2";

export function MobileHackerLogin() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("off");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);

  // Auto-play sequence on first mobile visit (signed-out only)
  useEffect(() => {
    if (!isMobile || user) return;
    if (startedRef.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setPhase("standing");
      return;
    }
    startedRef.current = true;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("walking"),  500));
    timers.push(window.setTimeout(() => setPhase("stopping"), 2200));
    timers.push(window.setTimeout(() => setPhase("reaching"), 2900));
    timers.push(window.setTimeout(() => {
      setPhase("open");
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 3800));
    return () => { timers.forEach(clearTimeout); };
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
  const reopen = () => { if (phase !== "open") setPhase("open"); };

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
  // Sheet: -100% (hidden) → -25% (peeking while reaching) → 0 (open)
  const sheetY =
    phase === "open"     ? 0   :
    phase === "reaching" ? -55 :
    -100;

  // Character horizontal position (right offset in px from right edge)
  // Walks from off-screen right toward a spot left of center.
  const charRight =
    phase === "off"      ? -120 :
    phase === "walking"  ? 180  :
    /* stopping/reaching/open/standing */ 180;

  const flipped = phase === "walking"; // facing left while walking
  const isStanding = phase === "open" || phase === "standing" || phase === "reaching" || phase === "stopping";
  const armUp = phase === "reaching" || phase === "open";

  // Briefcase appears once he stops; stays on the ground after that
  const showBriefcase = phase === "stopping" || phase === "reaching" || phase === "open" || phase === "standing";

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
              phase === "reaching" ? "hackerReach 0.6s ease-in-out infinite" :
              isStanding           ? "hackerIdle 3.2s ease-in-out infinite" :
              undefined,
            transition: "transform 350ms ease",
          }}
        />
        {phase === "standing" && (
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/40 bg-background/90 px-2 py-0.5 font-mono text-[9px] text-primary">
            tap me
          </span>
        )}
      </button>

      <style>{`
        @keyframes hackerWalk {
          0%,100% { transform: scaleX(-1) translateY(0) }
          50%     { transform: scaleX(-1) translateY(-3px) }
        }
        @keyframes hackerReach {
          0%,100% { transform: translateY(-4px) scale(1.02) }
          50%     { transform: translateY(-7px) scale(1.04) }
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
