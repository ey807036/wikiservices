import pair from "@/assets/mascots-pair.png";

export function FloatingMascots() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1 z-[100] flex justify-center">
      <img
        src={pair}
        alt=""
        className="mascot-float h-20 md:h-28 w-auto object-contain drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
      />
    </div>
  );
}
