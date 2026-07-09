import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Trash2, RefreshCw, ExternalLink, Crosshair, Globe } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/visitor-locations")({ component: AdminVisitorLocations });

type Row = {
  id: string;
  user_id: string | null;
  page: string;
  url: string | null;
  referrer: string | null;
  ip: string | null;
  user_agent: string | null;
  approx_country: string | null;
  approx_region: string | null;
  approx_city: string | null;
  approx_lat: number | null;
  approx_lon: number | null;
  approx_timezone: string | null;
  approx_isp: string | null;
  exact_lat: number | null;
  exact_lon: number | null;
  exact_accuracy: number | null;
  has_exact: boolean;
  created_at: string;
};

function AdminVisitorLocations() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["visitor-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_locations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 20000,
  });

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("visitor_locations").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["visitor-locations"] });
  }

  async function clearAll() {
    if (!confirm("Delete ALL visitor location logs?")) return;
    const { error } = await supabase.from("visitor_locations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) { toast.error(error.message); return; }
    toast.success("All cleared");
    qc.invalidateQueries({ queryKey: ["visitor-locations"] });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/15 p-3 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Visitor Locations</h1>
            <p className="text-sm text-muted-foreground">
              Har visit ki approximate location (IP se, bina permission) + agar page par Location permission ON ho to exact GPS location.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="destructive" onClick={clearAll}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear all
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Koi visit log nahi hai abhi tak.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => {
            const approxStr = [r.approx_city, r.approx_region, r.approx_country].filter(Boolean).join(", ") || "Unknown";
            const approxMap = r.approx_lat != null && r.approx_lon != null
              ? `https://www.google.com/maps?q=${r.approx_lat},${r.approx_lon}` : null;
            const exactMap = r.exact_lat != null && r.exact_lon != null
              ? `https://www.google.com/maps?q=${r.exact_lat},${r.exact_lon}` : null;
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">{r.page}</span>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                      {r.has_exact && (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-500">
                          <Crosshair className="mr-1 inline h-3 w-3" /> Exact GPS
                        </span>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-muted-foreground">
                          <Globe className="h-3 w-3" /> Approx (IP)
                        </div>
                        <div className="font-medium">{approxStr}</div>
                        {r.approx_isp && <div className="text-xs text-muted-foreground">ISP: {r.approx_isp}</div>}
                        {r.approx_timezone && <div className="text-xs text-muted-foreground">TZ: {r.approx_timezone}</div>}
                        {r.ip && <div className="text-xs text-muted-foreground">IP: {r.ip}</div>}
                        {approxMap && (
                          <a href={approxMap} target="_blank" rel="noreferrer"
                             className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            View on map <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="rounded-lg border p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-muted-foreground">
                          <Crosshair className="h-3 w-3" /> Exact (GPS)
                        </div>
                        {r.has_exact && exactMap ? (
                          <>
                            <div className="font-medium">
                              {r.exact_lat?.toFixed(6)}, {r.exact_lon?.toFixed(6)}
                            </div>
                            {r.exact_accuracy != null && (
                              <div className="text-xs text-muted-foreground">±{Math.round(r.exact_accuracy)} m accuracy</div>
                            )}
                            <a href={exactMap} target="_blank" rel="noreferrer"
                               className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              View on map <ExternalLink className="h-3 w-3" />
                            </a>
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">Not granted / disabled for this page.</div>
                        )}
                      </div>
                    </div>

                    {r.referrer && (
                      <div className="truncate text-xs text-muted-foreground">Referrer: {r.referrer}</div>
                    )}
                    {r.user_agent && (
                      <div className="truncate text-xs text-muted-foreground">UA: {r.user_agent}</div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
