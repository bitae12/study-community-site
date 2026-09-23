import Link from "next/link";
import { HazeCard } from "@/components/ui/card";
import type { PostWithMeta } from "@/lib/data/types";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: PostWithMeta }) {
  return (
    <HazeCard className="flex flex-col gap-3 transition-opacity hover:opacity-95">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink)]/70">
        {post.isPinned && (
          <span className="rounded-[var(--radius-pill)] bg-black/10 px-2 py-0.5 font-medium">
            고정
          </span>
        )}
        <span>{post.category?.name ?? "미분류"}</span>
        <span>·</span>
        <span>{post.author?.displayName ?? "익명"}</span>
        <span>·</span>
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      </div>
      <Link href={`/posts/${post.id}`} className="group">
        <h2 className="text-xl font-medium leading-snug text-[var(--color-ink)] group-hover:underline">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-base leading-relaxed text-[var(--color-ink)]/80">
          {post.body}
        </p>
      </Link>
    </HazeCard>
  );
}
