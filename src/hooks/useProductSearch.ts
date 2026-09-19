"use client";

import { useMemo } from "react";

import { useApiResource } from "./useApiResource";
import { useDebouncedValue } from "./useDebouncedValue";
import { productService } from "@/services";
import type { ProductSummary } from "@/types";

const MIN_TERM_LENGTH = 2;

/** Debounced product search for the header suggestions. */
export function useProductSearch(term: string, limit = 6) {
  const debouncedTerm = useDebouncedValue(term.trim(), 280);
  const enabled = debouncedTerm.length >= MIN_TERM_LENGTH;

  const resource = useApiResource(
    ({ signal }) => productService.search(debouncedTerm, limit, { signal }),
    [debouncedTerm, limit],
    { enabled, keepPreviousData: true },
  );

  const suggestions: ProductSummary[] = useMemo(() => resource.data?.items ?? [], [resource.data]);

  return {
    ...resource,
    term: debouncedTerm,
    enabled,
    suggestions,
    total: resource.data?.pagination.total ?? 0,
    isEmpty: resource.status === "success" && suggestions.length === 0,
  };
}
