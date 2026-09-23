"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HazeCard } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/provider";
import { getDataClient } from "@/lib/data/index";
import type { PostWithMeta } from "@/lib/data/types";
import { formatDate } from "@/lib/utils";

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<PostWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getDataClient()
      .getPost(id)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canEdit =
    post && user && (post.authorId === user.id || isAdmin);

  async function handleDelete() {
    if (!post || !user) return;
    if (!confirm("이 글을 삭제할까요?")) return;
    try {
      await getDataClient().deletePost(post.id, user.id, user.role);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  }

  if (loading) {
    return (
      <p className="py-20 text-center text-white/60">글 불러오는 중…</p>
    );
  }

  if (!post) {
    return (
      <p className="py-20 text-center text-white/60">글을 찾을 수 없습니다.</p>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-4 py-[var(--section-gap)] sm:px-6">
      <HazeCard className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink)]/70">
          {post.isPinned && (
            <span className="rounded-[var(--radius-pill)] bg-black/10 px-2 py-0.5">
              고정 공지
            </span>
          )}
          <span>{post.category?.name}</span>
          <span>·</span>
          <span>{post.author?.displayName}</span>
          <span>·</span>
          <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
        </div>
        <h1 className="text-3xl font-medium leading-tight text-[var(--color-ink)]">
          {post.title}
        </h1>
        <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-[var(--color-ink)]/90">
          {post.body}
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-700">{error}</p>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--color-signal)] underline-offset-4 hover:underline"
          >
            목록으로
          </Link>
          {canEdit && (
            <>
              <Link
                href={`/posts/${post.id}/edit`}
                className="text-sm text-[var(--color-signal)] underline-offset-4 hover:underline"
              >
                수정
              </Link>
              <Button type="button" variant="haze" onClick={handleDelete}>
                삭제
              </Button>
            </>
          )}
        </div>
      </HazeCard>
    </div>
  );
}
