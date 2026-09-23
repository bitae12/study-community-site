"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HazeCard } from "@/components/ui/card";
import { Label, TextInput } from "@/components/ui/input";
import { getDataClient } from "@/lib/data/index";
import type { Category } from "@/lib/data/types";
import { slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setCategories(await getDataClient().listCategories());
  }

  useEffect(() => {
    let cancelled = false;
    void getDataClient()
      .listCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await getDataClient().createCategory({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
      });
      setName("");
      setSlug("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 실패");
    }
  }

  async function removeCategory(id: string) {
    if (!confirm("카테고리를 삭제할까요?")) return;
    try {
      await getDataClient().deleteCategory(id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <HazeCard>
        <h2 className="mb-4 text-xl font-medium text-[var(--color-ink)]">카테고리 추가</h2>
        {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={createCategory} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="cat-name">이름</Label>
            <TextInput
              id="cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(slugify(e.target.value));
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="cat-slug">slug</Label>
            <TextInput
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="free"
            />
          </div>
          <Button type="submit" variant="haze">
            추가
          </Button>
        </form>
      </HazeCard>

      <HazeCard>
        <h2 className="mb-4 text-xl font-medium text-[var(--color-ink)]">목록</h2>
        <ul className="divide-y divide-black/10">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-[var(--color-ink)]">{cat.name}</p>
                <p className="text-xs text-[var(--color-ink)]/60">{cat.slug}</p>
              </div>
              <Button type="button" variant="haze" onClick={() => removeCategory(cat.id)}>
                삭제
              </Button>
            </li>
          ))}
        </ul>
      </HazeCard>
    </div>
  );
}
