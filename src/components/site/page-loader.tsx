import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { VerifiedBadge } from "@/components/site/verified-badge";

const MIN_MS = 3000;

/**
 * Global page loader. Shows for at LEAST 3 seconds on every navigation/page
 * load, and keeps showing past that if the route is still loading. As soon as
 * both conditions are met (min time elapsed AND route ready), it disappears.
 */
export function PageLoader() {
  const isRouterLoading = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
  const [show, setShow] = useState(true);
  const [minDone, setMinDone] = useState(false);
  const firstMount = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (firstMount.current) { firstMount.current = false; return; }
    if (isRouterLoading) {
      setShow(true);
      setMinDone(false);
      const t = setTimeout(() => setMinDone(true), MIN_MS);
      return () => clearTimeout(t);
    }
  }, [isRouterLoading]);

  useEffect(() => {
    if (minDone && !isRouterLoading) setShow(false);
  }, [minDone, isRouterLoading]);

  if (!show) return null;

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
