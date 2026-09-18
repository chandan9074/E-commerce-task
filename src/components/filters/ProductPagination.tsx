"use client";

import { Pagination } from "@/components/ui/Pagination";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { PaginationMeta } from "@/types";

/**
 * Connects the presentational `Pagination` to URL state.
 *
 * Page changes are `router.push`es, so every page is a real, shareable,
 * refresh-safe URL - and the grid itself is still rendered on the server.
 */
export function ProductPagination({ pagination }: { pagination: PaginationMeta }) {
  const { setPage, isPending } = useProductFilters();

  return <Pagination pagination={pagination} onPageChange={setPage} disabled={isPending} className="pt-4" />;
}
