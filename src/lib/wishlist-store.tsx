import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

type Ctx = {
  ids: Set<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  count: number;
};

const C = createContext<Ctx>({} as Ctx);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
    setIds(new Set((data ?? []).map((r) => r.product_id as string)));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (id: string) => {
    if (!user) return;
    if (ids.has(id)) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", id);
      setIds((s) => { const n = new Set(s); n.delete(id); return n; });
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: id });
      setIds((s) => new Set(s).add(id));
    }
  };

  return <C.Provider value={{ ids, has: (id) => ids.has(id), toggle, count: ids.size }}>{children}</C.Provider>;
}

export const useWishlist = () => useContext(C);
