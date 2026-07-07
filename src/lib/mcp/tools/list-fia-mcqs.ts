import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "list_fia_mcqs",
  title: "List FIA MCQs",
  description: "List multiple choice questions (with options and correct answer) for a FIA preparation category.",
  inputSchema: {
    category_slug: z.string().min(1).describe("Category slug from list_fia_categories."),
    limit: z.number().int().min(1).max(100).optional().describe("Max MCQs (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category_slug, limit }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const { data: cat } = await sb.from("fia_categories").select("id,name,slug").eq("slug", category_slug).maybeSingle();
    if (!cat) return { content: [{ type: "text", text: "Category not found" }], isError: true };
    const { data, error } = await sb
      .from("fia_mcqs")
      .select("id,question,options,correct_answer,explanation")
      .eq("category_id", cat.id)
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify({ category: cat, mcqs: data ?? [] }, null, 2) }],
      structuredContent: { category: cat, mcqs: data ?? [] },
    };
  },
});
