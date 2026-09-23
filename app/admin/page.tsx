"use client";

import { useEffect, useState } from "react";
import { HazeCard } from "@/components/ui/card";
import { getDataClient } from "@/lib/data/index";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ posts: 0, users: 0, categories: 0 });

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getDataClient().listPosts(),
      getDataClient().listProfiles(),
      getDataClient().listCategories(),
    ]).then(([posts, users, categories]) => {
      if (cancelled) return;
      setStats({
        posts: posts.length,
        users: users.length,
        categories: categories.length,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {(
        [
          ["글", stats.posts],
          ["회원", stats.users],
          ["카테고리", stats.categories],
        ] as const
      ).map(([label, value]) => (
        <HazeCard key={label}>
          <p className="text-sm text-[var(--color-ink)]/60">{label}</p>
          <p className="mt-2 text-4xl font-medium text-[var(--color-ink)]">{value}</p>
        </HazeCard>
      ))}
    </div>
  );
}
