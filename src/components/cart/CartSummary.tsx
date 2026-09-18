"use client";

import { TbTruck } from "react-icons/tb";

import { COMMERCE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { CartTotals } from "@/types";

/**
 * Totals panel. Takes `totals` as a prop rather than reading the store, so the
 * cart page, the drawer and checkout all render identical numbers from the one
 * memoised selector computed by the parent.
 */
export function CartSummary({
  totals,
  className,
  compact = false,
}: {
  totals: CartTotals;
  className?: string;
  compact?: boolean;
}) {
  const progress = Math.min(100, (totals.subtotal / COMMERCE.freeShippingThreshold) * 100);

  return (
    <div className={cn("space-y-3", className)}>
      {totals.freeShippingRemaining > 0 && totals.itemCount > 0 && (
        <div className="rounded-xl bg-brand-600/8 p-3">
          <p className="flex items-center gap-2 text-xs text-foreground">
            <TbTruck className="size-4 text-brand-600" aria-hidden />
            Add{" "}
            <span className="font-semibold">{formatCurrency(totals.freeShippingRemaining)}</span> more for free
            shipping
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-brand-600/15">
            <div className="h-full rounded-pill bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal ({totals.itemCount} items)</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</dd>
        </div>

        {totals.savings > 0 && (
          <div className="flex justify-between text-success-600">
            <dt>Discounts</dt>
            <dd className="font-medium tabular-nums">-{formatCurrency(totals.savings)}</dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="font-medium tabular-nums">
            {totals.shipping === 0 ? (
              <span className="text-success-600">Free</span>
            ) : (
              formatCurrency(totals.shipping)
            )}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-muted">Estimated tax</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(totals.tax)}</dd>
        </div>

        <div
          className={cn(
            "flex items-baseline justify-between border-t border-[var(--border)] pt-3",
            compact ? "text-base" : "text-lg",
          )}
        >
          <dt className="font-semibold">Total</dt>
          <dd className="font-display font-semibold tabular-nums">{formatCurrency(totals.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
