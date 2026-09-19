"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { TbCheck, TbShoppingBagPlus } from "react-icons/tb";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils/cn";
import type { CartLineInput } from "@/types";

interface AddToCartButtonProps {
  product: CartLineInput;
  quantity?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  openDrawer?: boolean;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

/**
 * Memoised: a grid renders one per card, and the product snapshot they take
 * as props does not change between navigations.
 */
export const AddToCartButton = memo(function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  size = "md",
  openDrawer = true,
  label = "Add to cart",
  className,
  iconOnly = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.stock <= 0;

  const handleClick = useCallback(() => {
    if (soldOut) return;
    addItem(product, quantity, { openDrawer });
    setJustAdded(true);
  }, [addItem, openDrawer, product, quantity, soldOut]);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  return (
    <Button
      variant={justAdded ? "accent" : variant}
      size={iconOnly ? "icon" : size}
      onClick={handleClick}
      disabled={soldOut}
      aria-label={iconOnly ? `${label}: ${product.title}` : undefined}
      className={cn("transition-all", className)}
    >
      {justAdded ? (
        <TbCheck className="size-4 shrink-0" aria-hidden />
      ) : (
        <TbShoppingBagPlus className="size-4 shrink-0" aria-hidden />
      )}
      {!iconOnly && <span>{soldOut ? "Sold out" : justAdded ? "Added" : label}</span>}
    </Button>
  );
});
