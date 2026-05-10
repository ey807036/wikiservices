import { useEffect, useRef } from "react";

/**
 * Plays a subtle mouse-click "tick" sound on every user click anywhere.
 * Uses WebAudio (no asset). First click unlocks the audio context.
 */
export function ClickSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const enabled = () => localStorage.getItem("wikiservices_click_sound") !== "off";

    const getCtx = () => {
      if (!ctxRef.current) {
        const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return ctxRef.current;
    };

    const playTick = (downstroke: boolean) => {
      if (!enabled()) return;
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      // Short noise burst → mouse click "tick"
      const len = 0.04;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) {
        const env = Math.pow(1 - i / ch.length, 4);
        ch[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = downstroke ? 2200 : 3000;
      const gain = ctx.createGain();
      gain.gain.value = downstroke ? 0.18 : 0.12;
      src.connect(hp).connect(gain).connect(ctx.destination);
      src.start(t);
      src.stop(t + len);
    };

    const onDown = () => playTick(true);
    const onUp = () => playTick(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return null;
}
