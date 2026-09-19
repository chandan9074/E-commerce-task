"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback } from "react";
import { TbTrash } from "react-icons/tb";

import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { COMMERCE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { CartItem } from "@/types";

interface CartLineItemProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
  onNavigate?: () => void;
}

/**
 * Handlers take the id rather than closing over it, so every row gets the same
 * function instances and `memo` can skip the rows that did not change.
 */
export const CartLineItem = memo(function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  compact = false,
  onNavigate,
}: CartLineItemProps) {
  const increment = useCallback(() => onIncrement(item.id), [onIncrement, item.id]);
  const decrement = useCallback(() => onDecrement(item.id), [onDecrement, item.id]);
  const remove = useCallback(() => onRemove(item.id), [onRemove, item.id]);

  const lineTotal = item.price * item.quantity;
  const maxQuantity = Math.min(item.stock, COMMERCE.maxQuantityPerLine);

  return (
    <li className={cn("flex gap-4", compact ? "py-4" : "py-5")}>
      <Link
        href={`/products/${item.slug}`}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-surface-muted",
          compact ? "size-20" : "size-24 sm:size-28",
        )}
      >
        <Image src={item.thumbnail} alt={item.title} fill sizes="112px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{item.brand}</p>
            <h3 className="truncate text-sm font-medium text-foreground">
              <Link href={`/products/${item.slug}`} onClick={onNavigate} className="hover:text-brand-600">
                {item.title}
              </Link>
            </h3>
          </div>

          <button
            type="button"
            onClick={remove}
            aria-label={`Remove ${item.title} from cart`}
            className="shrink-0 rounded-pill p-1.5 text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600"
          >
            <TbTrash className="size-4" aria-hidden />
          </button>
        </div>

        {item.stock <= 5 && item.stock > 0 && (
          <p className="text-xs font-medium text-accent-600">Only {item.stock} left in stock</p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={item.quantity}
            max={maxQuantity}
            onIncrement={increment}
            onDecrement={decrement}
            size="sm"
            label={`Quantity for ${item.title}`}
          />

          <div className="text-right">
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatCurrency(lineTotal, item.currency)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted tabular-nums">{formatCurrency(item.price, item.currency)} each</p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
});
