"use client";

import { memo, useMemo } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

import { cn } from "@/lib/utils/cn";
import type { PaginationMeta } from "@/types";

/** Windowed page list: 1 … 4 5 [6] 7 8 … 22 */
function buildPageList(page: number, totalPages: number, window = 1): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, page]);
  for (let offset = 1; offset <= window; offset += 1) {
    if (page - offset > 1) pages.add(page - offset);
    if (page + offset < totalPages) pages.add(page + offset);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - (sorted[index - 1] as number) > 1) result.push("gap");
    result.push(value);
  });

  return result;
}

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export const Pagination = memo(function Pagination({
  pagination,
  onPageChange,
  disabled,
  className,
}: PaginationProps) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  const stepClasses =
    "grid size-10 place-items-center rounded-pill border border-[var(--border)] text-muted transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-muted";

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Pagination">
      <button
        type="button"
        className={stepClasses}
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage || disabled}
        aria-label="Previous page"
      >
        <TbChevronLeft className="size-4" aria-hidden />
      </button>

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted" aria-hidden>
            &hellip;
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            disabled={disabled}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-pill text-sm font-medium transition-colors",
              entry === page
                ? "bg-brand-600 text-white"
                : "border border-[var(--border)] text-muted hover:border-brand-400 hover:text-brand-600",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        className={stepClasses}
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage || disabled}
        aria-label="Next page"
      >
        <TbChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
});
