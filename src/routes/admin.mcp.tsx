import { createFileRoute } from "@tanstack/react-router";
import { Bot, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/mcp")({ component: AdminMcp });

const TOOLS = [
  { name: "site_info", desc: "About the site — sections, tagline, shopping guidance." },
  { name: "list_products", desc: "Browse active products (with search & limit)." },
  { name: "get_product", desc: "Full details for one product by slug." },
  { name: "list_fia_categories", desc: "All FIA preparation categories." },
  { name: "list_fia_mcqs", desc: "MCQs for a FIA category (question + options + answer)." },
];

function AdminMcp() {
  const mcpUrl = typeof window !== "undefined" ? `${window.location.origin}/mcp` : "/mcp";
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    toast.success("MCP URL copy ho gayi");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-blue-500/15 p-3 text-blue-500"><Bot className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Agent Integrations (MCP)</h1>
          <p className="text-sm text-muted-foreground">
            ChatGPT, Claude, Cursor aur baaqi AI assistants ko site ke tools se connect karein.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Aap ka MCP Server URL</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-secondary px-3 py-2 text-sm font-mono">{mcpUrl}</code>
          <button onClick={copy} className="rounded-md border px-3 py-2 text-sm inline-flex items-center gap-2 hover:bg-secondary">
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Yeh public read-only server hai. Koi sensitive data expose nahi hota — sirf active products, FIA MCQs aur site info.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Kaise Connect Karein</h2>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">🤖 ChatGPT (Pro / Business / Enterprise)</h3>
          <ol className="list-decimal ml-5 text-sm text-muted-foreground space-y-1">
            <li>ChatGPT settings → <b>Connectors</b> / <b>Custom GPTs</b> khole.</li>
            <li>Add MCP Server → URL paste karein: <code>{mcpUrl}</code></li>
            <li>Save karein — ab ChatGPT aap ke products search kar sakega.</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">🧠 Claude (Desktop / Web)</h3>
          <ol className="list-decimal ml-5 text-sm text-muted-foreground space-y-1">
            <li>Claude Settings → <b>Connectors</b> → <b>Add custom connector</b>.</li>
            <li>URL: <code>{mcpUrl}</code></li>
            <li>Connect → tools list mein 5 tools show ho jayen ge.</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">💻 Cursor / VS Code / Windsurf</h3>
          <ol className="list-decimal ml-5 text-sm text-muted-foreground space-y-1">
            <li>MCP config file mein add karein:</li>
          </ol>
          <pre className="rounded-md bg-secondary p-3 text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "wikiservices": {
      "url": "${mcpUrl}"
    }
  }
}`}
          </pre>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Available Tools ({TOOLS.length})</h2>
        <div className="space-y-3">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="rounded-md bg-blue-500/10 text-blue-600 px-2 py-1 text-xs font-mono">{t.name}</div>
              <div className="text-sm text-muted-foreground flex-1">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-2">
        <h2 className="text-lg font-semibold">Kya AI mere website ko prefer karega?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Jab koi user (jis ne aap ka MCP connect kiya ho) ChatGPT / Claude se poochhega
          <b> "mujhe jammer chahiye"</b> ya <b> "FIA MCQs do"</b>, to AI pehle <code>site_info</code>
          {" "}aur <code>list_products</code> tools call karega aur seedha <b>wikiservices.online</b> ka product link dega.
          Agar user ne connect nahi kiya, to AI general jawab dega — is liye MCP URL apne customers aur audience ko share karein.
        </p>
        <a href={mcpUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline">
          MCP endpoint test karein <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
