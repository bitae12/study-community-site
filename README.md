# Rabbit Community

| 모드 | 설정 |
|------|------|
| **mock** | env 없음 |
| **prisma** | `NEXT_PUBLIC_USE_PRISMA=true` + SQLite + **Auth.js** |
| **supabase** | 배포용 `NEXT_PUBLIC_USE_SUPABASE=true` |

## Prisma + Google 로그인 (로컬)

### 1. 환경 변수 (`.env.local`)

```env
NEXT_PUBLIC_USE_PRISMA=true
DATABASE_URL="file:./dev.db"

AUTH_SECRET=임의의_긴_문자열
AUTH_URL=http://localhost:3000

AUTH_GOOGLE_ID=xxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxx
```

`AUTH_SECRET` 생성 (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services**
2. **OAuth consent screen** → 테스트 사용자에 본인 Gmail 추가
3. **Credentials → Create OAuth client ID → Web application**
4. **Authorized redirect URIs**:

```text
http://localhost:3000/api/auth/callback/google
```

(다른 포트면 `http://localhost:3001/api/auth/callback/google` 등으로 맞춤)

5. Client ID / Secret을 `.env.local`의 `AUTH_GOOGLE_*`에 붙여넣기

### 3. DB

```bash
npm run db:reset
npm run dev
```

`/login` → **Google로 시작** → Google 계정 선택 → 홈으로 돌아옴.

이메일 가입·로그인도 Auth.js Credentials로 동작합니다. 시드: `user@example.com` / `admin@example.com` — `password123`.

관리자(Google 가입 후):

```bash
npm run db:studio
```

→ `User` 테이블에서 본인 이메일의 `role`을 `admin`으로 변경.

## mock 모드

```bash
npm run dev
```

(localStorage, mock Google)

## Supabase 배포

`NEXT_PUBLIC_USE_PRISMA` 끄고 Supabase env 사용. [supabase/migrations/](supabase/migrations/) 참고.
