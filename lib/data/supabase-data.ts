import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateCategoryInput,
  CreatePostInput,
  DataClient,
  ListPostsFilters,
  Post,
  PostWithMeta,
  Profile,
  Role,
  UpdateCategoryInput,
  UpdatePostInput,
} from "@/lib/data/types";

type DbProfile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: Role;
  created_at: string;
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

type DbPost = {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    role: row.role,
    createdAt: row.created_at,
  };
}

function mapCategory(row: DbCategory) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

function mapPost(row: DbPost): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    categoryId: row.category_id,
    title: row.title,
    body: row.body,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createSupabaseDataClient(supabase: SupabaseClient): DataClient {
  return {
    async listPosts(filters?: ListPostsFilters) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, author:profiles!posts_author_id_fkey(*), category:categories(*)"
        )
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      const rows = (data ?? []).filter((row) => {
        if (!filters?.categorySlug) return true;
        const category = row.category as DbCategory | null;
        return category?.slug === filters.categorySlug;
      });

      return rows.map((row) => {
        const author = row.author as DbProfile | null;
        const category = row.category as DbCategory | null;
        return {
          ...mapPost(row as DbPost),
          author: author ? mapProfile(author) : undefined,
          category: category ? mapCategory(category) : undefined,
        } satisfies PostWithMeta;
      });
    },

    async getPost(id: string) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, author:profiles!posts_author_id_fkey(*), category:categories(*)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const author = data.author as DbProfile | null;
      const category = data.category as DbCategory | null;
      return {
        ...mapPost(data as DbPost),
        author: author ? mapProfile(author) : undefined,
        category: category ? mapCategory(category) : undefined,
      };
    },

    async createPost(authorId: string, input: CreatePostInput) {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: authorId,
          category_id: input.categoryId,
          title: input.title.trim(),
          body: input.body.trim(),
          is_pinned: input.isPinned ?? false,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return mapPost(data as DbPost);
    },

    async updatePost(
      id: string,
      actorId: string,
      actorRole: Role,
      input: UpdatePostInput
    ) {
      const { data: existing, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (fetchError) throw new Error(fetchError.message);
      if (!existing) throw new Error("글을 찾을 수 없습니다.");
      const post = existing as DbPost;
      if (post.author_id !== actorId && actorRole !== "admin") {
        throw new Error("수정 권한이 없습니다.");
      }

      const payload: Partial<DbPost> = {
        title: input.title?.trim() ?? post.title,
        body: input.body?.trim() ?? post.body,
        category_id: input.categoryId ?? post.category_id,
        updated_at: new Date().toISOString(),
      };
      if (actorRole === "admin" && input.isPinned !== undefined) {
        payload.is_pinned = input.isPinned;
      }

      const { data, error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return mapPost(data as DbPost);
    },

    async deletePost(id: string, actorId: string, actorRole: Role) {
      const { data: existing, error: fetchError } = await supabase
        .from("posts")
        .select("author_id")
        .eq("id", id)
        .maybeSingle();
      if (fetchError) throw new Error(fetchError.message);
      if (!existing) throw new Error("글을 찾을 수 없습니다.");
      if (existing.author_id !== actorId && actorRole !== "admin") {
        throw new Error("삭제 권한이 없습니다.");
      }
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async listCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return (data as DbCategory[]).map(mapCategory);
    },

    async createCategory(input: CreateCategoryInput) {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: input.name.trim(),
          slug: input.slug.trim(),
          sort_order: input.sortOrder ?? 0,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return mapCategory(data as DbCategory);
    },

    async updateCategory(id: string, input: UpdateCategoryInput) {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: input.name?.trim(),
          slug: input.slug?.trim(),
          sort_order: input.sortOrder,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return mapCategory(data as DbCategory);
    },

    async deleteCategory(id: string) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async listProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data as DbProfile[]).map(mapProfile);
    },

    async getProfile(id: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapProfile(data as DbProfile) : null;
    },

    async updateProfileRole(id: string, role: Role) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return mapProfile(data as DbProfile);
    },
  };
}
