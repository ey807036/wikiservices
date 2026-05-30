import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const THEMES = [
  { id: "matrix", label: "Matrix Green (Dark)" },
  { id: "light", label: "Clean Light" },
  { id: "cyber", label: "Cyber Blue" },
  { id: "amber", label: "Amber Terminal" },
  { id: "purple", label: "Neon Purple" },
  { id: "mono", label: "Mono White on Black" },
] as const;

export function ThemeProvider() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useQuery({
    queryKey: ["site-theme"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("theme, store1_theme, store2_theme")
        .eq("id", 1)
        .maybeSingle();
      return data as any;
    },
  });

  useEffect(() => {
    const fallback = data?.theme ?? "matrix";
    // Store 2 = /store routes. Everything else = Store 1.
    const isStore2 = path.startsWith("/store");
    const t = (isStore2 ? data?.store2_theme : data?.store1_theme) ?? fallback;
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t === "light" ? "light" : "dark";
  }, [data, path]);

  return null;
}
