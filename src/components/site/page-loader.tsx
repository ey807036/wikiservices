import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VerifiedBadge } from "@/components/site/verified-badge";

const MIN_MS = 2000;
const MAX_MS = 6000;

/**
 * Global page loader. Always shows for at least MIN_MS (2s) on every route
 * change, then hides as soon as the router is ready — capped at MAX_MS.
 */
export function PageLoader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isRouterLoading = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
  const [show, setShow] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);

  // Reset on every route change
  useEffect(() => {
    setShow(true);
    setMinElapsed(false);
    const tMin = setTimeout(() => setMinElapsed(true), MIN_MS);
    const tMax = setTimeout(() => setShow(false), MAX_MS);
    return () => { clearTimeout(tMin); clearTimeout(tMax); };
  }, [path]);

  // Hide once both: router ready AND min time elapsed
  useEffect(() => {
    if (!isRouterLoading && minElapsed && show) {
      setShow(false);
    }
  }, [isRouterLoading, minElapsed, show]);
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-background/90 backdrop-blur-sm animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 -m-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <div className="absolute inset-0 -m-6 rounded-full border-2 border-accent/20 border-b-accent animate-spin [animation-direction:reverse] [animation-duration:1.6s]" />
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary/30 via-background to-accent/30 ring-2 ring-primary/50 shadow-[0_0_30px_var(--primary)]">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wiki
            </span>
            <span className="absolute -bottom-1 -right-1 animate-scale-in">
              <VerifiedBadge color="green" size={22} />
            </span>
          </div>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Loading…
        </div>
      </div>
    </div>
  );
}
