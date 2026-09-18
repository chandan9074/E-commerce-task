import type { ReactNode } from "react";
import { TbAlertTriangle, TbMoodEmpty, TbRefresh } from "react-icons/tb";

import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";
import { friendlyMessage } from "@/lib/api/http-error";
import type { NormalisedError } from "@/types";

/** Empty result set - always offers a way back to a non-empty state. */
export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
  className,
}: {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-[var(--border-strong)] px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-surface-muted text-muted">
        {icon ?? <TbMoodEmpty className="size-7" aria-hidden />}
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Error surface used by `error.tsx` boundaries and failed client fetches. */
export function ErrorState({
  error,
  title = "Something went wrong",
  onRetry,
  className,
}: {
  error?: NormalisedError | Error | null;
  title?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const normalised = error && "code" in error ? (error as NormalisedError) : null;
  const message = normalised ? friendlyMessage(normalised) : (error?.message ?? "Please try again.");
  const canRetry = Boolean(onRetry) && (normalised?.retryable ?? true);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-danger-500/30 bg-danger-500/5 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-danger-500/10 text-danger-600">
        <TbAlertTriangle className="size-7" aria-hidden />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
      {canRetry && (
        <Button variant="outline" size="sm" className="mt-6" onClick={onRetry}>
          <TbRefresh className="size-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
