import { cn } from "@/lib/utils";

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-input)] border border-black/10 bg-[var(--color-haze)] px-2.5 py-2.5 text-base text-[var(--color-ink)] outline-none focus:border-black/25",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[160px] w-full resize-y rounded-[var(--radius-input)] border border-black/10 bg-[var(--color-haze)] px-2.5 py-2.5 text-base text-[var(--color-ink)] outline-none focus:border-black/25",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-[var(--color-ink)]", className)}
      {...props}
    >
      {children}
    </label>
  );
}
