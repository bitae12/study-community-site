"use client";

import type { Category, Post, Profile } from "@/lib/data/types";
import {
  SEED_CATEGORIES,
  SEED_CREDENTIALS,
  SEED_POSTS,
  SEED_PROFILES,
} from "@/lib/mock/seed";

const STORAGE_KEY = "rabbit-community-v1";

export interface MockStore {
  profiles: Profile[];
  categories: Category[];
  posts: Post[];
  credentials: Record<string, string>;
}

function readStore(): MockStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockStore;
  } catch {
    return null;
  }
}

export function getDefaultStore(): MockStore {
  return {
    profiles: structuredClone(SEED_PROFILES),
    categories: structuredClone(SEED_CATEGORIES),
    posts: structuredClone(SEED_POSTS),
    credentials: { ...SEED_CREDENTIALS },
  };
}

export function loadStore(): MockStore {
  const store = readStore() ?? getDefaultStore();
  if (!store.credentials) {
    store.credentials = { ...SEED_CREDENTIALS };
  }
  return store;
}

export function saveStore(store: MockStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function resetStore(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
