import hacker from "@/assets/hacker-3d.png";

export function FloatingMascots() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1 z-[100] flex justify-center">
      <img
        src={hacker}
        alt=""
        className="mascot-float h-24 md:h-32 w-auto object-contain drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
      />
    </div>
  );
}
