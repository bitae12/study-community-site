import { NextResponse } from "next/server";
import { mapServiceError } from "@/lib/api/http";
import { requireSessionProfile } from "@/lib/auth/session-profile";
import * as db from "@/lib/data/prisma-service";

export async function GET() {
  try {
    const actor = await requireSessionProfile();
    if (actor.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json(await db.listProfiles());
  } catch (err) {
    return mapServiceError(err);
  }
}
