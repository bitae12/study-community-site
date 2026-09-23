import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash,
      name: "토끼유저",
      role: "user",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      name: "관리토끼",
      role: "admin",
    },
  });

  const categories = [
    { name: "공지", slug: "notice", sortOrder: 0 },
    { name: "자유", slug: "free", sortOrder: 1 },
    { name: "스터디", slug: "study", sortOrder: 2 },
    { name: "질문", slug: "qna", sortOrder: 3 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const notice = await prisma.category.findUniqueOrThrow({
    where: { slug: "notice" },
  });
  const study = await prisma.category.findUniqueOrThrow({
    where: { slug: "study" },
  });

  const welcome = await prisma.post.findFirst({
    where: { title: "래빗 커뮤니티에 오신 것을 환영합니다" },
  });
  if (!welcome) {
    await prisma.post.create({
      data: {
        authorId: admin.id,
        categoryId: notice.id,
        title: "래빗 커뮤니티에 오신 것을 환영합니다",
        body: "로컬 SQLite + Prisma + Auth.js(Google OAuth)입니다.\n\n테스트 계정:\n- user@example.com / password123\n- admin@example.com / password123",
        isPinned: true,
      },
    });
  }

  const studyPost = await prisma.post.findFirst({
    where: { title: "Next.js 스터디 모집" },
  });
  if (!studyPost) {
    await prisma.post.create({
      data: {
        authorId: user.id,
        categoryId: study.id,
        title: "Next.js 스터디 모집",
        body: "주 2회 온라인으로 Next.js App Router를 함께 공부해요.",
        isPinned: false,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
