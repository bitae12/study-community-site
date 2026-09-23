import type { SupabaseClient, User } from "@supabase/supabase-js";

function displayNameFromUser(user: User): string {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (meta.display_name as string | undefined) ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined);
  if (fromMeta?.trim()) return fromMeta.trim();
  const email = user.email ?? "user";
  return email.split("@")[0] ?? "user";
}

function avatarFromUser(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const url =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined);
  return url ?? null;
}

/** Creates public.profiles row when Auth user exists but trigger/RLS left profile missing. */
export async function ensureProfileForUser(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    console.error("[ensureProfile] read failed:", readError.message);
    return;
  }
  if (existing) return;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    display_name: displayNameFromUser(user),
    avatar_url: avatarFromUser(user),
    role: "user",
  });

  if (insertError && insertError.code !== "23505") {
    console.error("[ensureProfile] insert failed:", insertError.message);
  }
}
