import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "ghost" | "haze" | "pill";

const variantClass: Record<Variant, string> = {
  ghost:
    "border border-[var(--color-whiteout)] bg-transparent text-[var(--color-whiteout)] hover:bg-white/5",
  haze:
    "border border-[var(--color-ink)] bg-[var(--color-haze)] text-[var(--color-ink)] hover:bg-white",
  pill: "rounded-[var(--radius-pill)] border border-black/20 bg-black/10 text-[var(--color-ink)] hover:bg-black/15",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({
  className,
  variant = "ghost",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function LinkButton({
  href,
  variant = "ghost",
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium transition-colors",
        variantClass[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
