import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VerifiedBadge } from "@/components/site/verified-badge";

/**
 * Cute global page loader. Shows whenever the router is loading the next route,
 * then disappears as soon as the new page is ready (so users don't have to wait).
 */
export function PageLoader() {
  const isLoading = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t: any;
    if (isLoading) {
      // Tiny delay so instant navigations don't flash the overlay.
      t = setTimeout(() => setShow(true), 80);
    } else {
      setShow(false);
    }
    return () => clearTimeout(t);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-background/85 backdrop-blur-sm animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 -m-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
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
