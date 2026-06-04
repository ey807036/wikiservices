import { supabase } from "@/integrations/supabase/client";

export const FIA_BUCKET = "fia-assets";
const LONG_EXPIRY = 60 * 60 * 24 * 365 * 100;

/** Upload a file to fia-assets and return a long-lived signed URL. */
export async function uploadFiaFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(FIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(FIA_BUCKET)
    .createSignedUrl(path, LONG_EXPIRY);
  if (signErr || !data) throw signErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export async function deleteFiaByUrl(url: string): Promise<void> {
  const m = url.match(/\/fia-assets\/([^?]+)/);
  if (!m) return;
  await supabase.storage.from(FIA_BUCKET).remove([decodeURIComponent(m[1])]);
}
