function stripWrappingQuotes(value: string): string {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1).trim();
  }
  return v;
}

export function getSupabaseUrl(): string {
  const url = stripWrappingQuotes(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }
  return url.replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  const key = stripWrappingQuotes(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
  }
  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "Do not use the Supabase secret key in NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return key;
}
