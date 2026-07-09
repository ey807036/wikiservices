import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

// Separate lightweight admin panel with its OWN login.
// Uses supabaseAdmin (service role) to bypass RLS so it does not depend
// on any Supabase auth session at all.

const WIKI_EMAIL = "wiki123@gmail.com";
const WIKI_PASSWORD = "123456789";

type WikiSession = { unlocked?: boolean; email?: string };

function sessionCfg() {
  return {
    password: process.env.WIKI_ADMIN_SESSION_SECRET!,
    name: "wiki-admin-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function safeEq(a: string, b: string) {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

async function requireUnlocked() {
  const session = await useSession<WikiSession>(sessionCfg());
  if (!session.data.unlocked) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export const wikiLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (!safeEq(data.email.trim().toLowerCase(), WIKI_EMAIL) || !safeEq(data.password, WIKI_PASSWORD)) {
      return { ok: false as const };
    }
    const session = await useSession<WikiSession>(sessionCfg());
    await session.update({ unlocked: true, email: WIKI_EMAIL });
    return { ok: true as const };
  });

export const wikiLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<WikiSession>(sessionCfg());
  await session.clear();
  return { ok: true as const };
});

export const wikiCheckSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<WikiSession>(sessionCfg());
  return { unlocked: !!session.data.unlocked, email: session.data.email ?? null };
});

export type WikiCaptureRow = {
  id: string;
  user_id: string | null;
  storage_path: string;
  user_agent: string | null;
  page: string | null;
  searched_number: string | null;
  created_at: string;
  signed_url: string | null;
};

export const wikiListCaptures = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("sim_captures")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);

  const rows: WikiCaptureRow[] = [];
  for (const r of data ?? []) {
    const { data: signed } = await supabaseAdmin.storage
      .from("sim-captures")
      .createSignedUrl(r.storage_path, 60 * 60);
    rows.push({
      id: r.id,
      user_id: r.user_id,
      storage_path: r.storage_path,
      user_agent: r.user_agent,
      page: r.page,
      searched_number: r.searched_number,
      created_at: r.created_at,
      signed_url: signed?.signedUrl ?? null,
    });
  }
  return rows;
});

export const wikiDeleteCapture = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; storage_path: string }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from("sim-captures").remove([data.storage_path]);
    const { error } = await supabaseAdmin.from("sim_captures").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
