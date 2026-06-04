interface Props { size?: number; src?: string }

export function FiaNeonLogo({ size = 120, src }: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        padding: 3,
        background: "linear-gradient(135deg, oklch(0.85 0.22 145), oklch(0.7 0.28 25))",
        boxShadow: "0 0 24px oklch(0.85 0.22 145 / 0.7), 0 0 40px oklch(0.7 0.28 25 / 0.4)",
      }}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center"
        style={{ boxShadow: "inset 0 0 18px rgba(0,0,0,0.6)" }}>
        {src ? (
          <img src={src} alt="FIA Preparation" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold" style={{ color: "oklch(0.85 0.22 145)", textShadow: "0 0 10px oklch(0.85 0.22 145)" }}>FIA</span>
        )}
      </div>
    </div>
  );
}
