import { useEffect, useState } from "react";
import { Bell, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-config";
import { toast } from "sonner";

// v2: bumped to re-prompt every existing user once more (fresh permission pass).
// v3: force re-sync for users who granted permission earlier but never got saved in DB.
const SUBSCRIBED_KEY = "__push_perm_subscribed_v3";

export function NotificationPermission() {
  const [supported, setSupported] = useState(true);
  const [granted, setGranted] = useState(false);
  const [denied, setDenied] = useState(false);
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
      setGranted(true);
      ensureSubscribed();
    } else if (perm === "denied") {
      setDenied(true);
    }
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
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
        // duplicate endpoint (unique) → update existing row instead
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

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await ensureSubscribed();
        setGranted(true);
        toast.success("Notifications on ho gayi! 🔔");
      } else if (perm === "denied") {
        setDenied(true);
      }
    } finally {
      setBusy(false);
    }
  }

  // Unsupported browser: don't block (iOS Safari without PWA, older browsers)
  if (!supported) return null;
  // Already granted or nothing to do
  if (granted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        background: "rgba(0,0,0,0.92)",
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
          {denied ? <ShieldAlert size={38} color="white" /> : <Bell size={38} color="white" />}
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          {denied ? "Notifications Blocked Hain" : "Notifications On Karein"}
        </h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 22, lineHeight: 1.6 }}>
          {denied
            ? "Aap ne notifications block ki hain. Site use karne ke liye browser settings mein ja kar is site ke liye notifications 'Allow' karein, phir page reload karein."
            : "Site use karne ke liye notifications on karna zaroori hai. Naye products, offers, aur updates seedha aap ke phone par pohnchein ge — chahe website band ho."}
        </p>
        {!denied && (
          <button
            disabled={busy}
            onClick={enable}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: 0,
              background: "linear-gradient(90deg,#ef4444,#dc2626)",
              color: "white",
              fontWeight: 800,
              fontSize: 16,
              cursor: busy ? "wait" : "pointer",
              boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
            }}
          >
            {busy ? "Enabling..." : "Allow Notifications"}
          </button>
        )}
        {denied && (
          <button
            onClick={() => window.location.reload()}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: 0,
              background: "linear-gradient(90deg,#ef4444,#dc2626)",
              color: "white",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
            }}
          >
            Reload Page
          </button>
        )}
        <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Aik dafa allow karne ke baad yeh popup dobara nahi aayega.
        </p>
      </div>
    </div>
  );
}
