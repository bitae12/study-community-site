import { NextResponse } from "next/server";
import { mapServiceError } from "@/lib/api/http";
import { requireSessionProfile } from "@/lib/auth/session-profile";
import * as db from "@/lib/data/prisma-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const post = await db.getPost(id);
    if (!post) {
      return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    return mapServiceError(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await requireSessionProfile();
    const { id } = await params;
    const body = (await request.json()) as {
      title?: string;
      body?: string;
      categoryId?: string;
      isPinned?: boolean;
    };
    const post = await db.updatePost(id, actor.id, actor.role, body);
    return NextResponse.json(post);
  } catch (err) {
    return mapServiceError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const actor = await requireSessionProfile();
    const { id } = await params;
    await db.deletePost(id, actor.id, actor.role);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return mapServiceError(err);
  }
}
