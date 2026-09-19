"use client";

import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  buildProductsHref,
  countActiveFilters,
  DEFAULT_QUERY,
  parseProductQuery,
} from "@/helpers/product-query.helpers";
import type { ProductQuery, SortOption } from "@/types";

/**
 * Reads and writes the filter state in the URL - there is no `useState` copy
 * of it. Mutations run in a transition so results stay interactive while the
 * next page renders.
 */
export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = useMemo(() => parseProductQuery(searchParams), [searchParams]);

  const targetPath = pathname.startsWith("/products") && !pathname.includes("/products/") ? pathname : "/products";

  // Latest-value refs, written from an effect, so the mutators below can stay
  // reference-stable while still reading the current query.
  const queryRef = useRef(query);
  const pathRef = useRef(targetPath);

  useEffect(() => {
    queryRef.current = query;
    pathRef.current = targetPath;
  });

  /** Applies a patch, resetting to page 1 unless the patch sets the page. */
  const update = useCallback(
    (patch: Partial<ProductQuery>, options: { resetPage?: boolean; scroll?: boolean } = {}) => {
      const { resetPage = patch.page === undefined, scroll = false } = options;
      const next: ProductQuery = { ...queryRef.current, ...patch, ...(resetPage ? { page: 1 } : null) };

      startTransition(() => {
        router.push(buildProductsHref(next, pathRef.current), { scroll });
      });
    },
    [router],
  );

  const toggleInArray = useCallback(
    (key: "category" | "brand", value: string) => {
      const current = queryRef.current[key];
      const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
      update({ [key]: next } as Partial<ProductQuery>);
    },
    [update],
  );

  const setSearch = useCallback((search: string) => update({ search }), [update]);
  const toggleCategory = useCallback((value: string) => toggleInArray("category", value), [toggleInArray]);
  const toggleBrand = useCallback((value: string) => toggleInArray("brand", value), [toggleInArray]);

  const setPriceRange = useCallback(
    (minPrice: number | null, maxPrice: number | null) => update({ minPrice, maxPrice }),
    [update],
  );

  const setRating = useCallback(
    (minRating: number | null) =>
      update({ minRating: queryRef.current.minRating === minRating ? null : minRating }),
    [update],
  );

  const toggleInStock = useCallback(() => update({ inStockOnly: !queryRef.current.inStockOnly }), [update]);
  const toggleOnSale = useCallback(() => update({ onSaleOnly: !queryRef.current.onSaleOnly }), [update]);
  const setSort = useCallback((sort: SortOption) => update({ sort }), [update]);
  const setLimit = useCallback((limit: number) => update({ limit }), [update]);

  // Page changes scroll to the top; filter changes do not.
  const setPage = useCallback((page: number) => update({ page }, { resetPage: false, scroll: true }), [update]);

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathRef.current, { scroll: false }));
  }, [router]);

  const clearFilter = useCallback(
    (key: keyof ProductQuery, value?: string) => {
      if ((key === "category" || key === "brand") && value) {
        update({ [key]: queryRef.current[key].filter((entry) => entry !== value) } as Partial<ProductQuery>);
        return;
      }
      if (key === "minPrice" || key === "maxPrice") {
        update({ minPrice: null, maxPrice: null });
        return;
      }
      update({ [key]: DEFAULT_QUERY[key] } as Partial<ProductQuery>);
    },
    [update],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(query), [query]);

  return {
    query,
    activeFilterCount,
    isPending,
    setSearch,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setRating,
    toggleInStock,
    toggleOnSale,
    setSort,
    setPage,
    setLimit,
    clearAll,
    clearFilter,
  };
}

export type ProductFiltersApi = ReturnType<typeof useProductFilters>;
