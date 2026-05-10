import hacker from "@/assets/hacker-3d.png";
import girl from "@/assets/girl-3d.png";

export function FloatingMascots() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[55] flex justify-between px-2 md:px-6">
      <img
        src={hacker}
        alt=""
        width={64}
        height={64}
        className="h-14 w-14 md:h-20 md:w-20 object-contain drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
        style={{ animation: "mascotFloat 3.2s ease-in-out infinite" }}
      />
      <img
        src={girl}
        alt=""
        width={64}
        height={64}
        className="h-14 w-14 md:h-20 md:w-20 object-contain drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
        style={{ animation: "mascotFloat 3.2s ease-in-out infinite", animationDelay: "1.2s" }}
      />
      <style>{`
        @keyframes mascotFloat {
          0%,100% { transform: translateY(0) rotate(-2deg) }
          50% { transform: translateY(-10px) rotate(2deg) }
        }
      `}</style>
    </div>
  );
}
