import { Sparkles } from "lucide-react";

type Props = {
  src?: string | null;
  alt?: string;
  /** glow color (CSS color or var). defaults to var(--primary) */
  glow?: string;
  size?: number;
  fallbackIcon?: boolean;
};

/**
 * Round logo with animated neon-glow ring. Used at the top of /lucky-draw and /store.
 */
export function NeonLogo({ src, alt = "", glow = "var(--primary)", size = 96, fallbackIcon = true }: Props) {
  if (!src && !fallbackIcon) return null;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Outer pulsing halo */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          filter: "blur(14px)",
          opacity: 0.85,
        }}
      />
      {/* Rotating ring */}
      <div
        className="absolute -inset-2 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${glow}, transparent 50%, ${glow}, transparent)`,
          animation: "spin 6s linear infinite",
          filter: "blur(2px)",
          opacity: 0.65,
        }}
      />
      {/* Logo / fallback */}
      <div
        className="relative rounded-full overflow-hidden border-2 grid place-items-center bg-card"
        style={{
          width: size,
          height: size,
          borderColor: glow,
          boxShadow: `0 0 30px ${glow}, inset 0 0 20px ${glow}`,
        }}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <Sparkles className="h-10 w-10" style={{ color: glow }} />
        )}
      </div>
    </div>
  );
}
