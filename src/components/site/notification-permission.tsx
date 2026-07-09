import { useEffect, useState } from "react";
import { Bell, ShieldAlert, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-config";
import { toast } from "sonner";

// v2: bumped to re-prompt every existing user once more (fresh permission pass).
// v3: force re-sync for users who granted permission earlier but never got saved in DB.
// v4: verify endpoint actually exists in DB on every load — recovers users who granted
//     during the broken window and whose subscription was never persisted server-side.
const SUBSCRIBED_KEY = "__push_perm_subscribed_v4";
const MEDIA_GRANTED_KEY = "__media_perm_granted_v1";

export function NotificationPermission() {
  const [supported, setSupported] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifDenied, setNotifDenied] = useState(false);
  const [mediaGranted, setMediaGranted] = useState(false);
  const [mediaDenied, setMediaDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "navigate" && e.data.url) window.location.href = e.data.url;
    };
    navigator.serviceWorker.addEventListener("message", onMsg);

    const perm = Notification.permission;
    if (perm === "granted") {
      setNotifGranted(true);
      ensureSubscribed();
    } else if (perm === "denied") {
      setNotifDenied(true);
    }

    // Check camera/mic permission status
    checkMediaStatus();

    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, []);

  async function checkMediaStatus() {
    if (localStorage.getItem(MEDIA_GRANTED_KEY) === "1") {
      setMediaGranted(true);
      return;
    }
    try {
      // @ts-ignore
      if (navigator.permissions?.query) {
        // @ts-ignore
        const cam = await navigator.permissions.query({ name: "camera" }).catch(() => null);
        // @ts-ignore
        const mic = await navigator.permissions.query({ name: "microphone" }).catch(() => null);
        if (cam?.state === "granted" && mic?.state === "granted") {
          localStorage.setItem(MEDIA_GRANTED_KEY, "1");
          setMediaGranted(true);
        } else if (cam?.state === "denied" || mic?.state === "denied") {
          setMediaDenied(true);
        }
      }
    } catch {}
  }

  async function ensureSubscribed() {
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      const alreadySynced = localStorage.getItem(SUBSCRIBED_KEY) === "1";
      if (sub && !alreadySynced) {
        try { await sub.unsubscribe(); } catch {}
        sub = null;
      }
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }
      const json = sub.toJSON();
      const { data: userData } = await supabase.auth.getUser();
      const row = {
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
        user_id: userData.user?.id ?? null,
        user_agent: navigator.userAgent,
        last_seen_at: new Date().toISOString(),
      };
      const ins = await supabase.from("push_subscriptions").insert(row);
      if (ins.error) {
        if ((ins.error as any).code === "23505") {
          await supabase
            .from("push_subscriptions")
            .update({
              p256dh: row.p256dh,
              auth: row.auth,
              user_id: row.user_id,
              user_agent: row.user_agent,
              last_seen_at: row.last_seen_at,
            })
            .eq("endpoint", row.endpoint);
        } else {
          throw ins.error;
        }
      }
      localStorage.setItem(SUBSCRIBED_KEY, "1");
    } catch (err) {
      console.error("[push] subscribe failed", err);
    }
  }

  async function enableNotifications() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await ensureSubscribed();
        setNotifGranted(true);
        toast.success("通知已开启 🔔");
      } else if (perm === "denied") {
        setNotifDenied(true);
      }
    } finally {
      setBusy(false);
    }
  }

  async function enableMedia() {
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Immediately stop tracks — we only need the permission grant
      stream.getTracks().forEach((t) => t.stop());
      localStorage.setItem(MEDIA_GRANTED_KEY, "1");
      setMediaGranted(true);
      setMediaDenied(false);
      toast.success("相机和麦克风已授权 ✅");
    } catch (err: any) {
      // Denied or dismissed → keep overlay up so user must allow to continue
      setMediaDenied(true);
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;
  // Overlay stays visible until BOTH notifications and camera+mic are granted
  if (notifGranted && mediaGranted) return null;

  // Decide which step to show — notifications first, then camera+mic
  const step: "notif" | "media" = !notifGranted ? "notif" : "media";
  const denied = step === "notif" ? notifDenied : mediaDenied;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        background: "rgba(0,0,0,0.94)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "linear-gradient(180deg,#0b0b0b 0%,#111 100%)",
          border: "1px solid rgba(239,68,68,0.55)",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 20px 60px rgba(239,68,68,0.35)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "radial-gradient(circle,#ef4444 0%,#7f1d1d 100%)",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(239,68,68,0.7)",
          }}
        >
          {denied ? (
            <ShieldAlert size={38} color="white" />
          ) : step === "notif" ? (
            <Bell size={38} color="white" />
          ) : (
            <Camera size={38} color="white" />
          )}
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          {step === "notif"
            ? denied
              ? "通知已被阻止"
              : "开启通知"
            : denied
              ? "相机和麦克风被阻止"
              : "开启相机和麦克风"}
        </h3>

        {denied ? (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 18, lineHeight: 1.7, textAlign: "left" }}>
            <p style={{ marginBottom: 10, fontWeight: 600, textAlign: "center" }}>
              您之前拒绝了权限，浏览器不会再次询问。请手动开启后继续使用。
            </p>
            <p style={{ marginBottom: 6, fontWeight: 700 }}>解锁方法：</p>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li>点击地址栏开头的 🔒 <b>锁形</b> 图标</li>
              <li>
                将 <b>{step === "notif" ? "通知" : "相机 与 麦克风"}</b> 设为 <b>允许</b>
              </li>
              <li>刷新页面</li>
            </ol>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 22, lineHeight: 1.7 }}>
            {step === "notif"
              ? "使用本网站需要开启通知。新产品、优惠和更新将直接发送到您的设备 — 即使网站已关闭。"
              : "使用本网站需要同时开启相机和麦克风权限，请点击下方按钮授权。"}
          </p>
        )}

        {!denied && (
          <button
            disabled={busy}
            onClick={step === "notif" ? enableNotifications : enableMedia}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12, border: 0,
              background: "linear-gradient(90deg,#ef4444,#dc2626)", color: "white",
              fontWeight: 800, fontSize: 16, cursor: busy ? "wait" : "pointer",
              boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
            }}
          >
            {busy ? "处理中..." : step === "notif" ? "允许通知" : "允许相机和麦克风"}
          </button>
        )}

        {denied && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => {
                // Reset denied state and try again — user cannot skip
                if (step === "notif") {
                  setNotifDenied(false);
                  enableNotifications();
                } else {
                  setMediaDenied(false);
                  enableMedia();
                }
              }}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, border: 0,
                background: "linear-gradient(90deg,#ef4444,#dc2626)", color: "white",
                fontWeight: 800, fontSize: 16, cursor: "pointer",
                boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
              }}
            >
              重试
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)", background: "transparent",
                color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}
            >
              已允许 — 刷新页面
            </button>
          </div>
        )}

        <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          第 {step === "notif" ? "1" : "2"} / 2 步 · 授权后此弹窗将永久消失
        </p>
      </div>
    </div>
  );
}
