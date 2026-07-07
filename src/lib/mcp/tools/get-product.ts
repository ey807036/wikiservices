import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description: "Get full details for a single product by slug.",
  inputSchema: {
    slug: z.string().min(1).describe("Product slug (from list_products)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const { data, error } = await sb
      .from("products")
      .select("id,name,slug,price,compare_price,description,short_description,brand,rating,review_count,stock,images,video_url,featured,trending")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Product not found" }], isError: true };
    const product = { ...data, url: `https://wikiservices.online/products/${data.slug}` };
    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
