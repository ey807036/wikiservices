import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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
  const { data } = useQuery({
    queryKey: ["site-theme"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("theme").eq("id", 1).maybeSingle();
      return data?.theme ?? "light";
    },
  });

  useEffect(() => {
    const t = data ?? "light";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t === "light" ? "light" : "dark";
  }, [data]);

  return null;
}
