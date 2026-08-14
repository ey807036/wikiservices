import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Upload, Play, Square, Download, ShieldCheck } from "lucide-react";
import { checkLimixAccount, type CheckResult } from "@/lib/limix-checker.functions";

export const Route = createFileRoute("/wiki-checker")({
  component: WikiChecker,
  head: () => ({
    meta: [
      { title: "Wiki Checker — Bulk OTP Account Checker" },
      { name: "description", content: "Fast bulk account checker with live results and OTP counts." },
      { property: "og:title", content: "Wiki Checker" },
      { property: "og:description", content: "Bulk OTP account checker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Row = {
  username: string;
  password: string;
  status: "pending" | "checking" | "done";
  result?: CheckResult;
};

function parseCreds(text: string): { username: string; password: string }[] {
  const out: { username: string; password: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([^\s:|,\t]+)\s*[:|,\t]\s*(.+)$/);
    if (!m) continue;
    out.push({ username: m[1].trim(), password: m[2].trim() });
  }
  return out;
}

function WikiChecker() {
  const { data: settings } = useQuery({
    queryKey: ["checker-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("checker_settings").select("*").eq("id", 1).maybeSingle();
      return data as any;
    },
  });

  const check = useServerFn(checkLimixAccount);
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    const total = rows.length;
    const done = rows.filter((r) => r.status === "done").length;
    const ok = rows.filter((r) => r.result?.status === "success").length;
    const fail = rows.filter((r) => r.result?.status === "failed").length;
    const otps = rows.reduce((n, r) => n + (r.result?.otpCount || 0), 0);
    return { total, done, ok, fail, otps };
  }, [rows]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    setText(txt);
    toast.success(`Loaded ${parseCreds(txt).length} accounts`);
  }

  async function start() {
    const creds = parseCreds(text);
    if (!creds.length) {
      toast.error("No valid username:password lines found");
      return;
    }
    if (settings?.enabled === false) {
      toast.error("Checker is disabled by admin");
      return;
    }
    stopRef.current = false;
    setRunning(true);
    const initial: Row[] = creds.map((c) => ({ ...c, status: "pending" }));
    setRows(initial);

    const delay = Number(settings?.delay_ms) || 800;
    const timeoutMs = Number(settings?.timeout_ms) || 25000;
    const baseUrl = settings?.base_url || undefined;

    for (let i = 0; i < creds.length; i++) {
      if (stopRef.current) break;
      setRows((r) => r.map((x, idx) => (idx === i ? { ...x, status: "checking" } : x)));
      try {
        const result = await check({ data: { ...creds[i], baseUrl, timeoutMs } });
        setRows((r) => r.map((x, idx) => (idx === i ? { ...x, status: "done", result } : x)));
      } catch (e: any) {
        setRows((r) =>
          r.map((x, idx) =>
            idx === i
              ? { ...x, status: "done", result: { username: creds[i].username, status: "failed", otpCount: 0, error: e?.message || "Request failed" } }
              : x
          )
        );
      }
      if (i < creds.length - 1 && delay > 0) await new Promise((r) => setTimeout(r, delay));
    }
    setRunning(false);
  }

  function stop() {
    stopRef.current = true;
  }

  function downloadResults() {
    const lines: string[] = [];
    lines.push(`=== Wiki Checker Results ===`);
    lines.push(`Total: ${summary.total}  Success: ${summary.ok}  Failed: ${summary.fail}  Total OTPs: ${summary.otps}`);
    lines.push("");
    for (const r of rows) {
      if (r.result?.status === "success") {
        const apps = (r.result.appBreakdown || []).map((a) => `${a.name}:${a.count}`).join(", ");
        lines.push(`OK  | ${r.username}:${r.password} | OTPs=${r.result.otpCount} | ${r.result.accountType} | ${apps}`);
      } else if (r.result) {
        lines.push(`BAD | ${r.username}:${r.password} | ${r.result.error || "failed"}`);
      } else {
        lines.push(`SKIP | ${r.username}:${r.password}`);
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wiki-checker-results-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/40 py-8">
      <div className="container mx-auto max-w-5xl px-4 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
          {settings?.hero_image_url && (
            <img
              src={settings.hero_image_url}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}
          <div className="relative flex items-center gap-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/15 text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-glow">{settings?.title || "Wiki Checker"}</h1>
              <p className="text-sm text-muted-foreground">{settings?.subtitle || "Bulk OTP account checker"}</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <Card className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept=".txt,text/plain" hidden onChange={onFile} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={running}>
              <Upload className="mr-2 h-4 w-4" /> Upload .txt
            </Button>
            {!running ? (
              <Button onClick={start} disabled={!text.trim()}>
                <Play className="mr-2 h-4 w-4" /> Start check
              </Button>
            ) : (
              <Button variant="destructive" onClick={stop}>
                <Square className="mr-2 h-4 w-4" /> Stop
              </Button>
            )}
            {rows.length > 0 && !running && (
              <Button variant="secondary" onClick={downloadResults}>
                <Download className="mr-2 h-4 w-4" /> Download results
              </Button>
            )}
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Paste one per line, e.g.\nuser1:password1\nuser2:password2"}
            className="min-h-[160px] font-mono text-sm"
            disabled={running}
          />
          <p className="text-xs text-muted-foreground">
            Supported separators: <code>:</code> <code>|</code> <code>,</code> tab. Sequential checks with{" "}
            {settings?.delay_ms ?? 800}ms delay.
          </p>
        </Card>

        {/* Summary */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Total" value={summary.total} />
            <Stat label="Checked" value={summary.done} />
            <Stat label="Success" value={summary.ok} accent="text-emerald-500" />
            <Stat label="Failed" value={summary.fail} accent="text-red-500" />
            <Stat label="OTPs" value={summary.otps} accent="text-primary" />
          </div>
        )}

        {/* Rows */}
        {rows.length > 0 && (
          <Card className="divide-y overflow-hidden">
            {rows.map((r, i) => (
              <div key={`${r.username}-${i}`} className="flex items-start gap-3 p-3 text-sm">
                <div className="mt-0.5">
                  {r.status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {r.status === "pending" && <Loader2 className="h-4 w-4 opacity-30" />}
                  {r.status === "done" && r.result?.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {r.status === "done" && r.result?.status === "failed" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium">{r.username}</span>
                    {r.result?.accountType && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-xs uppercase text-muted-foreground">
                        {r.result.accountType}
                      </span>
                    )}
                    {r.result?.status === "success" && (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        {r.result.otpCount} OTPs
                      </span>
                    )}
                  </div>
                  {r.result?.appBreakdown && r.result.appBreakdown.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.result.appBreakdown.slice(0, 8).map((a, j) => (
                        <span key={j} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {j === 0 && a.count > 0 ? "🔥 " : ""}
                          {a.name}: <b>{a.count}</b>
                        </span>
                      ))}
                    </div>
                  )}
                  {r.result?.status === "failed" && (
                    <div className="mt-0.5 text-xs text-red-500">{r.result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? ""}`}>{value}</div>
    </Card>
  );
}
