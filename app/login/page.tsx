import { Suspense } from "react";
import { LoginForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="px-4 py-[var(--section-gap)]">
      <Suspense fallback={<p className="text-center text-white/60">로딩…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
