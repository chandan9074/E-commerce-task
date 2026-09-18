import type { Metadata } from "next";
import Link from "next/link";
import { TbSearchOff } from "react-icons/tb";

import { ActiveFilters } from "@/components/filters/ActiveFilters";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { MobileFilterDrawer } from "@/components/filters/MobileFilterDrawer";
import { ProductPagination } from "@/components/filters/ProductPagination";
import { ProductSearchInput } from "@/components/filters/ProductSearchInput";
import { ResultsToolbar } from "@/components/filters/ResultsToolbar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { parseProductQuery } from "@/helpers/product-query.helpers";
import { productRepository } from "@/lib/data/product.repository";
import { SITE } from "@/lib/constants";

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * Listing metadata reflects the active filters, and filtered permutations are
 * marked `noindex` so search engines index the clean category pages rather than
 * thousands of near-duplicate filter URLs.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = parseProductQuery(await searchParams);
  const category = query.category.length === 1 ? productRepository.getCategories().find((c) => c.slug === query.category[0]) : undefined;

  const title = query.search
    ? `Search: ${query.search}`
    : category
      ? `${category.name}`
      : "All products";

  const isFiltered = query.brand.length > 0 || query.minPrice !== null || query.maxPrice !== null || query.minRating !== null || Boolean(query.search);

  return {
    title,
    description: category
      ? `Browse ${category.productCount} ${category.name.toLowerCase()} products at ${SITE.name}, with live filters for brand, price and rating.`
      : SITE.description,
    alternates: { canonical: category ? `/products?category=${category.slug}` : "/products" },
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

/**
 * Product listing - a **Server Component**.
 *
 * `searchParams` is the only source of filter state, so the page is fully
 * rendered on the server for the exact URL requested: shareable, refresh-safe,
 * crawlable, and free of a client-side fetch waterfall on first paint. The
 * client islands around it (filters, sort, pagination, search) do nothing but
 * rewrite the URL and let the server render the next state.
 */
export default async function ProductsPage({ searchParams }: PageProps) {
  const query = parseProductQuery(await searchParams);
  const { items, pagination, facets } = productRepository.list(query);

  const heading = query.search
    ? `Results for "${query.search}"`
    : query.category.length === 1
      ? (facets.categories.find((c) => c.value === query.category[0])?.label ?? "Products")
      : "All products";

  return (
    <div className="container-page py-8">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{heading}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {pagination.total.toLocaleString()} products &middot; filters stay in the URL, so you can share or
            bookmark this exact view.
          </p>
        </div>

        <ProductSearchInput className="max-w-xl" />
        <ActiveFilters facets={facets} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-2">
            <FilterPanel facets={facets} />
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <ResultsToolbar pagination={pagination} />

          {items.length === 0 ? (
            <EmptyState
              icon={<TbSearchOff className="size-7" aria-hidden />}
              title="No products match these filters"
              description="Try removing a filter, widening the price range, or searching for something broader."
              action={
                <Link href="/products" className={buttonClasses("primary")}>
                  Clear all filters
                </Link>
              }
            />
          ) : (
            <>
              <ProductGrid products={items} />
              <ProductPagination pagination={pagination} />
            </>
          )}
        </div>
      </div>

      <MobileFilterDrawer facets={facets} />
    </div>
  );
}
