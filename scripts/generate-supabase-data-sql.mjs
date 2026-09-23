import { readFileSync, writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Stable UUIDs for cross-table references in one migration batch */
const USER_UUID = {
  "user@example.com": "a1000001-0001-4001-8001-000000000001",
  "admin@example.com": "a1000001-0001-4001-8001-000000000002",
  "jjeong02130213@gmail.com": "a1000001-0001-4001-8001-000000000003",
  "cheol232329@khu.ac.kr": "a1000001-0001-4001-8001-000000000004",
};

const CATEGORY_SLUG = {
  cmuei37vv0002yipos3w79pe6: "notice",
  cmuei37w00003yipor43svief: "free",
  cmuei37w50004yipoomcdzkvj: "study",
  cmuei37w90005yipo3xp8pg0w: "qna",
};

function sqlStr(value) {
  if (value == null) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsonObj(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    image: true,
    passwordHash: true,
    createdAt: true,
  },
});
const accounts = await prisma.account.findMany();
const posts = await prisma.post.findMany();

const accountByUserId = new Map(accounts.map((a) => [a.userId, a]));

const lines = [];
lines.push("create extension if not exists pgcrypto;");
lines.push("");

for (const user of users) {
  const uid = USER_UUID[user.email];
  if (!uid) continue;

  const meta = {
    display_name: user.name,
    avatar_url: user.image ?? null,
  };

  const appMeta = user.passwordHash
    ? { provider: "email", providers: ["email"] }
    : { provider: "google", providers: ["google"] };

  const passwordForInsert = user.passwordHash
    ? sqlStr(user.passwordHash.replace("$2b$", "$2a$"))
    : "null";

  lines.push(`insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
) values (
  '00000000-0000-0000-0000-000000000000',
  '${uid}'::uuid,
  'authenticated',
  'authenticated',
  ${sqlStr(user.email)},
  ${passwordForInsert},
  ${sqlStr(user.createdAt.toISOString())}::timestamptz,
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ${jsonObj(appMeta)},
  ${jsonObj(meta)},
  ${sqlStr(user.createdAt.toISOString())}::timestamptz,
  ${sqlStr(user.createdAt.toISOString())}::timestamptz,
  false,
  false
) on conflict (id) do nothing;`);

  const account = accountByUserId.get(user.id);
  if (account?.provider === "google") {
    const identityData = {
      sub: account.providerAccountId,
      email: user.email,
      email_verified: true,
      name: user.name,
      picture: user.image,
      provider_id: account.providerAccountId,
    };
    lines.push(`insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  ${sqlStr(account.providerAccountId)},
  '${uid}'::uuid,
  ${jsonObj(identityData)},
  'google',
  now(),
  now(),
  now()
) on conflict (provider_id, provider) do nothing;`);
  }
}

lines.push("");
lines.push(
  "update public.profiles set role = 'admin' where email = 'admin@example.com';",
);

for (const post of posts) {
  const author = users.find((u) => u.id === post.authorId);
  const authorUuid = author ? USER_UUID[author.email] : null;
  const slug = CATEGORY_SLUG[post.categoryId];
  if (!authorUuid || !slug) continue;

  lines.push(`insert into public.posts (author_id, category_id, title, body, is_pinned, created_at, updated_at)
select
  '${authorUuid}'::uuid,
  c.id,
  ${sqlStr(post.title)},
  ${sqlStr(post.body)},
  ${post.isPinned ? "true" : "false"},
  ${sqlStr(post.createdAt.toISOString())}::timestamptz,
  ${sqlStr(post.updatedAt.toISOString())}::timestamptz
from public.categories c
where c.slug = ${sqlStr(slug)};`);
}

const sql = lines.join("\n");
writeFileSync("scripts/generated-supabase-data.sql", sql, "utf8");
console.log(`Wrote ${lines.length} statements to scripts/generated-supabase-data.sql`);

await prisma.$disconnect();
