"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HazeCard } from "@/components/ui/card";
import { Label, TextInput } from "@/components/ui/input";
import { UnderlineLink } from "@/components/ui/link";
import { useAuth } from "@/lib/auth/provider";
import { MOCK_PASSWORD } from "@/lib/mock-auth";
import { isPrismaMode, isSupabaseMode } from "@/lib/data/index";

export function LoginForm() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const authError = params.get("error");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(decodeURIComponent(authError));
    }
  }, [authError]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    try {
      await signInWithGoogle();
      if (!isSupabaseMode()) {
        router.push(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google 로그인에 실패했습니다.");
      setPending(false);
    }
  }

  return (
    <HazeCard className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-medium text-[var(--color-twilight)]">로그인</h1>
      <p className="mt-2 text-sm text-[var(--color-ink)]/70">
        {isSupabaseMode()
          ? "Supabase Auth. 시드: user@example.com / password123 (admin@example.com 관리자)"
          : isPrismaMode()
            ? "Prisma DB + Auth.js (Google OAuth 가능). 시드: user@example.com / password123"
            : `테스트: user@example.com / ${MOCK_PASSWORD}`}
      </p>
      {error && (
        <p className="mt-4 rounded-[var(--radius-input)] bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="email">이메일</Label>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="haze" disabled={pending}>
          {pending ? "로그인 중…" : "로그인"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-[var(--color-ink)]/50">
        <span className="h-px flex-1 bg-black/10" />
        또는
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <Button type="button" variant="haze" className="w-full" disabled={pending} onClick={onGoogle}>
        Google로 시작
      </Button>
      <p className="mt-6 text-center text-sm text-[var(--color-ink)]/80">
        계정이 없나요?{" "}
        <UnderlineLink href="/signup">회원가입</UnderlineLink>
      </p>
    </HazeCard>
  );
}

export function SignupForm() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signUp(email, password, displayName);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    try {
      await signInWithGoogle();
      if (!isSupabaseMode()) {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google 가입에 실패했습니다.");
      setPending(false);
    }
  }

  return (
    <HazeCard className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-medium text-[var(--color-twilight)]">회원가입</h1>
      <p className="mt-2 text-sm text-[var(--color-ink)]/70">
        Google로 빠르게 가입하거나 이메일로 계정을 만드세요.
      </p>
      {error && (
        <p className="mt-4 rounded-[var(--radius-input)] bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="haze"
        className="mt-6 w-full"
        disabled={pending}
        onClick={onGoogle}
      >
        Google로 가입
      </Button>
      <div className="my-6 flex items-center gap-3 text-xs text-[var(--color-ink)]/50">
        <span className="h-px flex-1 bg-black/10" />
        이메일 가입
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="displayName">닉네임</Label>
          <TextInput
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="토끼123"
          />
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <Button type="submit" variant="haze" disabled={pending}>
          {pending ? "가입 중…" : "가입하기"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-ink)]/80">
        이미 계정이 있나요?{" "}
        <UnderlineLink href="/login">로그인</UnderlineLink>
      </p>
    </HazeCard>
  );
}
