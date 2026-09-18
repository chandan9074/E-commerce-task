"use client";

import { memo } from "react";
import { TbMinus, TbPlus } from "react-icons/tb";

import { cn } from "@/lib/utils/cn";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

/**
 * Memoised: cart rows re-render whenever any line changes, but a stepper only
 * needs to repaint when its own value or bounds move.
 */
export const QuantityStepper = memo(function QuantityStepper({
  value,
  min = 1,
  max,
  onIncrement,
  onDecrement,
  size = "md",
  label = "Quantity",
  className,
}: QuantityStepperProps) {
  const dimension = size === "sm" ? "size-8" : "size-10";

  return (
    <div
      className={cn("inline-flex items-center rounded-pill border border-[var(--border)] bg-surface", className)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          dimension,
          "grid place-items-center rounded-pill text-muted transition-colors hover:text-foreground disabled:opacity-40",
        )}
      >
        <TbMinus className="size-4" aria-hidden />
      </button>

      <span
        className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          dimension,
          "grid place-items-center rounded-pill text-muted transition-colors hover:text-foreground disabled:opacity-40",
        )}
      >
        <TbPlus className="size-4" aria-hidden />
      </button>
    </div>
  );
});
