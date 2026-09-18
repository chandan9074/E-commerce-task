import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "brand" | "accent" | "success" | "danger" | "outline";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  brand: "bg-brand-600/10 text-brand-700 dark:text-brand-300",
  accent: "bg-accent-500/15 text-accent-700 dark:text-accent-300",
  success: "bg-success-500/12 text-success-600 dark:text-emerald-300",
  danger: "bg-danger-500/12 text-danger-600 dark:text-rose-300",
  outline: "border border-[var(--border-strong)] text-muted",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
