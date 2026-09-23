import { auth } from "@/auth";
import type { Profile } from "@/lib/data/types";
import { toProfile } from "@/lib/data/mappers";
import { prisma } from "@/lib/prisma";

export async function getSessionProfile(): Promise<Profile | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;
  return toProfile(user);
}

export async function requireSessionProfile(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("UNAUTHORIZED");
  return profile;
}
