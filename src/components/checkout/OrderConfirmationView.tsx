"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { TbCircleCheckFilled, TbMail, TbTruckDelivery } from "react-icons/tb";

import { buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { ORDER_STORAGE_KEY } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { OrderConfirmation } from "@/types";

function readOrder(): OrderConfirmation | null {
  try {
    const raw = window.sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderConfirmation) : null;
  } catch {
    return null;
  }
}

/**
 * Reads the confirmation from sessionStorage after hydration, then clears it so
 * a refresh or back-navigation cannot resurrect a completed order.
 */
export function OrderConfirmationView() {
  const hydrated = useHydrated();
  const order = useMemo(() => (hydrated ? readOrder() : null), [hydrated]);

  useEffect(() => {
    if (!order) return;
    try {
      window.sessionStorage.removeItem(ORDER_STORAGE_KEY);
    } catch {
      // Storage unavailable.
    }
  }, [order]);

  if (!hydrated) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success-500/12 text-success-600">
        <TbCircleCheckFilled className="size-9" aria-hidden />
      </span>

      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Thank you for your order</h1>
      <p className="mt-2 text-sm text-muted">
        {order
          ? "We have emailed your receipt. You can track the delivery from the link in that email."
          : "Your order was placed successfully."}
      </p>

      {order && (
        <dl className="surface-card mt-8 grid gap-4 p-6 text-left sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-wide text-muted uppercase">Order number</dt>
            <dd className="mt-1 font-mono text-sm font-semibold">{order.orderId}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted uppercase">Order total</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums">
              {formatCurrency(order.total, order.currency)} &middot; {order.itemCount} items
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted uppercase">
              <TbMail className="size-3.5" aria-hidden />
              Confirmation sent to
            </dt>
            <dd className="mt-1 text-sm font-medium break-all">{order.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted uppercase">
              <TbTruckDelivery className="size-3.5" aria-hidden />
              Estimated delivery
            </dt>
            <dd className="mt-1 text-sm font-medium">{formatDate(order.estimatedDelivery)}</dd>
          </div>
        </dl>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/products" className={buttonClasses("primary", "lg")}>
          Continue shopping
        </Link>
        <Link href="/" className={buttonClasses("outline", "lg")}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
