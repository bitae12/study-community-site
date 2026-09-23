"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  SessionProvider,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  useSession,
} from "next-auth/react";
import type { Profile } from "@/lib/data/types";
import { profileFromSession } from "@/lib/auth/profile";
import type { Session } from "next-auth";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  isAdmin: boolean;
}

export const PrismaAuthContext = createContext<AuthContextValue | null>(null);

function PrismaAuthInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const user = session?.user?.id
    ? profileFromSession(session as Session)
    : null;

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "가입에 실패했습니다.");
      }
      await signIn(email, password);
    },
    [signIn]
  );

  const signInWithGoogle = useCallback(async () => {
    await nextAuthSignIn("google", { callbackUrl: "/" });
  }, []);

  const signOut = useCallback(() => {
    void nextAuthSignOut({ callbackUrl: "/" });
  }, []);

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
    <PrismaAuthContext.Provider value={value}>{children}</PrismaAuthContext.Provider>
  );
}

export function PrismaAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PrismaAuthInner>{children}</PrismaAuthInner>
    </SessionProvider>
  );
}

export function usePrismaAuth() {
  const ctx = useContext(PrismaAuthContext);
  if (!ctx) throw new Error("usePrismaAuth must be used within PrismaAuthProvider");
  return ctx;
}
