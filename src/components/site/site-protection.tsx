import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Site-wide anti-copy / anti-screenshot protection.
 * - Blocks right-click, drag, common copy/inspect shortcuts
 * - Detects PrintScreen / screen-capture intents → plays alert audio + blurs screen
 * - Blurs the page when it loses focus or visibility (mitigates background screenshots)
 * - NOTE: Browsers cannot truly prevent OS-level screenshots; this is best-effort UX deterrent.
 */
export function SiteProtection() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blurOverlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Preload alert audio
    const audio = new Audio("/sounds/screenshot-alert.mp3");
    audio.preload = "auto";
    audio.volume = 0.9;
    audioRef.current = audio;

    // Create blur overlay (hidden by default)
    const overlay = document.createElement("div");
    overlay.id = "ws-screenshot-shield";
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:2147483646;
      background:#000;color:#22ff88;
      display:none;align-items:center;justify-content:center;
      font-family:ui-monospace,monospace;font-weight:900;
      font-size:clamp(18px,4vw,32px);text-align:center;padding:24px;
      letter-spacing:0.05em;text-shadow:0 0 12px #22ff88;
      backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
    `;
    overlay.innerHTML = `
      <div>
        <div style="font-size:56px;margin-bottom:12px">🚫📸</div>
        <div>Screenshots & Screen Recording DISABLED</div>
        <div style="margin-top:10px;font-size:0.6em;color:#ff5566">Wiki Services · Protected Content</div>
      </div>`;
    document.body.appendChild(overlay);
    blurOverlayRef.current = overlay;

    const showShield = (ms = 1800) => {
      overlay.style.display = "flex";
      try { audio.currentTime = 0; audio.play().catch(() => {}); } catch {}
      window.setTimeout(() => { overlay.style.display = "none"; }, ms);
    };

    const sassyToast = () => {
      const lines = [
        "😂 Bsdk copy karne aya? Apna dimagh laga sale!",
        "🤡 Chal bhag — Wiki Services ka code copy nahi hoga.",
        "💀 AI se copy karwana hai? Pehle akl khareed.",
        "🚫 Ruk ja chor — yahan har move record ho raha hai.",
      ];
      toast.error(lines[Math.floor(Math.random() * lines.length)], { duration: 2500 });
    };

    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); sassyToast(); };
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as HTMLElement).isContentEditable)) return;
      e.preventDefault();
    };
    const onCopy = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as HTMLElement).isContentEditable)) return;
      e.preventDefault();
      e.clipboardData?.setData(
        "text/plain",
        "😂 Bsdk Wiki Services ka content copy karne ki himmat? Bhag yahan se — apna dimagh laga!"
      );
      sassyToast();
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      // PrintScreen / screenshot keys
      if (k === "PrintScreen" || k === "Snapshot") {
        e.preventDefault();
        showShield();
        try { navigator.clipboard.writeText("🚫 Wiki Services — screenshots blocked. Bsdk chala ja!"); } catch {}
        return;
      }
      // DevTools / view-source / save
      const ctrl = e.ctrlKey || e.metaKey;
      if (k === "F12") { e.preventDefault(); sassyToast(); return; }
      if (ctrl && e.shiftKey && ["I", "J", "C"].includes(k.toUpperCase())) { e.preventDefault(); sassyToast(); return; }
      if (ctrl && ["U", "S", "P"].includes(k.toUpperCase())) { e.preventDefault(); sassyToast(); return; }
      // Win+Shift+S (Snipping Tool) — can't truly block, but warn
      if (e.shiftKey && (e.metaKey || (e as any).getModifierState?.("Meta")) && k.toUpperCase() === "S") {
        showShield();
      }
    };

    // Screen-recording / capture detection via getDisplayMedia hook
    const md = navigator.mediaDevices as any;
    if (md && typeof md.getDisplayMedia === "function") {
      const orig = md.getDisplayMedia.bind(md);
      md.getDisplayMedia = async (...args: any[]) => {
        showShield(3500);
        toast.error("🚫 Screen recording blocked by Wiki Services.");
        throw new Error("Screen recording is disabled on Wiki Services.");
      };
    }

    // Visibility / blur — when user switches tab or window (common during screenshot tools), blur the content
    const onVisibility = () => {
      if (document.hidden) {
        document.documentElement.style.filter = "blur(18px)";
      } else {
        document.documentElement.style.filter = "";
      }
    };
    const onBlurWin = () => { document.documentElement.style.filter = "blur(18px)"; };
    const onFocusWin = () => { document.documentElement.style.filter = ""; };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlurWin);
    window.addEventListener("focus", onFocusWin);

    // Global CSS hardening
    const style = document.createElement("style");
    style.id = "ws-protection-style";
    style.textContent = `
      html, body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-touch-callout: none; }
      input, textarea, [contenteditable="true"] { -webkit-user-select: text !important; user-select: text !important; }
      img, video { -webkit-user-drag: none; user-drag: none; pointer-events: auto; }
      ::selection { background: transparent; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlurWin);
      window.removeEventListener("focus", onFocusWin);
      overlay.remove();
      style.remove();
    };
  }, []);

  return null;
}
