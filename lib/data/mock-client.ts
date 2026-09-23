"use client";

import type {
  CreateCategoryInput,
  CreatePostInput,
  DataClient,
  ListPostsFilters,
  Post,
  PostWithMeta,
  Role,
  UpdateCategoryInput,
  UpdatePostInput,
} from "@/lib/data/types";
import { getDefaultStore, loadStore, saveStore } from "@/lib/mock/storage";

function enrichPosts(store: ReturnType<typeof loadStore>): PostWithMeta[] {
  return store.posts.map((post) => ({
    ...post,
    author: store.profiles.find((p) => p.id === post.authorId),
    category: store.categories.find((c) => c.id === post.categoryId),
  }));
}

function sortPosts(posts: PostWithMeta[]): PostWithMeta[] {
  return [...posts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function canEditPost(
  post: Post,
  actorId: string,
  actorRole: Role
): boolean {
  return post.authorId === actorId || actorRole === "admin";
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createMockDataClient(): DataClient {
  return {
    async listPosts(filters?: ListPostsFilters) {
      const store = loadStore();
      let posts = enrichPosts(store);
      if (filters?.categorySlug) {
        posts = posts.filter((p) => p.category?.slug === filters.categorySlug);
      }
      return sortPosts(posts);
    },

    async getPost(id: string) {
      const store = loadStore();
      const post = store.posts.find((p) => p.id === id);
      if (!post) return null;
      return enrichPosts(store).find((p) => p.id === id) ?? null;
    },

    async createPost(authorId: string, input: CreatePostInput) {
      const store = loadStore();
      const now = new Date().toISOString();
      const post: Post = {
        id: newId("post"),
        authorId,
        categoryId: input.categoryId,
        title: input.title.trim(),
        body: input.body.trim(),
        isPinned: input.isPinned ?? false,
        createdAt: now,
        updatedAt: now,
      };
      store.posts.push(post);
      saveStore(store);
      return post;
    },

    async updatePost(
      id: string,
      actorId: string,
      actorRole: Role,
      input: UpdatePostInput
    ) {
      const store = loadStore();
      const index = store.posts.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("글을 찾을 수 없습니다.");
      const current = store.posts[index];
      if (!canEditPost(current, actorId, actorRole)) {
        throw new Error("수정 권한이 없습니다.");
      }
      const updated: Post = {
        ...current,
        title: input.title?.trim() ?? current.title,
        body: input.body?.trim() ?? current.body,
        categoryId: input.categoryId ?? current.categoryId,
        isPinned:
          actorRole === "admin" && input.isPinned !== undefined
            ? input.isPinned
            : current.isPinned,
        updatedAt: new Date().toISOString(),
      };
      store.posts[index] = updated;
      saveStore(store);
      return updated;
    },

    async deletePost(id: string, actorId: string, actorRole: Role) {
      const store = loadStore();
      const post = store.posts.find((p) => p.id === id);
      if (!post) throw new Error("글을 찾을 수 없습니다.");
      if (!canEditPost(post, actorId, actorRole)) {
        throw new Error("삭제 권한이 없습니다.");
      }
      store.posts = store.posts.filter((p) => p.id !== id);
      saveStore(store);
    },

    async listCategories() {
      const store = loadStore();
      return [...store.categories].sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async createCategory(input: CreateCategoryInput) {
      const store = loadStore();
      const category = {
        id: newId("cat"),
        name: input.name.trim(),
        slug: input.slug.trim(),
        sortOrder: input.sortOrder ?? store.categories.length,
      };
      store.categories.push(category);
      saveStore(store);
      return category;
    },

    async updateCategory(id: string, input: UpdateCategoryInput) {
      const store = loadStore();
      const index = store.categories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("카테고리를 찾을 수 없습니다.");
      store.categories[index] = {
        ...store.categories[index],
        name: input.name?.trim() ?? store.categories[index].name,
        slug: input.slug?.trim() ?? store.categories[index].slug,
        sortOrder: input.sortOrder ?? store.categories[index].sortOrder,
      };
      saveStore(store);
      return store.categories[index];
    },

    async deleteCategory(id: string) {
      const store = loadStore();
      const inUse = store.posts.some((p) => p.categoryId === id);
      if (inUse) throw new Error("글에 사용 중인 카테고리는 삭제할 수 없습니다.");
      store.categories = store.categories.filter((c) => c.id !== id);
      saveStore(store);
    },

    async listProfiles() {
      return loadStore().profiles;
    },

    async getProfile(id: string) {
      return loadStore().profiles.find((p) => p.id === id) ?? null;
    },

    async updateProfileRole(id: string, role: Role) {
      const store = loadStore();
      const index = store.profiles.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("회원을 찾을 수 없습니다.");
      store.profiles[index] = { ...store.profiles[index], role };
      saveStore(store);
      return store.profiles[index];
    },
  };
}

/** Server-side fallback for SSR (seed only, no localStorage) */
export function getServerSeedPosts(): PostWithMeta[] {
  const store = getDefaultStore();
  return sortPosts(
    store.posts.map((post) => ({
      ...post,
      author: store.profiles.find((p) => p.id === post.authorId),
      category: store.categories.find((c) => c.id === post.categoryId),
    }))
  );
}

export function getServerSeedCategories() {
  return getDefaultStore().categories.sort((a, b) => a.sortOrder - b.sortOrder);
}
