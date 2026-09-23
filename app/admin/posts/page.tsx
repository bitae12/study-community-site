"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HazeCard } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/provider";
import { getDataClient } from "@/lib/data/index";
import type { PostWithMeta } from "@/lib/data/types";
import { formatDate } from "@/lib/utils";

export default function AdminPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithMeta[]>([]);

  async function refresh() {
    setPosts(await getDataClient().listPosts());
  }

  useEffect(() => {
    let cancelled = false;
    void getDataClient()
      .listPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function togglePin(post: PostWithMeta) {
    if (!user) return;
    await getDataClient().updatePost(post.id, user.id, user.role, {
      isPinned: !post.isPinned,
    });
    await refresh();
  }

  async function remove(post: PostWithMeta) {
    if (!user) return;
    if (!confirm(`"${post.title}" 글을 삭제할까요?`)) return;
    await getDataClient().deletePost(post.id, user.id, user.role);
    await refresh();
  }

  return (
    <HazeCard>
      <h2 className="mb-4 text-xl font-medium text-[var(--color-ink)]">전체 글</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-[var(--color-ink)]/60">
              <th className="py-2 pr-4">제목</th>
              <th className="py-2 pr-4">작성자</th>
              <th className="py-2 pr-4">고정</th>
              <th className="py-2 pr-4">날짜</th>
              <th className="py-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-black/5">
                <td className="py-3 pr-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-[var(--color-signal)] hover:underline"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">{post.author?.displayName}</td>
                <td className="py-3 pr-4">{post.isPinned ? "Y" : "N"}</td>
                <td className="py-3 pr-4">{formatDate(post.createdAt)}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="haze" onClick={() => togglePin(post)}>
                      {post.isPinned ? "고정 해제" : "고정"}
                    </Button>
                    <Button type="button" variant="haze" onClick={() => remove(post)}>
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HazeCard>
  );
}
