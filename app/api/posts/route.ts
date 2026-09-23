import { NextResponse } from "next/server";
import { mapServiceError } from "@/lib/api/http";
import { requireSessionProfile } from "@/lib/auth/session-profile";
import * as db from "@/lib/data/prisma-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");
    const posts = await db.listPosts({
      categorySlug: categorySlug || undefined,
    });
    return NextResponse.json(posts);
  } catch (err) {
    return mapServiceError(err);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSessionProfile();
    const body = (await request.json()) as {
      title?: string;
      body?: string;
      categoryId?: string;
      isPinned?: boolean;
    };
    if (!body.title || !body.body || !body.categoryId) {
      return NextResponse.json({ error: "입력값이 부족합니다." }, { status: 400 });
    }
    const post = await db.createPost(actor.id, actor.role, {
      title: body.title,
      body: body.body,
      categoryId: body.categoryId,
      isPinned: body.isPinned,
    });
    return NextResponse.json(post);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return mapServiceError(err);
    }
    return mapServiceError(err);
  }
}
