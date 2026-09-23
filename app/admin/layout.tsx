import Link from "next/link";
import { RequireAdmin } from "@/components/auth/require-auth";

const links = [
  { href: "/admin", label: "개요" },
  { href: "/admin/posts", label: "글 관리" },
  { href: "/admin/users", label: "회원" },
  { href: "/admin/categories", label: "카테고리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="mx-auto max-w-[var(--page-max)] px-4 py-[var(--section-gap)] sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-white/60">Admin</p>
            <h1 className="text-3xl font-medium text-[var(--color-twilight)]">관리자 모드</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-button)] border border-white/25 px-3 py-2 text-sm text-white hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
    </RequireAdmin>
  );
}
