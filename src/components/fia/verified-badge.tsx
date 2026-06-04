import { cn } from "@/lib/utils";

interface Props { size?: number; className?: string }

export function FiaVerifiedBadge({ size = 22, className }: Props) {
  const points = 12;
  const outer = 11;
  const inner = 9.4;
  const cx = 12, cy = 12;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += (i === 0 ? "M" : "L") + (cx + Math.cos(a) * r).toFixed(2) + " " + (cy + Math.sin(a) * r).toFixed(2) + " ";
  }
  d += "Z";

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block drop-shadow-[0_0_6px_oklch(0.78_0.2_145/0.8)]", className)}
      aria-label="Verified">
      <path d={d} fill="oklch(0.72 0.22 145)" stroke="oklch(0.88 0.2 145)" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M7.5 12.3l3 3 6-6.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
