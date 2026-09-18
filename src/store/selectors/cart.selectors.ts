import { createSelector } from "@reduxjs/toolkit";

import { computeTotals } from "@/helpers/cart.helpers";
import type { RootState } from "@/store";

/**
 * Memoised cart selectors.
 *
 * `selectCartTotals` is the expensive one - it is derived from every line, and
 * the header, the drawer, the cart page and checkout all read it on every
 * render. `createSelector` means the arithmetic runs once per cart change
 * instead of once per subscriber per render.
 */

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartHydrated = (state: RootState) => state.cart.hydrated;
export const selectLastAddedId = (state: RootState) => state.cart.lastAddedId;

export const selectCartTotals = createSelector([selectCartItems], computeTotals);

/** Scalar selector for the header badge: re-renders only when the count changes. */
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

export const selectCartIsEmpty = createSelector([selectCartItems], (items) => items.length === 0);

/** Lookup map so a card can answer "is this in the cart?" without scanning. */
export const selectCartQuantityById = createSelector([selectCartItems], (items) => {
  const map: Record<string, number> = {};
  for (const item of items) map[item.id] = item.quantity;
  return map;
});

export const makeSelectCartQuantity = (productId: string) =>
  createSelector([selectCartItems], (items) => items.find((item) => item.id === productId)?.quantity ?? 0);
