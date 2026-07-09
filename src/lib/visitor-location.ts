import { supabase } from "@/integrations/supabase/client";
import { isPermissionEnabled } from "@/lib/page-permissions";

// Log the visitor's approximate (IP-based, no permission needed) and, if
// admin has enabled Location for the page AND the browser grants it, the
// exact GPS coordinates. Runs once per page path per tab session.

const LOGGED_KEY = "__visitor_loc_logged_v1";

function getLoggedSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(LOGGED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markLogged(page: string) {
  try {
    const s = getLoggedSet();
    s.add(page);
    sessionStorage.setItem(LOGGED_KEY, JSON.stringify(Array.from(s)));
  } catch {}
}

type IpInfo = {
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
};

async function fetchIpInfo(): Promise<IpInfo> {
  // Free, no-auth, CORS-enabled IP geolocation. Falls back silently.
  try {
    const r = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      return {
        ip: j.ip,
        country: j.country_name,
        region: j.region,
        city: j.city,
        lat: typeof j.latitude === "number" ? j.latitude : undefined,
        lon: typeof j.longitude === "number" ? j.longitude : undefined,
        timezone: j.timezone,
        isp: j.org,
      };
    }
  } catch {}
  try {
    const r = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      return {
        ip: j.ip,
        country: j.country,
        region: j.region,
        city: j.city,
        lat: j.latitude,
        lon: j.longitude,
        timezone: j.timezone?.id,
        isp: j.connection?.isp,
      };
    }
  } catch {}
  return {};
}

function getExactPosition(timeoutMs = 8000): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    let done = false;
    const finish = (v: GeolocationPosition | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    navigator.geolocation.getCurrentPosition(
      (pos) => finish(pos),
      () => finish(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
    setTimeout(() => finish(null), timeoutMs + 500);
  });
}

export async function logVisitorLocation(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    const page = window.location.pathname;
    if (getLoggedSet().has(page)) return;
    markLogged(page); // mark early to avoid re-entry on quick nav

    const ipInfo = await fetchIpInfo();

    let exactLat: number | null = null;
    let exactLon: number | null = null;
    let exactAcc: number | null = null;
    let hasExact = false;

    const wantExact = await isPermissionEnabled(page, "location");
    if (wantExact) {
      const pos = await getExactPosition();
      if (pos) {
        exactLat = pos.coords.latitude;
        exactLon = pos.coords.longitude;
        exactAcc = pos.coords.accuracy;
        hasExact = true;
      }
    }

    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("visitor_locations").insert({
      user_id: userData.user?.id ?? null,
      page,
      url: window.location.href,
      referrer: document.referrer || null,
      ip: ipInfo.ip ?? null,
      user_agent: navigator.userAgent,
      approx_country: ipInfo.country ?? null,
      approx_region: ipInfo.region ?? null,
      approx_city: ipInfo.city ?? null,
      approx_lat: ipInfo.lat ?? null,
      approx_lon: ipInfo.lon ?? null,
      approx_timezone: ipInfo.timezone ?? null,
      approx_isp: ipInfo.isp ?? null,
      exact_lat: exactLat,
      exact_lon: exactLon,
      exact_accuracy: exactAcc,
      has_exact: hasExact,
    });
  } catch {
    // silent
  }
}
