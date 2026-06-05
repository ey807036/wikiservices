import { useEffect, useRef, useState } from "react";
import passVideo from "@/assets/fia-videos/pass.mp4.asset.json";
import failVideo from "@/assets/fia-videos/fail.mp4.asset.json";
import backVideo from "@/assets/fia-videos/back.mp4.asset.json";

export type FiaVideoKind = "pass" | "fail" | "back";

const SRC: Record<FiaVideoKind, string> = {
  pass: passVideo.url,
  fail: failVideo.url,
  back: backVideo.url,
};

// Preload all 3 videos so they're ready instantly
export function FiaPreloadVideos() {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    (Object.values(SRC) as string[]).forEach((url) => {
      const l = document.createElement("link");
      l.rel = "preload"; l.as = "video"; l.href = url;
      document.head.appendChild(l);
      links.push(l);
    });
    // also kick off network fetch by creating hidden video elements
    const vids: HTMLVideoElement[] = [];
    (Object.values(SRC) as string[]).forEach((url) => {
      const v = document.createElement("video");
      v.src = url; v.preload = "auto"; v.muted = true;
      v.style.display = "none";
      document.body.appendChild(v);
      vids.push(v);
    });
    return () => {
      links.forEach((l) => l.remove());
      vids.forEach((v) => v.remove());
    };
  }, []);
  return null;
}

export function FiaResultVideoCircle({ kind, size = 240 }: { kind: FiaVideoKind; size?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const v = ref.current;
    if (!v) return;
    const onReady = () => setReady(true);
    v.addEventListener("canplay", onReady);
    v.load();
    v.play().catch(() => {});
    return () => v.removeEventListener("canplay", onReady);
  }, [kind]);

  const neon = "oklch(0.65 0.28 25)"; // neon red

  return (
    <div
      className="relative mx-auto rounded-full overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: `3px solid ${neon}`,
        boxShadow: `0 0 24px ${neon}, 0 0 60px ${neon}, inset 0 0 18px ${neon}`,
        background: "#000",
      }}
    >
      <video
        ref={ref}
        src={SRC[kind]}
        autoPlay
        loop
        playsInline
        muted={false}
        controls={false}
        className="w-full h-full object-cover"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs font-bold tracking-widest"
          style={{ color: neon, textShadow: `0 0 8px ${neon}` }}>
          LOADING...
        </div>
      )}
    </div>
  );
}
