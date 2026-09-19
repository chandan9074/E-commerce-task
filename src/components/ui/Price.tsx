import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

const SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
} as const;

/** Price, with the original struck through when discounted. */
export function Price({
  value,
  compareAt,
  currency = "USD",
  size = "md",
  showSaving = false,
  className,
}: {
  value: number;
  compareAt?: number | null;
  currency?: string;
  size?: keyof typeof SIZES;
  showSaving?: boolean;
  className?: string;
}) {
  const discounted = Boolean(compareAt && compareAt > value);
  const percent = discounted ? Math.round(((compareAt! - value) / compareAt!) * 100) : 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-semibold tracking-tight text-foreground", SIZES[size])}>
        {formatCurrency(value, currency)}
      </span>

      {discounted && (
        <>
          <span className="text-sm text-muted line-through">{formatCurrency(compareAt!, currency)}</span>
          {showSaving && (
            <span className="rounded-pill bg-danger-500/10 px-2 py-0.5 text-xs font-semibold text-danger-600">
              -{percent}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
