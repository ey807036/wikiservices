import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendPushNotification } from "@/lib/push.functions";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [image, setImage] = useState("");
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
      qc.invalidateQueries({ queryKey: ["push-history"] });
      qc.invalidateQueries({ queryKey: ["push-sub-count"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to send"),
  });

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `notifications/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("store-products").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("store-products").getPublicUrl(path);
      setImage(data.publicUrl);
      toast.success("Image upload ho gayi");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
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
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... (JPG, PNG, GIF)"
              className="flex-1"
            />
            <input
              id="notif-image-file"
              type="file"
              accept="image/*,.gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById("notif-image-file")?.click()}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {image && (
            <div className="rounded-lg border p-2">
              <img src={image} alt="preview" className="max-h-40 rounded" />
              <button
                type="button"
                onClick={() => setImage("")}
                className="mt-1 text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Animated GIF Android Chrome par chalti hai. Desktop par pehli frame dikhti hai.
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
