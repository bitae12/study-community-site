import { NextResponse } from "next/server";
import { mapServiceError } from "@/lib/api/http";
import { requireSessionProfile } from "@/lib/auth/session-profile";
import * as db from "@/lib/data/prisma-service";
import type { Role } from "@/lib/data/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await requireSessionProfile();
    if (actor.role !== "admin" && actor.id !== id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const profiles = await db.listProfiles();
    const profile = profiles.find((p) => p.id === id) ?? null;
    return NextResponse.json(profile);
  } catch (err) {
    return mapServiceError(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await requireSessionProfile();
    if (actor.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const { id } = await params;
    const body = (await request.json()) as { role?: Role };
    if (!body.role) {
      return NextResponse.json({ error: "role이 필요합니다." }, { status: 400 });
    }
    const profile = await db.updateProfileRole(id, body.role);
    return NextResponse.json(profile);
  } catch (err) {
    return mapServiceError(err);
  }
}
