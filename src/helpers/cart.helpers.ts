import { COMMERCE } from "@/lib/constants";
import { roundMoney } from "@/lib/utils/format";
import type { CartItem, CartTotals } from "@/types";

/** Pure pricing rules. The reducer, the selectors and checkout all call these. */

export function clampQuantity(quantity: number, stock: number) {
  const ceiling = Math.max(0, Math.min(COMMERCE.maxQuantityPerLine, stock));
  return Math.max(1, Math.min(Math.trunc(quantity) || 1, ceiling || 1));
}

export function computeTotals(items: CartItem[]): CartTotals {
  let itemCount = 0;
  let subtotal = 0;
  let savings = 0;

  // One pass, not five - this runs on every cart mutation.
  for (const item of items) {
    itemCount += item.quantity;
    subtotal += item.price * item.quantity;
    if (item.compareAtPrice && item.compareAtPrice > item.price) {
      savings += (item.compareAtPrice - item.price) * item.quantity;
    }
  }

  const qualifiesFreeShipping = subtotal >= COMMERCE.freeShippingThreshold || items.every((i) => i.freeShipping);
  const shipping = items.length === 0 || qualifiesFreeShipping ? 0 : COMMERCE.flatShippingRate;
  const tax = subtotal * COMMERCE.taxRate;

  return {
    itemCount,
    lineCount: items.length,
    subtotal: roundMoney(subtotal),
    savings: roundMoney(savings),
    shipping: roundMoney(shipping),
    tax: roundMoney(tax),
    total: roundMoney(subtotal + shipping + tax),
    freeShippingRemaining: roundMoney(Math.max(0, COMMERCE.freeShippingThreshold - subtotal)),
  };
}

export const EMPTY_TOTALS: CartTotals = computeTotals([]);
