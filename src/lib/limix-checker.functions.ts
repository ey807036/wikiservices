import { createServerFn } from "@tanstack/react-start";

// --- Types ---
export type AppStat = { name: string; count: number };
export type CheckResult = {
  username: string;
  status: "success" | "failed";
  otpCount: number;
  accountType?: "agent" | "client";
  appBreakdown?: AppStat[];
  failureStage?: string;
  error?: string;
};

// --- Cookie jar ---
type Jar = Map<string, string>;
function updateJarFromResponse(jar: Jar, res: Response) {
  // getSetCookie() available in undici / workers
  const cookies: string[] =
    // @ts-ignore
    typeof res.headers.getSetCookie === "function"
      ? // @ts-ignore
        res.headers.getSetCookie()
      : (res.headers.get("set-cookie") || "").split(/,(?=\s*[A-Za-z0-9_-]+=)/).filter(Boolean);
  for (const c of cookies) {
    const first = c.split(";")[0];
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    if (!name) continue;
    if (value === "" || value === "deleted") jar.delete(name);
    else jar.set(name, value);
  }
}
function cookieHeader(jar: Jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

// --- Fetch with jar + manual redirect (max 5 hops) ---
async function jarFetch(jar: Jar, url: string, init: RequestInit & { referer?: string } = {}): Promise<{ res: Response; finalUrl: string; body: string }> {
  let current = url;
  let method = init.method || "GET";
  let body = init.body as any;
  const baseHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.referer) baseHeaders["Referer"] = init.referer;

  for (let hop = 0; hop < 6; hop++) {
    const cookie = cookieHeader(jar);
    const headers: Record<string, string> = { ...baseHeaders };
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(current, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : body,
      redirect: "manual",
    });
    updateJarFromResponse(jar, res);

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) {
        const text = await res.text();
        return { res, finalUrl: current, body: text };
      }
      const next = new URL(loc, current).toString();
      // After POST redirect, switch to GET (except 307/308)
      if (method !== "GET" && res.status !== 307 && res.status !== 308) {
        method = "GET";
        body = undefined;
        delete baseHeaders["Content-Type"];
      }
      current = next;
      continue;
    }
    const text = await res.text();
    return { res, finalUrl: current, body: text };
  }
  throw new Error("Too many redirects");
}

// --- Parsing helpers ---
function solveMath(s: string): string | null {
  const m = s.match(/(\d+)\s*([+\-])\s*(\d+)/);
  if (!m) return null;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[3], 10);
  return String(m[2] === "+" ? a + b : a - b);
}

function extractEtkk(html: string): string | null {
  const m = html.match(/name=["']etkk["'][^>]*value=["']([^"']*)["']/i)
    || html.match(/value=["']([^"']*)["'][^>]*name=["']etkk["']/i);
  return m?.[1] ?? null;
}

function extractCaptcha(html: string): string {
  const stripped = html.replace(/<[^>]+>/g, " ");
  const m = stripped.match(/What is\s+\d+\s*[+\-]\s*\d+\s*=\s*\?/i);
  return m?.[0] || "";
}

function extractAjaxSource(html: string): string | null {
  const m = html.match(/sAjaxSource\s*"?\s*:\s*"([^"]*data_smscdr\.php[^"]*)"/i);
  if (!m?.[1]) return null;
  return m[1].replaceAll("\\/", "/").replaceAll("\\u0026", "&").replaceAll("&amp;", "&");
}

function stripTags(s: string): string {
  return String(s ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function extractDataTablesCount(data: any): number {
  const rows = data?.aaData ?? data?.data ?? (Array.isArray(data) ? data : []);
  if (!Array.isArray(rows)) {
    const disp = Number(data?.iTotalDisplayRecords);
    if (Number.isFinite(disp)) return Math.max(0, Math.trunc(disp));
    const tot = Number(data?.iTotalRecords);
    if (Number.isFinite(tot)) return Math.max(0, Math.trunc(tot));
    return 0;
  }
  const valid = rows.filter((row: unknown) => {
    if (!Array.isArray(row)) return true;
    const vals = row.map((c) => String(c ?? "").trim());
    if (!vals.length) return false;
    if (vals.every((c) => c === "" || /^0([,0])*$/.test(c) || /^no matching records/i.test(c))) return false;
    return true;
  });
  if (valid.length) return valid.length;
  const disp = Number(data?.iTotalDisplayRecords);
  if (Number.isFinite(disp) && disp > 0) return Math.trunc(disp);
  const tot = Number(data?.iTotalRecords);
  if (Number.isFinite(tot) && tot > 0) return Math.trunc(tot);
  return 0;
}

function sanitizeTemplate(msg: string): string {
  return msg
    .replace(/https?:\/\/\S+/gi, "{URL}")
    .replace(/\b\d{4,8}\b/g, "{OTP}")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "{NUMBER}")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function identifyApp(rowText: string, sms: string): string {
  const c = `${rowText} ${sms}`;
  const map: [RegExp, string][] = [
    [/whatsapp|wa\.me/i, "WhatsApp"],
    [/telegram|t\.me/i, "Telegram"],
    [/google|g-[0-9]/i, "Google"],
    [/facebook|\bfb\b/i, "Facebook"],
    [/instagram/i, "Instagram"],
    [/tiktok/i, "TikTok"],
    [/discord/i, "Discord"],
    [/twitter|x\.com/i, "Twitter/X"],
    [/amazon/i, "Amazon"],
    [/netflix/i, "Netflix"],
    [/uber/i, "Uber"],
    [/imo/i, "Imo"],
    [/viber/i, "Viber"],
    [/snapchat/i, "Snapchat"],
  ];
  for (const [re, name] of map) if (re.test(c)) return name;
  const tpl = sanitizeTemplate(sms);
  if (tpl) return `SMS: ${tpl}`;
  return "SMS";
}

export function analyzeApps(rows: any[]): AppStat[] {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const vals = row.map((c) => stripTags(String(c ?? "")));
    if (vals.every((c) => c === "" || /^0([,0])*$/.test(c) || /^no matching records/i.test(c))) continue;
    // Best guess SMS body = longest cell
    const sms = [...vals].sort((a, b) => b.length - a.length)[0] || "";
    const app = identifyApp(vals.join(" "), sms);
    counts[app] = (counts[app] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// --- Core check for one account ---
async function checkOne(username: string, password: string, baseUrl: string, timeoutMs: number): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const jar: Jar = new Map();
  let stage = "login_get";
  try {
    // Wrap fetch aborts into our jarFetch by monkey-patching? Simpler: rely on network default,
    // and enforce overall timeout via Promise.race below in caller. Keep controller for future use.
    void controller;

    const login = await jarFetch(jar, `${baseUrl}/login`);
    const captcha = extractCaptcha(login.body);
    stage = "signin_post";
    const answer = solveMath(captcha);
    const etkk = extractEtkk(login.body);
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);
    if (answer) form.set("capt", answer);
    if (etkk) form.set("etkk", etkk);

    const signin = await jarFetch(jar, `${baseUrl}/signin`, {
      method: "POST",
      body: form.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      referer: `${baseUrl}/login`,
    });

    let accountType: "agent" | "client" | null =
      signin.finalUrl.includes("/client/") ? "client"
      : signin.finalUrl.includes("/agent/") ? "agent"
      : null;

    if (!accountType) {
      if (signin.body.includes("/client/")) accountType = "client";
      else if (signin.body.includes("/agent/")) accountType = "agent";
    }

    if (!accountType) {
      try {
        const ag = await jarFetch(jar, `${baseUrl}/agent/SMSDashboard`);
        if (ag.res.status === 200 && !/name=["']username["']/i.test(ag.body)) accountType = "agent";
      } catch {}
    }
    if (!accountType) {
      try {
        const cl = await jarFetch(jar, `${baseUrl}/client/SMSDashboard`);
        if (cl.res.status === 200 && !/name=["']username["']/i.test(cl.body)) accountType = "client";
      } catch {}
    }
    if (!accountType) {
      return { username, status: "failed", otpCount: 0, failureStage: "role_classify", error: "Invalid credentials or login failed" };
    }

    stage = "stats_get";
    const statsUrl = `${baseUrl}/${accountType}/SMSCDRStats`;
    const stats = await jarFetch(jar, statsUrl, { referer: `${baseUrl}/${accountType}/SMSDashboard` });
    if (stats.finalUrl.includes("/login") || /name=["']username["']/i.test(stats.body)) {
      return { username, status: "failed", otpCount: 0, accountType, failureStage: "stats_auth_reject", error: "Session rejected by panel" };
    }

    let otpCount = 0;
    let apps: AppStat[] = [];
    const ajax = extractAjaxSource(stats.body);
    if (ajax) {
      stage = "ajax_fetch";
      try {
        const dataUrl = new URL(ajax, statsUrl).toString();
        const cdr = await jarFetch(jar, dataUrl, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
          referer: statsUrl,
        });
        try {
          const json = JSON.parse(cdr.body);
          otpCount = extractDataTablesCount(json);
          const rows = json.aaData || json.data || [];
          apps = Array.isArray(rows) ? analyzeApps(rows) : [];
        } catch {}
      } catch {}
    }

    return { username, status: "success", otpCount, accountType, appBreakdown: apps };
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Panel request timed out" : e?.message || "Connection error";
    return { username, status: "failed", otpCount: 0, failureStage: stage, error: `${stage}: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

// --- Server fn ---
export const checkLimixAccount = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string; baseUrl?: string; timeoutMs?: number }) => data)
  .handler(async ({ data }) => {
    const baseUrl = (data.baseUrl || "http://51.210.208.26/ints").replace(/\/$/, "");
    const timeoutMs = Math.min(Math.max(Number(data.timeoutMs) || 25000, 5000), 60000);
    const username = String(data.username || "").trim();
    const password = String(data.password || "");
    if (!username || !password) {
      return { username, status: "failed" as const, otpCount: 0, error: "Missing credentials" };
    }
    // Overall guard: race against timeoutMs+2s
    return await Promise.race<CheckResult>([
      checkOne(username, password, baseUrl, timeoutMs),
      new Promise<CheckResult>((resolve) =>
        setTimeout(() => resolve({ username, status: "failed", otpCount: 0, error: "Account check timed out" }), timeoutMs + 3000)
      ),
    ]);
  });
