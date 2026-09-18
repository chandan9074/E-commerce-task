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
 * Cart facade.
 *
 * Components dispatch through these callbacks instead of importing actions, so
 * the store shape stays an implementation detail. Every callback is
 * `useCallback`-stable (dispatch never changes identity), which is what allows
 * `ProductCard` to be a `React.memo` component that does not re-render when an
 * unrelated line in the cart changes.
 *
 * Read `totals` only where you need it - the header badge subscribes to the
 * count selector instead, so adding an item does not re-render the whole page.
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
