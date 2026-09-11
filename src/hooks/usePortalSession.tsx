import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ClientProfile {
  full_name: string;
  company: string | null;
  phone: string | null;
}

interface PortalSessionValue {
  session: Session | null;
  user: User | null;
  profile: ClientProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const PortalSessionContext = createContext<PortalSessionValue | undefined>(undefined);

export function PortalSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Register the listener first, then read the current session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      if (!next) setProfile(null);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    supabase
      .from("client_profiles")
      .select("full_name, company, phone")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? null);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const value: PortalSessionValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <PortalSessionContext.Provider value={value}>{children}</PortalSessionContext.Provider>;
}

export function usePortalSession() {
  const ctx = useContext(PortalSessionContext);
  if (!ctx) throw new Error("usePortalSession must be used within PortalSessionProvider");
  return ctx;
}
