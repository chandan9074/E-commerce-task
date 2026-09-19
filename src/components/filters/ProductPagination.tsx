"use client";

import { Pagination } from "@/components/ui/Pagination";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { PaginationMeta } from "@/types";

/** Connects `Pagination` to the URL, so every page is a real address. */
export function ProductPagination({ pagination }: { pagination: PaginationMeta }) {
  const { setPage, isPending } = useProductFilters();

  return <Pagination pagination={pagination} onPageChange={setPage} disabled={isPending} className="pt-4" />;
}
