import type { DataClient } from "@/lib/data/types";
import { createHttpDataClient } from "@/lib/data/http-client";
import { createMockDataClient } from "@/lib/data/mock-client";
import { createSupabaseDataClient } from "@/lib/data/supabase-data";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

let mockClient: DataClient | null = null;
let supabaseClient: DataClient | null = null;
let httpClient: DataClient | null = null;

function hasSupabasePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Supabase Auth + DB (production on Vercel). */
export function isSupabaseMode(): boolean {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_SUPABASE === "false") return false;
  // Vercel: use Supabase when keys are set even if USE_SUPABASE flag was omitted
  if (process.env.VERCEL === "1" && hasSupabasePublicConfig()) return true;
  return false;
}

/** Local SQLite + Auth.js — not used on Vercel (no persistent disk). */
export function isPrismaMode(): boolean {
  if (isSupabaseMode()) return false;
  if (process.env.VERCEL === "1") return false;
  return process.env.NEXT_PUBLIC_USE_PRISMA === "true";
}

export function getDataClient(): DataClient {
  if (isSupabaseMode()) {
    if (typeof window === "undefined") {
      throw new Error("getDataClient() with Supabase must run on the client.");
    }
    if (!supabaseClient) {
      supabaseClient = createSupabaseDataClient(createBrowserSupabase());
    }
    return supabaseClient;
  }

  if (isPrismaMode()) {
    if (typeof window === "undefined") {
      throw new Error("getDataClient() with Prisma must run on the client.");
    }
    if (!httpClient) httpClient = createHttpDataClient();
    return httpClient;
  }

  if (typeof window === "undefined") {
    return createMockDataClient();
  }
  if (!mockClient) mockClient = createMockDataClient();
  return mockClient;
}
