"use client";

import { useEffect, useRef, useState } from "react";
import { TbSearch, TbX } from "react-icons/tb";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProductFilters } from "@/hooks/useProductFilters";
import { cn } from "@/lib/utils/cn";

/**
 * The input is a local draft, the URL is the committed value. `lastCommitted`
 * stops the two effects fighting: one pushes the debounced draft into the URL,
 * the other pulls external URL changes back into the draft.
 */
export function ProductSearchInput({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const { query, setSearch } = useProductFilters();
  const [term, setTerm] = useState(query.search);
  const debounced = useDebouncedValue(term, 350);
  const lastCommitted = useRef(query.search);

  useEffect(() => {
    if (debounced === lastCommitted.current) return;
    lastCommitted.current = debounced;
    setSearch(debounced);
  }, [debounced, setSearch]);

  useEffect(() => {
    if (query.search === lastCommitted.current) return;
    lastCommitted.current = query.search;
    setTerm(query.search);
  }, [query.search]);

  return (
    <div className={cn("relative", className)}>
      <TbSearch className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={term}
        autoFocus={autoFocus}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search 500+ products"
        aria-label="Search products"
        className="w-full rounded-pill border border-[var(--border)] bg-surface py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-muted/70 focus:border-brand-500"
      />
      {term && (
        <button
          type="button"
          onClick={() => setTerm("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
        >
          <TbX className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
