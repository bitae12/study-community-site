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

## Supabase 배포 (Vercel)

Vercel **Environment Variables** (Production):

- `NEXT_PUBLIC_USE_SUPABASE=true`
- `NEXT_PUBLIC_USE_PRISMA=false`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase **Project Settings → API**에서 복사:

- URL: `https://<project-ref>.supabase.co` (끝에 `/` 없음)
- Key: **anon** `public` (JWT `eyJ…` 또는 **Publishable** `sb_publishable_…`)
- ❌ **service_role** / **sb_secret_** 는 Vercel에 넣지 않음
- ❌ 값 앞뒤 따옴표 `"..."` 붙이지 않음

`Invalid API key` → URL·키가 **같은 프로젝트** 쌍인지 확인 후 **Redeploy**.

**Supabase → Authentication → URL Configuration**

실제 **사이트 주소**만 넣습니다. (`vercel.com/팀명/프로젝트` 대시보드 URL ❌)

예: `https://study-community-site-eight.vercel.app`

- **Site URL**: `https://study-community-site-eight.vercel.app`
- **Redirect URLs** (한 줄씩 추가):
  - `https://study-community-site-eight.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (로컬 개발용)

Google OAuth는 Supabase Provider 설정 + Google Cloud redirect  
`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

스키마: [supabase/migrations/](supabase/migrations/)
