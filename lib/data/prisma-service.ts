import type {
  CreateCategoryInput,
  CreatePostInput,
  ListPostsFilters,
  Role,
  UpdateCategoryInput,
  UpdatePostInput,
} from "@/lib/data/types";
import { toCategory, toPost, toProfile } from "@/lib/data/mappers";
import { prisma } from "@/lib/prisma";

export async function listPosts(filters?: ListPostsFilters) {
  const posts = await prisma.post.findMany({
    where: filters?.categorySlug
      ? { category: { slug: filters.categorySlug } }
      : undefined,
    include: { author: true, category: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
  return posts.map((p) => ({
    ...toPost(p),
    author: toProfile(p.author),
    category: toCategory(p.category),
  }));
}

export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true, category: true },
  });
  if (!post) return null;
  return {
    ...toPost(post),
    author: toProfile(post.author),
    category: toCategory(post.category),
  };
}

export async function createPost(
  authorId: string,
  actorRole: Role,
  input: CreatePostInput
) {
  const post = await prisma.post.create({
    data: {
      authorId,
      categoryId: input.categoryId,
      title: input.title.trim(),
      body: input.body.trim(),
      isPinned:
        actorRole === "admin" && input.isPinned ? true : false,
    },
  });
  return toPost(post);
}

export async function updatePost(
  id: string,
  actorId: string,
  actorRole: Role,
  input: UpdatePostInput
) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.authorId !== actorId && actorRole !== "admin") {
    throw new Error("FORBIDDEN");
  }
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: input.title?.trim(),
      body: input.body?.trim(),
      categoryId: input.categoryId,
      isPinned:
        actorRole === "admin" && input.isPinned !== undefined
          ? input.isPinned
          : undefined,
    },
  });
  return toPost(post);
}

export async function deletePost(
  id: string,
  actorId: string,
  actorRole: Role
) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.authorId !== actorId && actorRole !== "admin") {
    throw new Error("FORBIDDEN");
  }
  await prisma.post.delete({ where: { id } });
}

export async function listCategories() {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toCategory);
}

export async function createCategory(input: CreateCategoryInput) {
  const row = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return toCategory(row);
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const row = await prisma.category.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      slug: input.slug?.trim(),
      sortOrder: input.sortOrder,
    },
  });
  return toCategory(row);
}

export async function deleteCategory(id: string) {
  const count = await prisma.post.count({ where: { categoryId: id } });
  if (count > 0) throw new Error("CATEGORY_IN_USE");
  await prisma.category.delete({ where: { id } });
}

export async function listProfiles() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(toProfile);
}

export async function updateProfileRole(id: string, role: Role) {
  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });
  return toProfile(user);
}

