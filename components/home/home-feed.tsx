"use client";

import { useEffect, useState } from "react";
import { CategoryPills } from "@/components/posts/category-pills";
import { PostCard } from "@/components/posts/post-card";
import { getDataClient } from "@/lib/data/index";
import type { Category, PostWithMeta } from "@/lib/data/types";

export function HomeFeed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const client = getDataClient();
    void Promise.all([
      client.listCategories(),
      client.listPosts({ categorySlug: activeSlug }),
    ]).then(([cats, list]) => {
      if (cancelled) return;
      setCategories(cats);
      setPosts(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  return (
    <section className="mx-auto max-w-[var(--page-max)] px-4 pb-[var(--section-gap)] sm:px-6">
      <div className="mb-8">
        <CategoryPills
          categories={categories}
          activeSlug={activeSlug}
          onChange={setActiveSlug}
        />
      </div>
      {loading ? (
        <p className="text-white/60">글 불러오는 중…</p>
      ) : posts.length === 0 ? (
        <p className="text-white/60">표시할 글이 없습니다.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
