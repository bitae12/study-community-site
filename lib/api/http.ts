import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function mapServiceError(err: unknown) {
  const code = err instanceof Error ? err.message : "UNKNOWN";
  switch (code) {
    case "UNAUTHORIZED":
      return jsonError("로그인이 필요합니다.", 401);
    case "FORBIDDEN":
      return jsonError("권한이 없습니다.", 403);
    case "NOT_FOUND":
      return jsonError("리소스를 찾을 수 없습니다.", 404);
    case "EMAIL_TAKEN":
      return jsonError("이미 가입된 이메일입니다.", 409);
    case "INVALID_CREDENTIALS":
      return jsonError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
    case "WEAK_PASSWORD":
      return jsonError("비밀번호는 6자 이상이어야 합니다.", 400);
    case "CATEGORY_IN_USE":
      return jsonError("글에 사용 중인 카테고리는 삭제할 수 없습니다.", 409);
    default:
      return jsonError("요청 처리에 실패했습니다.", 500);
  }
}
