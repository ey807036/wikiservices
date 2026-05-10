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
 * Mobile-only floating hacker mascot that lives in the bottom-left corner.
 * Tap (or pull down) the hacker to drag a mini login sheet from the top of
 * the screen. Close it and he floats back up to his corner.
 */
export function MobileHackerLogin() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(0); // 0 closed -> 1 fully open
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!isMobile || user) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startY.current == null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) setDrag(Math.min(1, dy / 160));
  };
  const onPointerUp = () => {
    dragging.current = false;
    startY.current = null;
    if (drag > 0.35) {
      setOpen(true);
      setDrag(1);
    } else {
      setDrag(0);
    }
  };

  const close = () => {
    setOpen(false);
    setDrag(0);
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

  const sheetTranslate = open ? 0 : -100 + drag * 100; // % when not open use drag, else 0

  return (
    <>
      {/* Pull-down login sheet */}
      <div
        className="fixed inset-x-0 top-0 z-[60] pointer-events-none"
        style={{ transform: `translateY(${sheetTranslate}%)`, transition: dragging.current ? "none" : "transform 350ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-sm rounded-b-3xl border border-t-0 border-primary/40 bg-card/95 p-5 pb-7 shadow-[0_20px_60px_-10px_rgba(34,255,136,0.35)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-wider text-primary">&gt; quick_login</div>
            <button onClick={close} aria-label="Close" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
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
          {/* visual rope handle */}
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-primary/30" />
        </div>
      </div>

      {/* Floating hacker mascot — bottom-left corner */}
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => { if (drag === 0 && !open) setOpen(true); }}
        aria-label="Quick login"
        className="fixed bottom-20 left-3 z-50 grid h-16 w-16 touch-none place-items-center rounded-full border border-primary/40 bg-primary/10 backdrop-blur-md shadow-[0_0_25px_rgba(34,255,136,0.35)] active:scale-95 md:hidden"
        style={{
          transform: open ? "translateY(0)" : `translateY(${drag * 8}px)`,
          animation: open ? undefined : "float 3.5s ease-in-out infinite",
        }}
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <img
          src={hacker}
          alt="Login helper"
          className="h-14 w-14 object-contain drop-shadow-[0_4px_10px_rgba(34,255,136,0.5)]"
        />
        {/* tiny rope hint going up */}
        <span
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-primary/80"
          style={{ opacity: drag > 0 ? 1 - drag : 0.7 }}
        >
          ↓ pull
        </span>
      </button>
    </>
  );
}
