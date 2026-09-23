export type Role = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface Post {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithMeta extends Post {
  author?: Profile;
  category?: Category;
}

export interface ListPostsFilters {
  categorySlug?: string | null;
}

export interface CreatePostInput {
  title: string;
  body: string;
  categoryId: string;
  isPinned?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  categoryId?: string;
  isPinned?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  sortOrder?: number;
}

export interface DataClient {
  listPosts(filters?: ListPostsFilters): Promise<PostWithMeta[]>;
  getPost(id: string): Promise<PostWithMeta | null>;
  createPost(authorId: string, input: CreatePostInput): Promise<Post>;
  updatePost(
    id: string,
    actorId: string,
    actorRole: Role,
    input: UpdatePostInput
  ): Promise<Post>;
  deletePost(id: string, actorId: string, actorRole: Role): Promise<void>;

  listCategories(): Promise<Category[]>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  listProfiles(): Promise<Profile[]>;
  getProfile(id: string): Promise<Profile | null>;
  updateProfileRole(id: string, role: Role): Promise<Profile>;
}
