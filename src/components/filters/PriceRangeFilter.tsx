"use client";

import { memo, useCallback, useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: { min: number | null; max: number | null };
  onApply: (min: number | null, max: number | null) => void;
}

const QUICK_RANGES = [
  { label: "Under $50", min: null, max: 50 },
  { label: "$50 - $150", min: 50, max: 150 },
  { label: "$150 - $400", min: 150, max: 400 },
  { label: "$400+", min: 400, max: null },
];

/**
 * The inputs are a local draft committed on submit, so typing does not fire a
 * navigation per keystroke. The effect re-syncs the draft when the URL changes
 * elsewhere - a chip removed, clear all, or the back button.
 */
export const PriceRangeFilter = memo(function PriceRangeFilter({
  min,
  max,
  value,
  onApply,
}: PriceRangeFilterProps) {
  const [draft, setDraft] = useState({ min: value.min?.toString() ?? "", max: value.max?.toString() ?? "" });

  useEffect(() => {
    setDraft({ min: value.min?.toString() ?? "", max: value.max?.toString() ?? "" });
  }, [value.min, value.max]);

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const nextMin = draft.min === "" ? null : Number(draft.min);
      const nextMax = draft.max === "" ? null : Number(draft.max);
      onApply(
        Number.isFinite(nextMin) ? nextMin : null,
        Number.isFinite(nextMax) ? nextMax : null,
      );
    },
    [draft, onApply],
  );

  const inputClasses =
    "w-full rounded-lg border border-[var(--border)] bg-surface px-2.5 py-2 text-sm tabular-nums placeholder:text-muted/60 focus:border-brand-500";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="price-min">
          Minimum price
        </label>
        <input
          id="price-min"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={formatCurrency(min).replace(".00", "")}
          value={draft.min}
          onChange={(event) => setDraft((state) => ({ ...state, min: event.target.value }))}
          className={inputClasses}
        />
        <span className="text-muted" aria-hidden>
          &ndash;
        </span>
        <label className="sr-only" htmlFor="price-max">
          Maximum price
        </label>
        <input
          id="price-max"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={formatCurrency(max).replace(".00", "")}
          value={draft.max}
          onChange={(event) => setDraft((state) => ({ ...state, max: event.target.value }))}
          className={inputClasses}
        />
        <Button type="submit" size="sm" variant="secondary" className="shrink-0">
          Go
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_RANGES.map((range) => {
          const active = value.min === range.min && value.max === range.max;
          return (
            <button
              key={range.label}
              type="button"
              onClick={() => onApply(range.min, range.max)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-pill bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                  : "rounded-pill border border-[var(--border)] px-2.5 py-1 text-xs text-muted transition-colors hover:border-brand-400 hover:text-brand-600"
              }
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </form>
  );
});
