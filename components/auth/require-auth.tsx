"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/provider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <p className="py-20 text-center text-white/70">세션 확인 중…</p>
    );
  }
  if (!user) return null;
  return children;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    } else if (!loading && user && !isAdmin) {
      router.replace("/");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <p className="py-20 text-center text-white/70">권한 확인 중…</p>
    );
  }
  if (!user || !isAdmin) return null;
  return children;
}
