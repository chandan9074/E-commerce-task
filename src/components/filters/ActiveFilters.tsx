"use client";

import { memo } from "react";
import { TbX } from "react-icons/tb";

import { useProductFilters } from "@/hooks/useProductFilters";
import { formatCurrency } from "@/lib/utils/format";
import type { ProductFacets, ProductQuery } from "@/types";

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

const ChipButton = memo(function ChipButton({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-600/10 py-1.5 pr-2 pl-3 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-600/20 dark:text-brand-300"
    >
      {label}
      <TbX className="size-3.5" aria-hidden />
      <span className="sr-only">Remove filter</span>
    </button>
  );
});

/** Chips that mirror the URL exactly - what you see is what the server got. */
export function ActiveFilters({ facets }: { facets: ProductFacets }) {
  const { query, activeFilterCount, clearFilter, clearAll } = useProductFilters();

  if (activeFilterCount === 0) return null;

  const labelFor = (buckets: ProductFacets["categories"], value: string) =>
    buckets.find((bucket) => bucket.value === value)?.label ?? value;

  const chips: Chip[] = [];

  if (query.search) {
    chips.push({
      key: "search",
      label: `"${query.search}"`,
      onRemove: () => clearFilter("search" as keyof ProductQuery),
    });
  }

  query.category.forEach((value) =>
    chips.push({
      key: `category-${value}`,
      label: labelFor(facets.categories, value),
      onRemove: () => clearFilter("category", value),
    }),
  );

  query.brand.forEach((value) =>
    chips.push({ key: `brand-${value}`, label: value, onRemove: () => clearFilter("brand", value) }),
  );

  if (query.minPrice !== null || query.maxPrice !== null) {
    const from = query.minPrice !== null ? formatCurrency(query.minPrice) : "Any";
    const to = query.maxPrice !== null ? formatCurrency(query.maxPrice) : "Any";
    chips.push({ key: "price", label: `${from} - ${to}`, onRemove: () => clearFilter("minPrice") });
  }

  if (query.minRating !== null) {
    chips.push({
      key: "rating",
      label: `${query.minRating}★ & up`,
      onRemove: () => clearFilter("minRating"),
    });
  }

  if (query.inStockOnly) {
    chips.push({ key: "stock", label: "In stock", onRemove: () => clearFilter("inStockOnly") });
  }

  if (query.onSaleOnly) {
    chips.push({ key: "sale", label: "On sale", onRemove: () => clearFilter("onSaleOnly") });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <ChipButton key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
