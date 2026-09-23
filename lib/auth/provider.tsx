"use client";

import { useContext } from "react";
import { MockAuthProvider, MockAuthContext } from "@/lib/mock-auth";
import { isPrismaMode, isSupabaseMode } from "@/lib/data/index";
import {
  SupabaseAuthProvider,
  SupabaseAuthContext,
} from "@/lib/auth/supabase-provider";
import {
  PrismaAuthProvider,
  PrismaAuthContext,
} from "@/lib/auth/prisma-provider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isSupabaseMode()) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }
  if (isPrismaMode()) {
    return <PrismaAuthProvider>{children}</PrismaAuthProvider>;
  }
  return <MockAuthProvider>{children}</MockAuthProvider>;
}

export function useAuth() {
  const mock = useContext(MockAuthContext);
  const supabase = useContext(SupabaseAuthContext);
  const prisma = useContext(PrismaAuthContext);

  if (isSupabaseMode()) {
    if (!supabase) {
      throw new Error("useAuth must be used within SupabaseAuthProvider");
    }
    return supabase;
  }
  if (isPrismaMode()) {
    if (!prisma) {
      throw new Error("useAuth must be used within PrismaAuthProvider");
    }
    return prisma;
  }
  if (!mock) {
    throw new Error("useAuth must be used within MockAuthProvider");
  }
  return mock;
}
