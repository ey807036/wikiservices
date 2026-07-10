import { supabase } from "@/integrations/supabase/client";

export type PermKind = "camera" | "microphone" | "notifications" | "location" | "gallery";

export type PagePermRow = {
  page: string;
  label: string | null;
  camera: boolean;
  microphone: boolean;
  notifications: boolean;
  location: boolean;
  gallery: boolean;
  gallery_photo_limit: number;
  gallery_audio_seconds: number;
  updated_at?: string;
};

const CACHE_KEY = "__page_perm_cache_v1";
let memCache: Record<string, PagePermRow> | null = null;
let loadingPromise: Promise<Record<string, PagePermRow>> | null = null;

function readLocal(): Record<string, PagePermRow> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(map: Record<string, PagePermRow>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {}
}

export async function loadPagePermissions(force = false): Promise<Record<string, PagePermRow>> {
  if (!force && memCache) return memCache;
  if (!force) {
    const local = readLocal();
    if (local) memCache = local;
  }
  if (loadingPromise && !force) return loadingPromise;
  loadingPromise = (async () => {
    const { data, error } = await supabase.from("page_permission_settings").select("*");
    if (error || !data) return memCache ?? {};
    const map: Record<string, PagePermRow> = {};
    for (const r of data as PagePermRow[]) map[r.page] = r;
    memCache = map;
    writeLocal(map);
    return map;
  })();
  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

/**
 * Check if a permission kind is enabled for a given page path.
 * Matching order:
 *   1. Exact page match
 *   2. Longest prefix match (e.g. "/admin" matches "/admin/foo")
 *   3. Global "*" row
 *   4. Default false
 */
export async function isPermissionEnabled(page: string, kind: PermKind): Promise<boolean> {
  const map = await loadPagePermissions();
  if (map[page]) return !!map[page][kind];
  const prefixes = Object.keys(map)
    .filter((k) => k !== "*" && k.length > 1 && page.startsWith(k))
    .sort((a, b) => b.length - a.length);
  if (prefixes.length && map[prefixes[0]]) return !!map[prefixes[0]][kind];
  if (map["*"]) return !!map["*"][kind];
  return false;
}

export function isPermissionEnabledSync(page: string, kind: PermKind): boolean | null {
  const map = memCache ?? readLocal();
  if (!map) return null;
  if (map[page]) return !!map[page][kind];
  const prefixes = Object.keys(map)
    .filter((k) => k !== "*" && k.length > 1 && page.startsWith(k))
    .sort((a, b) => b.length - a.length);
  if (prefixes.length && map[prefixes[0]]) return !!map[prefixes[0]][kind];
  if (map["*"]) return !!map["*"][kind];
  return false;
}

export function clearPagePermissionsCache() {
  memCache = null;
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
  }
}
