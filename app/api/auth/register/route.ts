import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mapServiceError } from "@/lib/api/http";
import { toProfile } from "@/lib/data/mappers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = (await request.json()) as {
      email?: string;
      password?: string;
      displayName?: string;
    };
    if (!email || !password) {
      return NextResponse.json({ error: "입력값이 부족합니다." }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
        name: displayName?.trim() || normalized.split("@")[0],
        role: "user",
      },
    });
    return NextResponse.json({ user: toProfile(user) });
  } catch (err) {
    return mapServiceError(err);
  }
}
