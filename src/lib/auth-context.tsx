import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const ADMIN_EMAIL_FALLBACK = new Set([
      "admin@wikiservices.pk",
      "haki84226@gmail.com",
    ]);

    const loadAdminRole = (s: Session | null) => {
      if (!s?.user) {
        setIsAdmin(false);
        return;
      }
      // Immediate email-based fallback so admin UI shows without waiting on DB
      const email = s.user.email?.toLowerCase() ?? "";
      if (ADMIN_EMAIL_FALLBACK.has(email)) setIsAdmin(true);
      setTimeout(async () => {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", s.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (alive && data) setIsAdmin(true);
      }, 0);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
      loadAdminRole(s);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      setSession(session);
      loadAdminRole(session);
      setLoading(false);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAdmin,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
