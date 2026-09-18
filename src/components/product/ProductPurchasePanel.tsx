"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { TbCreditCard } from "react-icons/tb";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/hooks/useCart";
import { COMMERCE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import type { CartLineInput } from "@/types";

/**
 * Quantity + buy actions on the product page.
 *
 * The smallest possible client island: everything else on the page (gallery
 * aside) is server-rendered. Quantity is local state - it is a draft until the
 * user commits it to the cart.
 */
export function ProductPurchasePanel({ product }: { product: CartLineInput }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = Math.min(product.stock, COMMERCE.maxQuantityPerLine);
  const soldOut = product.stock <= 0;

  const increment = useCallback(() => setQuantity((value) => Math.min(value + 1, maxQuantity)), [maxQuantity]);
  const decrement = useCallback(() => setQuantity((value) => Math.max(1, value - 1)), []);

  const lineTotal = useMemo(() => product.price * quantity, [product.price, quantity]);

  const buyNow = useCallback(() => {
    if (soldOut) return;
    addItem(product, quantity, { openDrawer: false });
    router.push("/checkout");
  }, [addItem, product, quantity, router, soldOut]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          max={Math.max(1, maxQuantity)}
          onIncrement={increment}
          onDecrement={decrement}
        />
        {quantity > 1 && (
          <p className="text-sm text-muted">
            Total <span className="font-semibold text-foreground">{formatCurrency(lineTotal, product.currency)}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <AddToCartButton product={product} quantity={quantity} size="lg" className="flex-1" />
        <Button variant="outline" size="lg" onClick={buyNow} disabled={soldOut} className="flex-1">
          <TbCreditCard className="size-4" aria-hidden />
          Buy now
        </Button>
      </div>
    </div>
  );
}
