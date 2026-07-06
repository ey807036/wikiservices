import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SendInput = { title: string; body: string; url?: string; icon?: string };

export const sendPushNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SendInput) => {
    if (!input?.title || !input?.body) throw new Error("title and body required");
    return {
      title: String(input.title).slice(0, 200),
      body: String(input.body).slice(0, 500),
      url: input.url ? String(input.url).slice(0, 500) : "/",
      icon: input.icon ? String(input.icon).slice(0, 500) : undefined,
    };
  })
  .handler(async ({ data, context }) => {
    // Verify admin
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs, error: subErr } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");
    if (subErr) throw subErr;
    if (!subs || subs.length === 0) {
      return { sent: 0, failed: 0, total: 0 };
    }

    const webpushMod = await import("web-push");
    const webpush = (webpushMod as any).default ?? webpushMod;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@wikiservices.pk",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url,
      icon: data.icon,
    });

    let sent = 0;
    let failed = 0;
    const deadIds: string[] = [];

    await Promise.all(
      subs.map(async (s: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 60 * 60 * 24 }
          );
          sent++;
        } catch (err: any) {
          failed++;
          if (err?.statusCode === 404 || err?.statusCode === 410) deadIds.push(s.id);
        }
      })
    );

    if (deadIds.length > 0) {
      await supabaseAdmin.from("push_subscriptions").delete().in("id", deadIds);
    }

    await supabaseAdmin.from("push_notifications_log").insert({
      title: data.title,
      body: data.body,
      url: data.url,
      icon: data.icon,
      sent_count: sent,
      failed_count: failed,
      sent_by: context.userId,
    });

    return { sent, failed, total: subs.length };
  });
