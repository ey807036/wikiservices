import { useEffect, useState } from "react";
import { Settings2, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type Fx = { scanlines: number; glow: number; grid: number };
const KEY = "wifihub_fx";
const DEFAULTS: Fx = { scanlines: 0.6, glow: 0.6, grid: 0.6 };

function apply(fx: Fx) {
  const r = document.documentElement;
  r.style.setProperty("--fx-scanlines", String(fx.scanlines));
  r.style.setProperty("--fx-glow", String(fx.glow));
  r.style.setProperty("--fx-grid", String(fx.grid));
}

export function ThemeIntensity() {
  const [fx, setFx] = useState<Fx>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Fx;
        setFx(parsed);
        apply(parsed);
      } else {
        apply(DEFAULTS);
      }
    } catch { apply(DEFAULTS); }
    setMounted(true);
  }, []);

  const update = (patch: Partial<Fx>) => {
    const next = { ...fx, ...patch };
    setFx(next);
    apply(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const reset = () => update(DEFAULTS);

  if (!mounted) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          aria-label="Theme intensity"
          className="fixed bottom-5 right-5 z-50 h-11 w-11 rounded-full bg-background/80 backdrop-blur shadow-glow"
        >
          <Settings2 className="h-5 w-5 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-72">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-wider text-primary">FX Console</div>
          <Button size="sm" variant="ghost" onClick={reset} className="h-7 px-2 text-xs">
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
        </div>
        <div className="mt-4 space-y-5">
          {([
            ["scanlines", "Scanlines", fx.scanlines],
            ["glow", "Neon Glow", fx.glow],
            ["grid", "Grid / Background", fx.grid],
          ] as const).map(([key, label, val]) => (
            <div key={key}>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground tabular-nums">{Math.round(val * 100)}%</span>
              </div>
              <Slider
                value={[val]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(v) => update({ [key]: v[0] } as Partial<Fx>)}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">Drag to dial in your hacker vibes.</p>
      </PopoverContent>
    </Popover>
  );
}
