import { useEffect, useRef } from "react";

const preloadedVideos = new Map<string, HTMLVideoElement>();
const preloadedLinks = new Set<string>();

function warmVideo(src: string) {
  if (!src || typeof document === "undefined") return;

  if (!preloadedLinks.has(src)) {
    preloadedLinks.add(src);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = src;
    link.type = "video/mp4";
    document.head.appendChild(link);
  }

  let video = preloadedVideos.get(src);
  if (video) {
    video.load();
    return;
  }

  video = document.createElement("video");
  video.src = src;
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("aria-hidden", "true");
  video.style.cssText =
    "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;top:-9999px;";
  document.body.appendChild(video);
  preloadedVideos.set(src, video);
  video.load();

  fetch(src, { cache: "force-cache" }).catch(() => {});
}

type Props = {
  src: string;
  onEnd: () => void;
  size?: number;
};

/**
 * Fullscreen modal overlay showing a circular video with red neon glow.
 * Autoplays with audio, no controls, dismisses itself when video ends.
 */
export function NeonVideoCircle({ src, onEnd, size = 280 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    warmVideo(src);
    const v = videoRef.current;
    if (!v) return;
    v.preload = "auto";
    v.load();
    v.muted = false;
    v.volume = 1;
    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // Browser blocked audio — retry muted so visual still plays
        v.muted = true;
        try {
          await v.play();
        } catch {
          void 0;
        }
      }
    };
    tryPlay();
  }, [src]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onEnd}
    >
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          boxShadow:
            "0 0 25px 6px oklch(0.65 0.25 25 / 0.9), 0 0 60px 18px oklch(0.65 0.25 25 / 0.55), 0 0 120px 40px oklch(0.65 0.25 25 / 0.3)",
          animation: "neon-pulse 1.6s ease-in-out infinite",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-red-500/80"
          aria-hidden
        />
        <video
          ref={videoRef}
          src={src}
          autoPlay
          playsInline
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          onEnded={onEnd}
          onError={onEnd}
          className="h-full w-full object-cover select-none pointer-events-none"
        />
      </div>
      <style>{`
        @keyframes neon-pulse {
          0%, 100% {
            box-shadow: 0 0 25px 6px oklch(0.65 0.25 25 / 0.9), 0 0 60px 18px oklch(0.65 0.25 25 / 0.55), 0 0 120px 40px oklch(0.65 0.25 25 / 0.3);
          }
          50% {
            box-shadow: 0 0 35px 10px oklch(0.7 0.27 25 / 1), 0 0 90px 28px oklch(0.65 0.25 25 / 0.7), 0 0 160px 60px oklch(0.65 0.25 25 / 0.45);
          }
        }
      `}</style>
    </div>
  );
}

/** Hidden <video> tags to force-preload assets the moment the page mounts. */
export function VideoPreloader({ sources }: { sources: string[] }) {
  useEffect(() => {
    sources.forEach(warmVideo);
  }, [sources]);

  return (
    <div
      aria-hidden
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }}
    >
      {sources.map((s) => (
        <video key={s} src={s} preload="auto" muted playsInline aria-hidden />
      ))}
    </div>
  );
}
