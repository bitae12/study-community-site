import { cn } from "@/lib/utils";

export function HazeCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] bg-[var(--color-haze)] p-[var(--card-padding)] text-[var(--color-ink)]",
        className
      )}
    >
      {children}
    </div>
  );
}
