"use client";

import Image from "next/image";
import { memo } from "react";

import { CartSummary } from "@/components/cart/CartSummary";
import { formatCurrency } from "@/lib/utils/format";
import type { CartItem, CartTotals } from "@/types";

/**
 * Read-only order recap beside the form.
 *
 * `memo` keeps it out of the form's render path entirely: typing in any field
 * re-renders only that field, and this panel repaints only if the cart changes.
 */
export const CheckoutOrderSummary = memo(function CheckoutOrderSummary({
  items,
  totals,
}: {
  items: CartItem[];
  totals: CartTotals;
}) {
  return (
    <aside aria-label="Order summary" className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
      <div className="surface-card space-y-4 p-5">
        <h2 className="text-base font-semibold">Order summary</h2>

        <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                <Image src={item.thumbnail} alt="" fill sizes="56px" className="object-cover" />
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                  {item.quantity}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block text-xs text-muted">{item.brand}</span>
              </span>

              <span className="text-sm font-medium tabular-nums">
                {formatCurrency(item.price * item.quantity, item.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--border)] pt-4">
          <CartSummary totals={totals} />
        </div>
      </div>
    </aside>
  );
});
