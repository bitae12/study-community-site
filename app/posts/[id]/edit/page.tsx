"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { PostForm, type PostFormValues } from "@/components/posts/post-form";
import { HazeCard } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/provider";
import { getDataClient } from "@/lib/data/index";
import type { Category, PostWithMeta } from "@/lib/data/types";

function EditPostInner() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<PostWithMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getDataClient().getPost(id),
      getDataClient().listCategories(),
    ]).then(([p, cats]) => {
      if (cancelled) return;
      setPost(p);
      setCategories(cats);
      setLoading(false);
      if (p && user && p.authorId !== user.id && !isAdmin) {
        setDenied(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, user, isAdmin]);

  async function handleSubmit(values: PostFormValues) {
    if (!user || !post) return;
    await getDataClient().updatePost(post.id, user.id, user.role, {
      title: values.title,
      body: values.body,
      categoryId: values.categoryId,
      isPinned: isAdmin ? values.isPinned : undefined,
    });
    router.push(`/posts/${post.id}`);
  }

  if (loading) {
    return (
      <p className="py-20 text-center text-white/60">불러오는 중…</p>
    );
  }

  if (!post || denied) {
    return (
      <p className="py-20 text-center text-white/60">수정 권한이 없습니다.</p>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-4 py-[var(--section-gap)] sm:px-6">
      <HazeCard className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-medium text-[var(--color-twilight)]">글 수정</h1>
        <PostForm
          categories={categories}
          initial={{
            title: post.title,
            body: post.body,
            categoryId: post.categoryId,
            isPinned: post.isPinned,
          }}
          showPin={isAdmin}
          submitLabel="저장"
          onSubmit={handleSubmit}
        />
      </HazeCard>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <RequireAuth>
      <EditPostInner />
    </RequireAuth>
  );
}
