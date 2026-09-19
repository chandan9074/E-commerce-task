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
 * Saves the cart to localStorage on every mutation. A listener middleware
 * rather than a component effect, so it runs on state change, not on render.
 */
export const cartPersistenceMiddleware = createListenerMiddleware();

cartPersistenceMiddleware.startListening({
  matcher: isAnyOf(itemAdded, itemRemoved, quantitySet, quantityIncremented, quantityDecremented, cartCleared),
  effect: (_action, api) => {
    if (typeof window === "undefined") return;

    const { cart } = api.getState() as RootState;
    // Writing before hydration would overwrite the saved cart with an empty one.
    if (!cart.hydrated) return;

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ version: 1, savedAt: Date.now(), items: cart.items }),
      );
    } catch {
      // Private mode or quota exceeded.
    }
  },
});

interface PersistedCart {
  version: number;
  savedAt: number;
  items: CartItem[];
}

/** Reads the saved cart, discarding anything malformed. */
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
