"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data/types";

export function CategoryPills({
  categories,
  activeSlug,
  onChange,
}: {
  categories: Category[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors",
          activeSlug === null
            ? "bg-white/20 text-white"
            : "bg-black/30 text-white/80 hover:bg-black/40"
        )}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.slug)}
          className={cn(
            "rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors",
            activeSlug === cat.slug
              ? "bg-white/20 text-white"
              : "bg-black/30 text-white/80 hover:bg-black/40"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
