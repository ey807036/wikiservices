import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-config";
import { toast } from "sonner";

const DISMISS_KEY = "__push_perm_dismissed_v1";
const SUBSCRIBED_KEY = "__push_perm_subscribed_v1";

export function NotificationPermission() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Register service worker once
    navigator.serviceWorker.register("/sw.js").catch(() => {});

    // Listen for SW navigation messages
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "navigate" && e.data.url) window.location.href = e.data.url;
    };
    navigator.serviceWorker.addEventListener("message", onMsg);

    const perm = Notification.permission;
    if (perm === "granted") {
      // Already granted — ensure DB has our subscription and never ask again
      ensureSubscribed();
      return () => navigator.serviceWorker.removeEventListener("message", onMsg);
    }
    if (perm === "denied") return () => navigator.serviceWorker.removeEventListener("message", onMsg);

    if (localStorage.getItem(DISMISS_KEY) === "1") return () => navigator.serviceWorker.removeEventListener("message", onMsg);

    // Show our styled prompt after a short delay
    const t = setTimeout(() => setShow(true), 2500);
    return () => {
      clearTimeout(t);
      navigator.serviceWorker.removeEventListener("message", onMsg);
    };
  }, []);

  async function ensureSubscribed() {
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }
      const json = sub.toJSON();
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("push_subscriptions").upsert(
        {
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
          user_id: userData.user?.id ?? null,
          user_agent: navigator.userAgent,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );
      localStorage.setItem(SUBSCRIBED_KEY, "1");
    } catch (err) {
      console.error("[push] subscribe failed", err);
    }
  }

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await ensureSubscribed();
        toast.success("Notifications on ho gayi! 🔔");
        setShow(false);
      } else {
        localStorage.setItem(DISMISS_KEY, "1");
        setShow(false);
      }
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 210,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 380,
          width: "100%",
          background: "linear-gradient(180deg,#0b0b0b 0%,#111 100%)",
          border: "1px solid rgba(239,68,68,0.55)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 20px 60px rgba(239,68,68,0.35)",
          color: "white",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          aria-label="Close"
          onClick={dismiss}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "transparent",
            border: 0,
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "radial-gradient(circle,#ef4444 0%,#7f1d1d 100%)",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(239,68,68,0.7)",
          }}
        >
          <Bell size={34} color="white" />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Notifications On karein</h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 20, lineHeight: 1.5 }}>
          Naye products, offers, aur updates ki khabar seedha aap ke phone par — chahe website band ho.
        </p>
        <button
          disabled={busy}
          onClick={enable}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: 0,
            background: "linear-gradient(90deg,#ef4444,#dc2626)",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: busy ? "wait" : "pointer",
            boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
          }}
        >
          {busy ? "Enabling..." : "Allow Notifications"}
        </button>
        <button
          onClick={dismiss}
          style={{
            marginTop: 10,
            background: "transparent",
            border: 0,
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Abhi nahi
        </button>
      </div>
    </div>
  );
}
