import { createSelector } from "@reduxjs/toolkit";

import { computeTotals } from "@/helpers/cart.helpers";
import type { RootState } from "@/store";

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartHydrated = (state: RootState) => state.cart.hydrated;
export const selectLastAddedId = (state: RootState) => state.cart.lastAddedId;

// Read by the header, drawer, cart page and checkout - memoised so the
// arithmetic runs once per cart change, not once per subscriber per render.
export const selectCartTotals = createSelector([selectCartItems], computeTotals);

/** Used by the header badge, which only cares about the count. */
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

export const selectCartIsEmpty = createSelector([selectCartItems], (items) => items.length === 0);

/** Quantity by product id, for lookups without scanning the array. */
export const selectCartQuantityById = createSelector([selectCartItems], (items) => {
  const map: Record<string, number> = {};
  for (const item of items) map[item.id] = item.quantity;
  return map;
});

export const makeSelectCartQuantity = (productId: string) =>
  createSelector([selectCartItems], (items) => items.find((item) => item.id === productId)?.quantity ?? 0);
