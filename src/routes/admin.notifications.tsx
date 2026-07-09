import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendPushNotification } from "@/lib/push.functions";
import { Bell, FileImage, ImagePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_NOTIFICATION_IMAGE_WIDTH = 1200;
const MAX_NOTIFICATION_IMAGE_HEIGHT = 800;

function getNotificationImageSize(width: number, height: number) {
  const scale = Math.min(1, MAX_NOTIFICATION_IMAGE_WIDTH / width, MAX_NOTIFICATION_IMAGE_HEIGHT / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToJpegBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image convert nahi ho saki"));
      },
      "image/jpeg",
      0.9
    );
  });
}

async function convertImageFileToNotificationJpeg(file: File) {
  const localUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = localUrl;
    try {
      await img.decode();
    } catch {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("GIF/image read nahi ho saki"));
      });
    }
    await new Promise((r) => setTimeout(r, 60));

    const size = getNotificationImageSize(img.naturalWidth || img.width || 640, img.naturalHeight || img.height || 480);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image convert nahi ho saki");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(img, 0, 0, size.width, size.height);
    return canvasToJpegBlob(canvas);
  } finally {
    URL.revokeObjectURL(localUrl);
  }
}

async function convertVideoFileToNotificationJpeg(file: File) {
  const localUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = localUrl;

    await new Promise<void>((resolve, reject) => {
      video.onerror = () => reject(new Error("Animation/video read nahi ho saki"));
      video.onloadedmetadata = () => resolve();
      video.load();
    });

    const target = Math.min(0.1, Math.max(0, (video.duration || 1) * 0.1));
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      video.onseeked = finish;
      video.onloadeddata = finish;
      try { video.currentTime = target; } catch { finish(); }
      setTimeout(finish, 1500);
    });
    await new Promise((r) => setTimeout(r, 120));

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const size = getNotificationImageSize(w, h);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Video convert nahi ho saki");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(video, 0, 0, size.width, size.height);
    return canvasToJpegBlob(canvas);
  } finally {
    URL.revokeObjectURL(localUrl);
  }
}

function shouldConvertForNotification(file: File) {
  const fileName = file.name.toLowerCase();
  return (
    file.type === "image/gif" ||
    file.type === "image/webp" ||
    file.type.startsWith("video/") ||
    fileName.endsWith(".gif") ||
    fileName.endsWith(".webp")
  );
}

async function convertForNotificationIfNeeded(file: File, forceConvert = false) {
  const mustConvert = forceConvert || shouldConvertForNotification(file);
  if (!mustConvert) return null;
  const blob = file.type.startsWith("video/")
    ? await convertVideoFileToNotificationJpeg(file)
    : await convertImageFileToNotificationJpeg(file);
  return { blob, ext: "jpg", contentType: "image/jpeg" };
}

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [image, setImage] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [verified, setVerified] = useState(true);
  const [silent, setSilent] = useState(false);
  const qc = useQueryClient();

  const subCount = useQuery({
    queryKey: ["push-sub-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("push_subscriptions")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const history = useQuery({
    queryKey: ["push-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("push_notifications_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const sendFn = useServerFn(sendPushNotification);
  const send = useMutation({
    mutationFn: (input: { title: string; body: string; url: string; image?: string; verified: boolean; silent: boolean }) =>
      sendFn({ data: input }),
    onSuccess: (res: any) => {
      toast.success(`Sent to ${res.sent} of ${res.total} devices${res.failed ? ` (${res.failed} failed)` : ""}`);
      setTitle("");
      setBody("");
      setUrl("/");
      setImage("");
      setMediaType("");
      qc.invalidateQueries({ queryKey: ["push-history"] });
      qc.invalidateQueries({ queryKey: ["push-sub-count"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to send"),
  });

  async function handleUpload(file: File, options: { forceConvert?: boolean } = {}) {
    const fileName = file.name.toLowerCase();
    const isAllowedImage = file.type.startsWith("image/") || file.type.startsWith("video/") || fileName.endsWith(".gif");
    if (!isAllowedImage) {
      toast.error("Sirf image, GIF ya gallery animation upload karein");
      return;
    }

    setUploading(true);
    try {
      const converted = await convertForNotificationIfNeeded(file, options.forceConvert);
      const uploadFile = converted?.blob ?? file;
      const ext = converted?.ext ?? (file.name.split(".").pop()?.toLowerCase() ?? "png");
      const path = `notifications/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, uploadFile, {
        cacheControl: "3600",
        contentType: converted?.contentType ?? (file.type || undefined),
      });
      if (error) throw error;
      const { data } = supabase.storage.from("store-products").getPublicUrl(path);
      setImage(data.publicUrl);
      setMediaType(converted?.contentType ?? (file.type || (fileName.endsWith(".gif") ? "image/gif" : "")));
      toast.success("Upload ho gayi");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGifUpload(file: File) {
    const fileName = file.name.toLowerCase();
    const isGalleryAnimation =
      file.type === "image/gif" ||
      file.type.startsWith("video/") ||
      fileName.endsWith(".gif") ||
      fileName.endsWith(".webp");

    if (!isGalleryAnimation) {
      toast.error("GIF/animation select karein — normal photo Picture button se upload karein");
      return;
    }
    await handleUpload(file, { forceConvert: true });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-red-500/15 p-3 text-red-500"><Bell className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Push Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {subCount.data ?? 0} subscribers active
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Send New Notification</h2>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naya offer! 🔥" maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Kya keh dena chahte ho..." rows={3} maxLength={300} />
        </div>
        <div className="space-y-2">
          <Label>Open URL (jab user click kare)</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/" />
        </div>
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
            <span>Verified tick <span className="text-green-600 font-bold">✅</span> lagayein (title ke aakhir mein)</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={silent} onChange={(e) => setSilent(e.target.checked)} />
            <span>Silent bhejein (bina sound / vibration)</span>
          </label>
          <p className="text-xs text-muted-foreground">
            Note: Custom notification sound browsers support nahi karte — default OS sound + vibration use hoti hai jab silent off ho.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Picture / GIF (optional)</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                setMediaType("");
              }}
              placeholder="https://... (JPG, PNG, GIF)"
              className="flex-1"
            />
            <input
              id="notif-image-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <input
              id="notif-gif-file"
              type="file"
              accept="image/gif,video/*,.gif,.webp,*/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleGifUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById("notif-image-file")?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Picture"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById("notif-gif-file")?.click()}
            >
              <FileImage className="mr-2 h-4 w-4" />
              GIF
            </Button>
          </div>
          {image && (
            <div className="rounded-lg border p-2">
              {mediaType.startsWith("video/") ? (
                <video src={image} controls muted playsInline className="max-h-40 rounded" />
              ) : (
                <img src={image} alt="preview" className="max-h-40 rounded" />
              )}
              <button
                type="button"
                onClick={() => {
                  setImage("");
                  setMediaType("");
                }}
                className="mt-1 text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            GIF/animation ko app notification ke liye auto JPEG image mein convert karegi, taa ke notification mein picture show ho.
          </p>
        </div>
        <Button
          disabled={!title.trim() || !body.trim() || send.isPending || (subCount.data ?? 0) === 0}
          onClick={() => send.mutate({ title: title.trim(), body: body.trim(), url: url.trim() || "/", image: image.trim() || undefined, verified, silent })}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {send.isPending ? "Sending..." : `Send to ${subCount.data ?? 0} devices`}
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
        {history.data && history.data.length > 0 ? (
          <div className="space-y-3">
            {history.data.map((n: any) => (
              <div key={n.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{n.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{n.body}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-green-600">✓ {n.sent_count}</div>
                  {n.failed_count > 0 && <div className="text-xs text-red-500">✗ {n.failed_count}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Abhi tak koi notification nahi bheji.</p>
        )}
      </div>
    </div>
  );
}
