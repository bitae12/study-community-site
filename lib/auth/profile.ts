import type { Session } from "next-auth";
import type { Profile } from "@/lib/data/types";

export function profileFromSession(session: Session): Profile {
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    displayName: session.user.name ?? "",
    avatarUrl: session.user.image ?? undefined,
    role: session.user.role ?? "user",
    createdAt: new Date().toISOString(),
  };
}
