import { NextResponse } from "next/server";
import { mapServiceError } from "@/lib/api/http";
import { requireSessionProfile } from "@/lib/auth/session-profile";
import * as db from "@/lib/data/prisma-service";

export async function GET() {
  try {
    return NextResponse.json(await db.listCategories());
  } catch (err) {
    return mapServiceError(err);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSessionProfile();
    if (actor.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      sortOrder?: number;
    };
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "입력값이 부족합니다." }, { status: 400 });
    }
    const category = await db.createCategory({
      name: body.name,
      slug: body.slug,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json(category);
  } catch (err) {
    return mapServiceError(err);
  }
}
