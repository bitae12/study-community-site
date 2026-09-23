"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Profile } from "@/lib/data/types";
import { createClient } from "@/lib/supabase/client";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  isAdmin: boolean;
}

export const SupabaseAuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    avatarUrl: data.avatar_url ?? undefined,
    role: data.role,
    createdAt: data.created_at,
  };
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    let profile = await fetchProfile(supabase, sessionUser.id);
    if (!profile) {
      await ensureProfileForUser(supabase, sessionUser);
      profile = await fetchProfile(supabase, sessionUser.id);
    }
    setUser(profile);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncSession();
    });
    void (async () => {
      await syncSession();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, syncSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw new Error(error.message);
      await syncSession();
    },
    [supabase, syncSession]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: displayName.trim() || email.split("@")[0] },
        },
      });
      if (error) throw new Error(error.message);
      await syncSession();
    },
    [supabase, syncSession]
  );

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
    if (data.url) {
      window.location.assign(data.url);
    }
  }, [supabase]);

  const signOut = useCallback(() => {
    void supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut]
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return ctx;
}
