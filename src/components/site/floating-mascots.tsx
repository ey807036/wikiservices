import hacker from "@/assets/hacker-3d.png";
import girl from "@/assets/girl-3d.png";

export function FloatingMascots() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1 z-[100] flex justify-between px-2">
      <img
        src={hacker}
        alt=""
        width={56}
        height={56}
        className="mascot-float h-12 w-12 md:h-16 md:w-16 object-contain drop-shadow-[0_6px_12px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
      />
      <img
        src={girl}
        alt=""
        width={56}
        height={56}
        className="mascot-float h-12 w-12 md:h-16 md:w-16 object-contain drop-shadow-[0_6px_12px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
        style={{ animationDelay: "1.2s" }}
      />
    </div>
  );
}
