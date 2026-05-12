import { cn } from "@/lib/utils";

type Color = "blue" | "green" | "red" | "gold";

const colorMap: Record<Color, string> = {
  blue: "#1d9bf0",
  green: "#22c55e",
  red: "#ef4444",
  gold: "#eab308",
};

export function VerifiedBadge({
  color = "blue",
  size = 16,
  className,
}: { color?: Color; size?: number; className?: string }) {
  const fill = colorMap[color];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("inline-block align-middle drop-shadow-[0_0_6px_rgba(0,0,0,0.35)]", className)}
      aria-hidden="true"
    >
      <path
        fill={fill}
        d="M12 1.2l2.6 1.9 3.2-.4 1.4 2.9 2.9 1.4-.4 3.2L23.6 12l-1.9 2.6.4 3.2-2.9 1.4-1.4 2.9-3.2-.4L12 23.6l-2.6-1.9-3.2.4-1.4-2.9L2 17.8l.4-3.2L.4 12l1.9-2.6L1.9 6.2l2.9-1.4 1.4-2.9 3.2.4L12 1.2z"
      />
      <path
        d="M7.5 12.2l3 3 6-6.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
