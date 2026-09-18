"use client";

import Link from "next/link";
import { useCallback } from "react";
import { TbShoppingBag } from "react-icons/tb";

import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { useCart } from "@/hooks/useCart";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cartDrawerClosed } from "@/store/slices/ui.slice";
import { Drawer } from "@/components/ui/Drawer";

/** Slide-over cart, mounted once in the layout and opened from anywhere. */
export function CartDrawer() {
  const open = useAppSelector((state) => state.ui.cartDrawerOpen);
  const dispatch = useAppDispatch();
  const { items, totals, increment, decrement, removeItem } = useCart();

  const close = useCallback(() => dispatch(cartDrawerClosed()), [dispatch]);

  return (
    <Drawer
      open={open}
      onClose={close}
      title={`Your cart${totals.itemCount > 0 ? ` (${totals.itemCount})` : ""}`}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <CartSummary totals={totals} compact />
            <div className="flex gap-2">
              <Link href="/cart" onClick={close} className={buttonClasses("outline", "md", "flex-1")}>
                View cart
              </Link>
              <Link href="/checkout" onClick={close} className={buttonClasses("primary", "md", "flex-1")}>
                Checkout
              </Link>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<TbShoppingBag className="size-7" aria-hidden />}
            title="Your cart is empty"
            description="Browse the catalogue and add something you like - it will still be here when you come back."
            action={
              <Link href="/products" onClick={close} className={buttonClasses("primary")}>
                Start shopping
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)] px-5">
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              compact
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={removeItem}
              onNavigate={close}
            />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
