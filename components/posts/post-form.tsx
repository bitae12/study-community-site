"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, TextArea, TextInput } from "@/components/ui/input";
import type { Category } from "@/lib/data/types";

export type PostFormValues = {
  title: string;
  body: string;
  categoryId: string;
  isPinned?: boolean;
};

export function PostForm({
  categories,
  initial,
  submitLabel,
  showPin,
  onSubmit,
}: {
  categories: Category[];
  initial: PostFormValues;
  submitLabel: string;
  showPin?: boolean;
  onSubmit: (values: PostFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.title.trim() || !values.body.trim()) {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }
    setPending(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-[var(--radius-input)] bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <div>
        <Label htmlFor="title">제목</Label>
        <TextInput
          id="title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">카테고리</Label>
        <select
          id="category"
          className="w-full rounded-[var(--radius-input)] border border-black/10 bg-[var(--color-haze)] px-2.5 py-2.5 text-base"
          value={values.categoryId}
          onChange={(e) =>
            setValues((v) => ({ ...v, categoryId: e.target.value }))
          }
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="body">내용</Label>
        <TextArea
          id="body"
          value={values.body}
          onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
          required
        />
      </div>
      {showPin && (
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={values.isPinned ?? false}
            onChange={(e) =>
              setValues((v) => ({ ...v, isPinned: e.target.checked }))
            }
          />
          공지로 고정
        </label>
      )}
      <Button type="submit" variant="haze" disabled={pending}>
        {pending ? "저장 중…" : submitLabel}
      </Button>
    </form>
  );
}
