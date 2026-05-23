// Real-looking brand SVG logos for product/account marks.
// Each renders a small inline SVG inside a colored tile.

import React from "react";

type LogoProps = { className?: string };

const Tile: React.FC<React.PropsWithChildren<{ bg: string; className?: string; ring?: string }>> = ({
  bg, className = "", ring = "ring-white/25", children,
}) => (
  <span
    className={`grid place-items-center rounded-2xl ${bg} text-white shadow-[0_0_22px_rgba(0,0,0,0.45)] ring-2 ${ring} transition-transform group-hover:scale-110 ${className}`}
  >
    {children}
  </span>
);

export const WhatsAppLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-[#25D366]" className={className} ring="ring-white/30">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="currentColor"><path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.09 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" /></svg>
  </Tile>
);

export const NetflixLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-black" className={className} ring="ring-red-600/50">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><path fill="#E50914" d="M9 4h4l6 18V4h4v24h-4l-6-18v18H9z" /></svg>
  </Tile>
);

export const YouTubeLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-white" className={className} ring="ring-red-600/40">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><rect x="3" y="8" width="26" height="16" rx="4" fill="#FF0000" /><path d="M14 13l5 3-5 3z" fill="#fff" /></svg>
  </Tile>
);

export const SpotifyLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-black" className={className} ring="ring-emerald-500/50">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><circle cx="16" cy="16" r="13" fill="#1DB954" /><path d="M9 13c5-1.5 11-1 15 1.5M10 17c4-1 9-.5 12 1.5M11 21c3-.8 7-.4 9 1" stroke="#000" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
  </Tile>
);

export const InstagramLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none" stroke="#fff" strokeWidth="2.4"><rect x="6" y="6" width="20" height="20" rx="5" /><circle cx="16" cy="16" r="5" /><circle cx="22" cy="10" r="1.4" fill="#fff" /></svg>
  </Tile>
);

export const TikTokLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-black" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><path d="M20 4v14a4 4 0 1 1-4-4" stroke="#25F4EE" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M21 5v14a4 4 0 1 1-4-4" stroke="#FE2C55" strokeWidth="2.5" fill="none" strokeLinecap="round" transform="translate(1 0)" /><path d="M20 4c1 3 3.5 5 6 5" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
  </Tile>
);

export const FacebookLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-[#1877F2]" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M18 28v-9h3l1-4h-4v-2.5c0-1.2.5-2 2-2h2V7s-1.7-.2-3.3-.2c-3.4 0-5.7 2-5.7 5.8V15H10v4h3v9z" /></svg>
  </Tile>
);

export const SnapchatLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-[#FFFC00]" className={className} ring="ring-black/20">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><path fill="#000" d="M16 4c4 0 7 3 7 7v3c1 1 3 1 3 2s-2 1-3 2c0 2-1 4-3 4-1 1-2 3-4 3s-3-2-4-3c-2 0-3-2-3-4-1-1-3-1-3-2s2-1 3-2v-3c0-4 3-7 7-7z" /></svg>
  </Tile>
);

export const TelegramLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-gradient-to-br from-sky-400 to-blue-600" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M5 15l22-8-4 18-7-4-3 4v-5l10-9-12 6z" /></svg>
  </Tile>
);

export const TwitterLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-black" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M19 5h4l-8 9 9 13h-7l-5-7-6 7H2l9-10L2 5h7l4 6z" /></svg>
  </Tile>
);

export const ChatGPTLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-[#10A37F]" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M16 4l10 6v12l-10 6L6 22V10z" opacity=".25" /><path d="M16 7l8 5v8l-8 5-8-5v-8z" /></svg>
  </Tile>
);

export const CanvaLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-gradient-to-br from-cyan-400 to-blue-600" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><circle cx="16" cy="16" r="11" /><path d="M20 13c-1-1.5-2-2-3.5-2-3 0-4.5 3-4.5 5.5s1.5 4.5 4 4.5c2 0 3.5-1.5 4-3" stroke="#1f74cf" strokeWidth="2" fill="none" /></svg>
  </Tile>
);

export const CapCutLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-black" className={className} ring="ring-fuchsia-500/40">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><circle cx="11" cy="11" r="6" fill="#00d4ff" /><circle cx="21" cy="21" r="6" fill="#fe2c55" /><path d="M16 16h.01" stroke="#fff" /></svg>
  </Tile>
);

export const AmazonLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-[#232F3E]" className={className} ring="ring-amber-400/40">
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#FF9900"><path d="M6 22c5 4 15 4 20 0M8 24c-1 1 0 2 1 1.5M22 25c2-1 3-2 2-4" stroke="#FF9900" strokeWidth="2" fill="none" strokeLinecap="round" /><text x="6" y="16" fontSize="11" fontWeight="900" fill="#fff">a</text></svg>
  </Tile>
);

export const DisneyLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-[#0E2A56]" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><text x="3" y="20" fontSize="9" fontWeight="900" fontStyle="italic">Disney</text><text x="22" y="22" fontSize="10" fontWeight="900">+</text></svg>
  </Tile>
);

export const AdobeLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-[#FA0F00]" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M4 6h11v20zM28 6H17v20zM16 12l6 14h-4l-1.8-4h-4z" /></svg>
  </Tile>
);

export const VPNLogo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => (
  <Tile bg="bg-gradient-to-br from-indigo-600 to-violet-800" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M16 4l10 4v8c0 6-5 10-10 12C11 26 6 22 6 16V8z" /><path d="M11 15l4 4 6-7" stroke="#10A37F" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </Tile>
);

// Generic real-style device icons (id card, drone, jammer, sim)
export const IdCardRealLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-700" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><rect x="3" y="7" width="26" height="18" rx="3" fill="#fff" /><circle cx="11" cy="15" r="3" fill="#10b981" /><rect x="17" y="12" width="9" height="2" fill="#0f766e" /><rect x="17" y="16" width="7" height="2" fill="#0f766e" /><rect x="6" y="20" width="20" height="2" fill="#10b981" /></svg>
  </Tile>
);

export const DroneRealLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-gradient-to-br from-slate-200 via-cyan-400 to-slate-800" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none" stroke="#0f172a" strokeWidth="2"><circle cx="7" cy="7" r="4" fill="#0ea5e9" /><circle cx="25" cy="7" r="4" fill="#0ea5e9" /><circle cx="7" cy="25" r="4" fill="#0ea5e9" /><circle cx="25" cy="25" r="4" fill="#0ea5e9" /><rect x="12" y="12" width="8" height="8" rx="2" fill="#1e293b" /><circle cx="16" cy="16" r="2" fill="#ef4444" /></svg>
  </Tile>
);

export const JammerRealLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-700" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="13" y="6" width="6" height="14" rx="1.5" fill="#1e3a8a" /><circle cx="16" cy="23" r="2" fill="#ef4444" /><path d="M9 9c-2 2-2 6 0 8M23 9c2 2 2 6 0 8M6 6c-3 3-3 11 0 14M26 6c3 3 3 11 0 14" /></svg>
  </Tile>
);

export const SimRealLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-gradient-to-br from-fuchsia-400 via-rose-500 to-orange-500" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5"><path d="M9 4h11l6 6v18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fef3c7" /><rect x="11" y="14" width="11" height="9" rx="1.5" fill="#f59e0b" /><path d="M11 17h11M11 20h11M15 14v9M19 14v9" stroke="#92400e" strokeWidth="0.8" /></svg>
  </Tile>
);

export const DatabaseRealLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-gradient-to-br from-emerald-300 via-cyan-500 to-blue-700" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><ellipse cx="16" cy="8" rx="10" ry="3" /><path d="M6 8v6c0 1.7 4.5 3 10 3s10-1.3 10-3V8M6 14v6c0 1.7 4.5 3 10 3s10-1.3 10-3v-6M6 20v4c0 1.7 4.5 3 10 3s10-1.3 10-3v-4" stroke="#fff" strokeWidth="1.5" fill="none" /></svg>
  </Tile>
);

export const DangerRealLogo: React.FC<LogoProps> = ({ className = "h-14 w-14" }) => (
  <Tile bg="bg-gradient-to-br from-red-500 via-rose-600 to-black" className={className}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="#fff"><path d="M16 3l13 24H3z" fill="#000" stroke="#fff" strokeWidth="1.5" /><text x="14" y="22" fontSize="14" fontWeight="900" fill="#ef4444">!</text></svg>
  </Tile>
);
