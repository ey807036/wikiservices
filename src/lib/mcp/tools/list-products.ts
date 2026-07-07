import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "list_products",
  title: "List products",
  description: "List active products from Wikiservices (jammers, hacking devices, gadgets). Optional search by name/description.",
  inputSchema: {
    search: z.string().optional().describe("Optional keyword to search in name/description."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    let q = sb
      .from("products")
      .select("id,name,slug,price,compare_price,short_description,brand,rating,stock,images")
      .eq("active", true)
      .limit(limit ?? 20);
    if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = (data ?? []).map((p) => ({
      ...p,
      url: `https://wikiservices.online/products/${p.slug}`,
      image: p.images?.[0] ?? null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { products: rows },
    };
  },
});
