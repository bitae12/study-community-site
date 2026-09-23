import type { Category, Post, Profile } from "@/lib/data/types";

export const MOCK_PASSWORD = "password123";

export const SEED_PROFILES: Profile[] = [
  {
    id: "profile-user-1",
    email: "user@example.com",
    displayName: "토끼유저",
    role: "user",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "profile-admin-1",
    email: "admin@example.com",
    displayName: "관리토끼",
    role: "admin",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "profile-google-1",
    email: "google.user@gmail.com",
    displayName: "Google 토끼",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
    role: "user",
    createdAt: "2025-02-01T00:00:00.000Z",
  },
];

/** Dev-only: email -> password (mock auth only) */
export const SEED_CREDENTIALS: Record<string, string> = {
  "user@example.com": MOCK_PASSWORD,
  "admin@example.com": MOCK_PASSWORD,
};

export const SEED_CATEGORIES: Category[] = [
  { id: "cat-notice", name: "공지", slug: "notice", sortOrder: 0 },
  { id: "cat-free", name: "자유", slug: "free", sortOrder: 1 },
  { id: "cat-study", name: "스터디", slug: "study", sortOrder: 2 },
  { id: "cat-qna", name: "질문", slug: "qna", sortOrder: 3 },
];

export const SEED_POSTS: Post[] = [
  {
    id: "post-welcome",
    authorId: "profile-admin-1",
    categoryId: "cat-notice",
    title: "래빗 커뮤니티에 오신 것을 환영합니다",
    body: "Air 스타일의 다크 테마 커뮤니티입니다. 로그인 후 글을 작성해 보세요.\n\n테스트 계정:\n- user@example.com / password123\n- admin@example.com / password123",
    isPinned: true,
    createdAt: "2025-03-01T09:00:00.000Z",
    updatedAt: "2025-03-01T09:00:00.000Z",
  },
  {
    id: "post-study-1",
    authorId: "profile-user-1",
    categoryId: "cat-study",
    title: "Next.js 스터디 모집",
    body: "주 2회 온라인으로 Next.js App Router를 함께 공부해요.",
    isPinned: false,
    createdAt: "2025-03-10T14:30:00.000Z",
    updatedAt: "2025-03-10T14:30:00.000Z",
  },
  {
    id: "post-free-1",
    authorId: "profile-google-1",
    categoryId: "cat-free",
    title: "오늘 날씨가 좋네요",
    body: "Google 로그인(mock)으로 들어온 사용자의 예시 글입니다.",
    isPinned: false,
    createdAt: "2025-03-12T08:15:00.000Z",
    updatedAt: "2025-03-12T08:15:00.000Z",
  },
];
