"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { PostForm, type PostFormValues } from "@/components/posts/post-form";
import { HazeCard } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/provider";
import { getDataClient } from "@/lib/data/index";
import type { Category } from "@/lib/data/types";

function NewPostInner() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getDataClient()
      .listCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(values: PostFormValues) {
    if (!user) return;
    const post = await getDataClient().createPost(user.id, {
      title: values.title,
      body: values.body,
      categoryId: values.categoryId,
      isPinned: isAdmin ? values.isPinned : false,
    });
    router.push(`/posts/${post.id}`);
  }

  const defaultCategory = categories[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-4 py-[var(--section-gap)] sm:px-6">
      <HazeCard className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-medium text-[var(--color-twilight)]">글쓰기</h1>
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--color-ink)]/70">카테고리를 불러오는 중…</p>
        ) : (
          <PostForm
            categories={categories}
            initial={{
              title: "",
              body: "",
              categoryId: defaultCategory,
              isPinned: false,
            }}
            showPin={isAdmin}
            submitLabel="등록"
            onSubmit={handleSubmit}
          />
        )}
      </HazeCard>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <RequireAuth>
      <NewPostInner />
    </RequireAuth>
  );
}
