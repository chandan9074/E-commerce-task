"use client";

import { TbAdjustmentsHorizontal, TbLoader2 } from "react-icons/tb";

import { useProductFilters } from "@/hooks/useProductFilters";
import { PAGINATION, SORT_LABELS } from "@/lib/constants";
import { SORT_OPTIONS, type PaginationMeta, type SortOption } from "@/types";
import { useAppDispatch } from "@/store/hooks";
import { mobileFiltersToggled } from "@/store/slices/ui.slice";

/** Result count, sort, page size and the mobile filter trigger. */
export function ResultsToolbar({ pagination }: { pagination: PaginationMeta }) {
  const { query, setSort, setLimit, activeFilterCount, isPending } = useProductFilters();
  const dispatch = useAppDispatch();

  const first = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const last = Math.min(pagination.page * pagination.limit, pagination.total);

  const selectClasses =
    "rounded-pill border border-[var(--border)] bg-surface px-3 py-2 text-sm text-foreground focus:border-brand-500";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
        {isPending && <TbLoader2 className="size-4 animate-spin text-brand-500" aria-hidden />}
        {pagination.total > 0 ? (
          <>
            Showing <span className="font-medium text-foreground">{first}</span>&ndash;
            <span className="font-medium text-foreground">{last}</span> of{" "}
            <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> products
          </>
        ) : (
          "No products match these filters"
        )}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch(mobileFiltersToggled(true))}
          className="inline-flex items-center gap-2 rounded-pill border border-[var(--border)] px-3.5 py-2 text-sm font-medium lg:hidden"
        >
          <TbAdjustmentsHorizontal className="size-4" aria-hidden />
          Filters
          {activeFilterCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <label className="sr-only" htmlFor="sort-select">
          Sort products
        </label>
        <select
          id="sort-select"
          value={query.sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className={selectClasses}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="limit-select">
          Products per page
        </label>
        <select
          id="limit-select"
          value={query.limit}
          onChange={(event) => setLimit(Number(event.target.value))}
          className={`${selectClasses} hidden sm:block`}
        >
          {PAGINATION.limitOptions.map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
