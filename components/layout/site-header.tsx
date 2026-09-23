"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { UnderlineLink } from "@/components/ui/link";
import { useAuth } from "@/lib/auth/provider";

export function SiteHeader() {
  const { user, loading, signOut, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--nav-height)] max-w-[var(--page-max)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-whiteout)]">
          <span className="text-xl" aria-hidden>
            🐰
          </span>
          <span className="text-sm font-medium tracking-wide sm:text-base">
            Rabbit Community
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <UnderlineLink href="/" dark className="hidden sm:inline">
            홈
          </UnderlineLink>
          {user && (
            <LinkButton href="/posts/new" variant="ghost" className="text-xs sm:text-sm">
              글쓰기
            </LinkButton>
          )}
          {isAdmin && (
            <LinkButton href="/admin" variant="ghost" className="text-xs sm:text-sm">
              관리자
            </LinkButton>
          )}
          {!loading && !user && (
            <>
              <LinkButton href="/login" variant="ghost" className="text-xs sm:text-sm">
                로그인
              </LinkButton>
              <LinkButton href="/signup" variant="ghost" className="text-xs sm:text-sm">
                회원가입
              </LinkButton>
            </>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-[120px] truncate text-xs text-white/70 sm:inline sm:max-w-none sm:text-sm">
                {user.displayName}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-[var(--radius-button)] border border-white/30 px-3 py-2 text-xs font-medium text-white hover:bg-white/5 sm:text-sm"
              >
                로그아웃
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
