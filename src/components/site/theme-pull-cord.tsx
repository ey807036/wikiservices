import { useEffect, useRef, useState } from "react";
import { THEMES } from "./theme-provider";

const KEY = "wikiservices_theme_local";

function applyTheme(t: string) {
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.style.colorScheme = t === "light" ? "light" : "dark";
}

export function ThemePullCord() {
  const [idx, setIdx] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const i = THEMES.findIndex((t) => t.id === saved);
      if (i >= 0) {
        setIdx(i);
        applyTheme(saved);
      }
    }
  }, []);

  const cycle = () => {
    const next = (idx + 1) % THEMES.length;
    setIdx(next);
    const t = THEMES[next].id;
    applyTheme(t);
    try { localStorage.setItem(KEY, t); } catch {}
    // flash
    document.documentElement.animate(
      [{ filter: "brightness(1)" }, { filter: "brightness(1.6)" }, { filter: "brightness(1)" }],
      { duration: 350 }
    );
  };

  const onDown = (y: number) => { startY.current = y; setPulling(true); };
  const onMove = (y: number) => {
    if (startY.current == null) return;
    const d = Math.max(0, Math.min(80, y - startY.current));
    setDrag(d);
  };
  const onUp = () => {
    if (drag > 40) cycle();
    setDrag(0);
    setPulling(false);
    startY.current = null;
  };

  const current = THEMES[idx];

  return (
    <div
      className="fixed top-0 right-6 z-50 flex flex-col items-center select-none"
      style={{ touchAction: "none" }}
    >
      {/* rope */}
      <div
        className="w-[3px] bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/30"
        style={{ height: `${72 + drag}px`, transition: pulling ? "none" : "height 0.4s cubic-bezier(.5,1.6,.4,1)" }}
      />
      {/* bulb */}
      <button
        aria-label={`Theme: ${current.label} — click or pull to change`}
        title={`Theme: ${current.label}`}
        onClick={cycle}
        onMouseDown={(e) => onDown(e.clientY)}
        onMouseMove={(e) => pulling && onMove(e.clientY)}
        onMouseUp={onUp}
        onMouseLeave={() => pulling && onUp()}
        onTouchStart={(e) => onDown(e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientY)}
        onTouchEnd={onUp}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/50 bg-primary/20 backdrop-blur cursor-grab active:cursor-grabbing"
        style={{
          boxShadow: "0 0 24px 4px var(--primary), inset 0 -4px 8px rgba(0,0,0,.25)",
          transition: pulling ? "none" : "transform 0.4s cubic-bezier(.5,1.6,.4,1)",
        }}
      >
        <span className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 animate-pulse" />
        <span className="relative text-[10px] font-bold text-primary-foreground">💡</span>
      </button>
      <span className="mt-1 rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary backdrop-blur">
        {current.label.split(" ")[0]}
      </span>
    </div>
  );
}
