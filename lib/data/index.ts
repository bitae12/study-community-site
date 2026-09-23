import type { DataClient } from "@/lib/data/types";
import { createHttpDataClient } from "@/lib/data/http-client";
import { createMockDataClient } from "@/lib/data/mock-client";
import { createSupabaseDataClient } from "@/lib/data/supabase-data";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

let mockClient: DataClient | null = null;
let supabaseClient: DataClient | null = null;
let httpClient: DataClient | null = null;

export function isSupabaseMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_SUPABASE === "true";
}

export function isPrismaMode(): boolean {
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
