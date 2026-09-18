import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import {
  cartCleared,
  cartHydrated,
  itemAdded,
  itemRemoved,
  quantityDecremented,
  quantityIncremented,
  quantitySet,
} from "@/store/slices/cart.slice";
import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartItem } from "@/types";
import type { RootState } from "@/store";

/**
 * Cart persistence.
 *
 * Implemented as a listener middleware rather than a `useEffect` in a
 * component: persistence is a side effect of *state changing*, not of anything
 * rendering, so tying it to the store means it works no matter which component
 * dispatched - and never re-runs because a parent re-rendered.
 */
export const cartPersistenceMiddleware = createListenerMiddleware();

cartPersistenceMiddleware.startListening({
  matcher: isAnyOf(itemAdded, itemRemoved, quantitySet, quantityIncremented, quantityDecremented, cartCleared),
  effect: (_action, api) => {
    if (typeof window === "undefined") return;

    const { cart } = api.getState() as RootState;
    // Do not write before hydration, or an empty initial state would wipe a saved cart.
    if (!cart.hydrated) return;

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ version: 1, savedAt: Date.now(), items: cart.items }),
      );
    } catch {
      // Private mode / quota exceeded - the cart still works for this session.
    }
  },
});

interface PersistedCart {
  version: number;
  savedAt: number;
  items: CartItem[];
}

/** Reads and validates the saved cart. Bad data is discarded, never thrown. */
export function readPersistedCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as PersistedCart;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.items)) return [];

    return parsed.items.filter(
      (item): item is CartItem =>
        typeof item?.id === "string" &&
        typeof item?.slug === "string" &&
        typeof item?.price === "number" &&
        typeof item?.quantity === "number" &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export { cartHydrated };
