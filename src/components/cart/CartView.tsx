"use client";

import Link from "next/link";
import { TbArrowLeft, TbLock, TbShoppingBag, TbTrash } from "react-icons/tb";

import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";
import { buttonClasses, Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { useCart } from "@/hooks/useCart";

/**
 * Cart page body.
 *
 * Client-side because the cart lives in the browser (Redux + localStorage).
 * Until `hydrated` flips, it renders skeletons rather than an empty cart -
 * showing "your cart is empty" for a frame to someone who has items in it is
 * the classic persisted-state hydration bug.
 */
export function CartView() {
  const { items, totals, hydrated, increment, decrement, removeItem, clear } = useCart();

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<TbShoppingBag className="size-7" aria-hidden />}
        title="Your cart is empty"
        description="Nothing here yet. Browse the catalogue - anything you add is saved on this device, so it will still be here tomorrow."
        action={
          <Link href="/products" className={buttonClasses("primary")}>
            Start shopping
          </Link>
        }
        className="mx-auto max-w-2xl"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section aria-label="Cart items">
        <div className="surface-card px-5">
          <ul className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onIncrement={increment}
                onDecrement={decrement}
                onRemove={removeItem}
              />
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <TbArrowLeft className="size-4" aria-hidden />
            Continue shopping
          </Link>

          <Button variant="ghost" size="sm" onClick={clear}>
            <TbTrash className="size-4" aria-hidden />
            Clear cart
          </Button>
        </div>
      </section>

      <aside aria-label="Order summary">
        <div className="surface-card sticky top-28 space-y-4 p-5">
          <h2 className="text-base font-semibold">Order summary</h2>

          <CartSummary totals={totals} />

          <Link href="/checkout" className={buttonClasses("primary", "lg", "w-full")}>
            <TbLock className="size-4" aria-hidden />
            Proceed to checkout
          </Link>

          <p className="text-center text-xs text-muted">
            Taxes and shipping are estimated. This is a demo store - no payment is taken.
          </p>
        </div>
      </aside>
    </div>
  );
}
