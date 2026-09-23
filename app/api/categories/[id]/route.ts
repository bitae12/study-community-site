import { NextResponse } from "next/server";
import { mapServiceError } from "@/lib/api/http";
import { requireSessionProfile } from "@/lib/auth/session-profile";
import * as db from "@/lib/data/prisma-service";
type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await requireSessionProfile();
    if (actor.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      sortOrder?: number;
    };
    const category = await db.updateCategory(id, body);
    return NextResponse.json(category);
  } catch (err) {
    return mapServiceError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const actor = await requireSessionProfile();
    if (actor.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const { id } = await params;
    await db.deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return mapServiceError(err);
  }
}
