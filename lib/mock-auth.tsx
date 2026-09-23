"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Profile } from "@/lib/data/types";
import { MOCK_PASSWORD, SEED_PROFILES } from "@/lib/mock/seed";
import { loadStore, saveStore } from "@/lib/mock/storage";

const SESSION_KEY = "rabbit-community-session";

interface MockAuthContextValue {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  isAdmin: boolean;
}

export const MockAuthContext = createContext<MockAuthContextValue | null>(null);

function readSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

function writeSessionId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
}

function readInitialUser(): Profile | null {
  if (typeof window === "undefined") return null;
  const id = readSessionId();
  if (!id) return null;
  const store = loadStore();
  return store.profiles.find((p) => p.id === id) ?? null;
}

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(readInitialUser);
  const [loading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const store = loadStore();
    const profile = store.profiles.find(
      (p) => p.email.toLowerCase() === normalized
    );
    if (!profile) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    const expected = store.credentials[normalized];
    if (!expected || expected !== password) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    writeSessionId(profile.id);
    setUser(profile);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (password.length < 6) {
        throw new Error("비밀번호는 6자 이상이어야 합니다.");
      }
      const normalized = email.trim().toLowerCase();
      const store = loadStore();
      if (store.profiles.some((p) => p.email.toLowerCase() === normalized)) {
        throw new Error("이미 가입된 이메일입니다.");
      }
      const profile: Profile = {
        id: `profile-${crypto.randomUUID()}`,
        email: normalized,
        displayName: displayName.trim() || normalized.split("@")[0],
        role: "user",
        createdAt: new Date().toISOString(),
      };
      store.profiles.push(profile);
      store.credentials[normalized] = password;
      saveStore(store);
      writeSessionId(profile.id);
      setUser(profile);
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const store = loadStore();
    let profile = store.profiles.find((p) => p.id === "profile-google-1");
    if (!profile) {
      profile = SEED_PROFILES.find((p) => p.id === "profile-google-1")!;
      store.profiles.push(profile);
      saveStore(store);
    }
    writeSessionId(profile.id);
    setUser(profile);
  }, []);

  const signOut = useCallback(() => {
    writeSessionId(null);
    setUser(null);
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
    <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider");
  return ctx;
}

export { MOCK_PASSWORD };
