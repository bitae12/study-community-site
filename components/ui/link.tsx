import Link from "next/link";
import { cn } from "@/lib/utils";

export function UnderlineLink({
  href,
  className,
  children,
  dark = false,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 px-2 pb-0.5 text-sm font-medium transition-opacity hover:opacity-80",
        dark
          ? "border-[var(--color-signal)] text-[var(--color-signal)]"
          : "border-[var(--color-ink)] text-[var(--color-ink)]",
        className
      )}
    >
      {children}
    </Link>
  );
}
