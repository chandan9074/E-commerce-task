import { TbStar, TbStarFilled, TbStarHalfFilled } from "react-icons/tb";

import { cn } from "@/lib/utils/cn";
import { formatCompact } from "@/lib/utils/format";

const SIZES = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const;

/**
 * Star rating. Pure presentation - rendered on the server inside product cards,
 * so it ships zero JavaScript.
 */
export function Rating({
  value,
  count,
  size = "md",
  showValue = true,
  className,
}: {
  value: number;
  count?: number;
  size?: keyof typeof SIZES;
  showValue?: boolean;
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  const iconClass = cn(SIZES[size], "text-accent-500");

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          if (rounded >= star) return <TbStarFilled key={star} className={iconClass} aria-hidden />;
          if (rounded >= star - 0.5) return <TbStarHalfFilled key={star} className={iconClass} aria-hidden />;
          return <TbStar key={star} className={cn(SIZES[size], "text-muted/40")} aria-hidden />;
        })}
      </div>

      {showValue && (
        <span className="text-xs font-medium text-muted">
          {value.toFixed(1)}
          {count !== undefined && <span className="ml-1 opacity-70">({formatCompact(count)})</span>}
        </span>
      )}
    </div>
  );
}
