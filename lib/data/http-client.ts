"use client";

import type {
  CreateCategoryInput,
  CreatePostInput,
  DataClient,
  ListPostsFilters,
  Post,
  Role,
  UpdateCategoryInput,
  UpdatePostInput,
} from "@/lib/data/types";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof body.error === "string" ? body.error : "요청에 실패했습니다."
    );
  }
  return body as T;
}

export function createHttpDataClient(): DataClient {
  return {
    listPosts(filters?: ListPostsFilters) {
      const qs = filters?.categorySlug
        ? `?categorySlug=${encodeURIComponent(filters.categorySlug)}`
        : "";
      return request(`/api/posts${qs}`);
    },
    async getPost(id: string) {
      const res = await fetch(`/api/posts/${id}`, { credentials: "include" });
      if (res.status === 404) return null;
      const body = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "요청에 실패했습니다."
        );
      }
      return body;
    },
    createPost(_authorId: string, input: CreatePostInput) {
      return request<Post>("/api/posts", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    updatePost(id: string, _actorId: string, _actorRole: Role, input: UpdatePostInput) {
      return request<Post>(`/api/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
    deletePost(id: string, _actorId: string, _actorRole: Role) {
      return request<void>(`/api/posts/${id}`, { method: "DELETE" });
    },
    listCategories() {
      return request("/api/categories");
    },
    createCategory(input: CreateCategoryInput) {
      return request("/api/categories", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    updateCategory(id: string, input: UpdateCategoryInput) {
      return request(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
    deleteCategory(id: string) {
      return request<void>(`/api/categories/${id}`, { method: "DELETE" });
    },
    listProfiles() {
      return request("/api/profiles");
    },
    getProfile(id: string) {
      return request(`/api/profiles/${id}`);
    },
    updateProfileRole(id: string, role: Role) {
      return request(`/api/profiles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    },
  };
}
