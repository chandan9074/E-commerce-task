"use client";

import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import { TbChevronDown, TbSearch } from "react-icons/tb";

import { PriceRangeFilter } from "./PriceRangeFilter";
import { Rating } from "@/components/ui/Rating";
import { useProductFilters } from "@/hooks/useProductFilters";
import { cn } from "@/lib/utils/cn";
import { formatCompact } from "@/lib/utils/format";
import type { ProductFacets } from "@/types";

/* ---------------------------------------------------------------- pieces -- */

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[var(--border)] py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <TbChevronDown
          className={cn("size-4 text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

interface OptionRowProps {
  label: string;
  count: number;
  checked: boolean;
  value: string;
  onToggle: (value: string) => void;
}

/**
 * Memoised option row.
 *
 * A category list re-renders on every URL change; without `memo` all ~32 brand
 * rows would repaint when one checkbox flips. `onToggle` comes from
 * `useProductFilters` and is `useCallback`-stable, so the memo actually holds.
 */
const OptionRow = memo(function OptionRow({ label, count, checked, value, onToggle }: OptionRowProps) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(value)}
          className="size-4 shrink-0 cursor-pointer rounded border-[var(--border-strong)] accent-brand-600"
        />
        <span className={cn("flex-1 truncate", checked ? "font-medium text-foreground" : "text-muted")}>
          {label}
        </span>
        <span className="text-xs text-muted tabular-nums">{formatCompact(count)}</span>
      </label>
    </li>
  );
});

/* ----------------------------------------------------------------- panel -- */

export function FilterPanel({
  facets,
  className,
  /** The drawer supplies its own "Filters" title, so it hides this one. */
  hideHeading = false,
}: {
  facets: ProductFacets;
  className?: string;
  hideHeading?: boolean;
}) {
  const {
    query,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setRating,
    toggleInStock,
    toggleOnSale,
    clearAll,
    activeFilterCount,
  } = useProductFilters();

  const [brandTerm, setBrandTerm] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Filtering 32 brands is cheap, but it runs on every keystroke *and* every
  // URL change - memoising keeps it tied to the two inputs that matter.
  const visibleBrands = useMemo(() => {
    const term = brandTerm.trim().toLowerCase();
    const matched = term ? facets.brands.filter((brand) => brand.label.toLowerCase().includes(term)) : facets.brands;
    return showAllBrands ? matched : matched.slice(0, 8);
  }, [facets.brands, brandTerm, showAllBrands]);

  const priceValue = useMemo(
    () => ({ min: query.minPrice, max: query.maxPrice }),
    [query.minPrice, query.maxPrice],
  );

  const onPriceApply = useCallback(
    (min: number | null, max: number | null) => setPriceRange(min, max),
    [setPriceRange],
  );

  return (
    <aside className={cn("w-full", className)} aria-label="Product filters">
      <div className={cn("flex items-center pb-2", hideHeading ? "justify-end" : "justify-between")}>
        {!hideHeading && (
          <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">Filters</h2>
        )}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Availability">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={query.inStockOnly}
              onChange={toggleInStock}
              className="size-4 cursor-pointer rounded border-[var(--border-strong)] accent-brand-600"
            />
            In stock only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={query.onSaleOnly}
              onChange={toggleOnSale}
              className="size-4 cursor-pointer rounded border-[var(--border-strong)] accent-brand-600"
            />
            On sale
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <ul className="space-y-0.5">
          {facets.categories.map((bucket) => (
            <OptionRow
              key={bucket.value}
              value={bucket.value}
              label={bucket.label}
              count={bucket.count}
              checked={query.category.includes(bucket.value)}
              onToggle={toggleCategory}
            />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Price">
        <PriceRangeFilter
          min={facets.priceRange.min}
          max={facets.priceRange.max}
          value={priceValue}
          onApply={onPriceApply}
        />
      </FilterSection>

      <FilterSection title="Rating">
        <ul className="space-y-0.5">
          {facets.ratings.map((bucket) => {
            const threshold = Number(bucket.value);
            const active = query.minRating === threshold;
            return (
              <li key={bucket.value}>
                <button
                  type="button"
                  onClick={() => setRating(threshold)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors",
                    active ? "bg-brand-600/10 text-foreground" : "hover:bg-surface-muted",
                  )}
                >
                  <Rating value={threshold} size="sm" showValue={false} />
                  <span className="text-muted">&amp; up</span>
                  <span className="ml-auto text-xs text-muted tabular-nums">{formatCompact(bucket.count)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Brand" defaultOpen={false}>
        <div className="relative mb-2">
          <TbSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={brandTerm}
            onChange={(event) => setBrandTerm(event.target.value)}
            placeholder="Search brands"
            aria-label="Search brands"
            className="w-full rounded-lg border border-[var(--border)] bg-surface py-2 pr-2.5 pl-8 text-sm placeholder:text-muted/60 focus:border-brand-500"
          />
        </div>

        <ul className="max-h-64 space-y-0.5 overflow-y-auto">
          {visibleBrands.map((bucket) => (
            <OptionRow
              key={bucket.value}
              value={bucket.value}
              label={bucket.label}
              count={bucket.count}
              checked={query.brand.includes(bucket.value)}
              onToggle={toggleBrand}
            />
          ))}
        </ul>

        {!showAllBrands && facets.brands.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllBrands(true)}
            className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Show all {facets.brands.length} brands
          </button>
        )}
      </FilterSection>
    </aside>
  );
}
