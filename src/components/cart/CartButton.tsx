"use client";

import { useCallback } from "react";
import { TbShoppingBag } from "react-icons/tb";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCartItemCount } from "@/store/selectors/cart.selectors";
import { cartDrawerToggled } from "@/store/slices/ui.slice";

/**
 * Subscribes to the item count only, so the header does not re-render when
 * anything else in the cart changes.
 */
export function CartButton() {
  const count = useAppSelector(selectCartItemCount);
  const dispatch = useAppDispatch();

  const toggle = useCallback(() => dispatch(cartDrawerToggled()), [dispatch]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
      className="relative grid size-10 place-items-center rounded-pill text-foreground transition-colors hover:bg-surface-muted"
    >
      <TbShoppingBag className="size-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] leading-5 font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
