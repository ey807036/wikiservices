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

type Phase = "off" | "walk" | "bend" | "boot" | "form" | "parked";

export function MobileHackerLogin() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("off");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const playSequence = () => {
    clearTimers();
    setPhase("off");
    timersRef.current = [
      window.setTimeout(() => setPhase("walk"), 120),
      window.setTimeout(() => setPhase("bend"), 1550),
      window.setTimeout(() => setPhase("boot"), 2250),
      window.setTimeout(() => setPhase("form"), 3150),
    ];
  };

  useEffect(() => {
    if (!isMobile || user || startedRef.current) return;
    startedRef.current = true;
    playSequence();
    return clearTimers;
  }, [isMobile, user]);

  useEffect(() => {
    if (phase === "form") {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [phase]);

  if (!isMobile || user) return null;

  const close = () => setPhase("parked");
  const replay = () => {
    if (phase === "parked") playSequence();
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Access granted!");
    close();
  };

  const showStage = phase !== "parked";
  const formVisible = phase === "form";
  const charLeft =
    phase === "off"
      ? "-92px"
      : phase === "walk"
        ? "70px"
        : phase === "bend"
          ? "82px"
          : phase === "boot"
            ? "64px"
            : "42px";
  const laptopVisible = phase === "bend" || phase === "boot" || phase === "form";

  return (
    <>
      {showStage && (
        <div className="fixed inset-0 z-[90] md:hidden pointer-events-none">
          <div className="absolute inset-x-3 top-20 h-[260px] overflow-hidden rounded-sm border border-primary/45 bg-[var(--login-stage)] shadow-[0_18px_45px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,var(--login-stage-glow),transparent_45%)]" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-background/10" />

            <img
              src={hacker}
              alt="Login helper"
              className="absolute bottom-7 z-[2] h-[112px] w-[94px] object-contain drop-shadow-[0_10px_16px_color-mix(in_oklab,var(--background)_45%,transparent)]"
              style={{
                left: charLeft,
                transition: "left 1.25s cubic-bezier(0.33,0,0.2,1)",
                animation:
                  phase === "walk"
                    ? "videoWalk 0.38s ease-in-out infinite"
                    : phase === "bend"
                      ? "videoBend 0.65s ease-in-out infinite"
                      : phase === "boot"
                        ? "videoBoot 0.55s ease-in-out infinite"
                        : "videoStand 2.6s ease-in-out infinite",
              }}
            />

            <div
              className="absolute bottom-[58px] left-[134px] z-[1] h-7 w-10 rounded-sm border border-primary-foreground/25 bg-background/80 shadow-[0_10px_20px_color-mix(in_oklab,var(--background)_40%,transparent)] transition-all duration-500"
              style={{
                opacity: laptopVisible ? 1 : 0,
                transform:
                  phase === "bend" ? "translateY(8px) scale(0.85)" : "translateY(0) scale(1)",
              }}
            >
              <span className="absolute inset-x-1 top-1 h-3 rounded-[2px] border border-primary/45 bg-primary/15" />
              <span className="absolute bottom-1 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-primary/50" />
            </div>

            <div
              className="absolute left-[152px] top-8 z-[3] w-[164px] transition-all duration-700 ease-out"
              style={{
                opacity: formVisible ? 1 : 0,
                transform: formVisible ? "translateY(0) scale(1)" : "translateY(-14px) scale(0.96)",
              }}
            >
              <div className="pointer-events-auto rounded-sm border border-primary-foreground/35 bg-card/95 p-3 shadow-[0_16px_40px_color-mix(in_oklab,var(--background)_50%,transparent)] backdrop-blur">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-[10px] font-bold text-primary">Register now</div>
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <form onSubmit={signIn} className="space-y-1.5">
                  <Input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Button type="submit" className="h-7 w-full gap-1 text-xs" disabled={loading}>
                    {loading ? (
                      "..."
                    ) : (
                      <>
                        Login <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </form>
                <div className="mt-2 flex justify-between text-[10px]">
                  <Link
                    to="/auth"
                    search={{ mode: "signup" } as any}
                    onClick={close}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Create
                  </Link>
                  <Link
                    to="/auth"
                    onClick={close}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Full →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "parked" && (
        <button
          type="button"
          aria-label="Replay login animation"
          onClick={replay}
          className="fixed bottom-[118px] right-3 z-[62] grid h-[74px] w-[74px] touch-none place-items-end md:hidden"
        >
          <img
            src={hacker}
            alt="Login helper"
            className="h-full w-full object-contain drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
            style={{ animation: "videoFloat 3.2s ease-in-out infinite" }}
          />
        </button>
      )}

      <style>{`
        @keyframes videoWalk {
          0%,100% { transform: translateY(0) rotate(-1deg) scaleX(1) }
          50% { transform: translateY(-5px) rotate(2deg) scaleX(1) }
        }
        @keyframes videoBend {
          0%,100% { transform: translateY(10px) rotate(8deg) scale(0.94) }
          50% { transform: translateY(18px) rotate(12deg) scale(0.9) }
        }
        @keyframes videoBoot {
          0%,100% { transform: translateY(4px) rotate(-2deg) scale(1.02) }
          50% { transform: translateY(-2px) rotate(3deg) scale(1.04) }
        }
        @keyframes videoStand {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-3px) }
        }
        @keyframes videoFloat {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-7px) }
        }
      `}</style>
    </>
  );
}
