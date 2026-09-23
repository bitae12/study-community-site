import type { Category, Post, Profile, Role } from "@/lib/data/types";
import type { Category as DbCategory, Post as DbPost, User } from "@prisma/client";

export function toProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.name,
    avatarUrl: user.image ?? undefined,
    role: user.role as Role,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sortOrder,
  };
}

export function toPost(row: DbPost): Post {
  return {
    id: row.id,
    authorId: row.authorId,
    categoryId: row.categoryId,
    title: row.title,
    body: row.body,
    isPinned: row.isPinned,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
