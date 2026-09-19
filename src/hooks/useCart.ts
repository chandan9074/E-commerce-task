"use client";

import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cartCleared,
  itemAdded,
  itemRemoved,
  quantityDecremented,
  quantityIncremented,
  quantitySet,
} from "@/store/slices/cart.slice";
import { cartDrawerOpened } from "@/store/slices/ui.slice";
import {
  selectCartHydrated,
  selectCartItems,
  selectCartTotals,
} from "@/store/selectors/cart.selectors";
import type { CartLineInput } from "@/types";

/**
 * Cart facade so components do not import actions directly. The callbacks are
 * reference-stable, so the memoised rows and buttons can skip re-renders.
 */
export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const hydrated = useAppSelector(selectCartHydrated);

  const addItem = useCallback(
    (product: CartLineInput, quantity = 1, options: { openDrawer?: boolean } = {}) => {
      dispatch(itemAdded(product, quantity));
      if (options.openDrawer !== false) dispatch(cartDrawerOpened());
    },
    [dispatch],
  );

  const removeItem = useCallback((id: string) => dispatch(itemRemoved(id)), [dispatch]);
  const increment = useCallback((id: string) => dispatch(quantityIncremented(id)), [dispatch]);
  const decrement = useCallback((id: string) => dispatch(quantityDecremented(id)), [dispatch]);
  const setQuantity = useCallback(
    (id: string, quantity: number) => dispatch(quantitySet({ id, quantity })),
    [dispatch],
  );
  const clear = useCallback(() => dispatch(cartCleared()), [dispatch]);

  return { items, totals, hydrated, addItem, removeItem, increment, decrement, setQuantity, clear };
}
