import { PAGINATION, QUERY_KEYS } from "@/lib/constants";
import { SORT_OPTIONS, type ProductQuery, type SortOption } from "@/types";

/**
 * The single source of truth for translating URL search params <-> a typed
 * query object.
 *
 * Both sides of the app depend on it: Server Components parse `searchParams`
 * with it, the client filter hook writes URLs with it, and the route handlers
 * parse the incoming request with it. One parser means the server and the
 * client can never disagree about what `?rating=4&page=2` means.
 */

export type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined;

export const DEFAULT_QUERY: ProductQuery = {
  search: "",
  category: [],
  brand: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStockOnly: false,
  onSaleOnly: false,
  sort: "relevance",
  page: 1,
  limit: PAGINATION.defaultLimit,
};

function readAll(input: SearchParamsInput, key: string): string[] {
  if (!input) return [];
  const raw = input instanceof URLSearchParams ? input.getAll(key) : input[key];
  if (raw === undefined) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  // Supports both `?brand=a&brand=b` and `?brand=a,b`.
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function readOne(input: SearchParamsInput, key: string): string | undefined {
  return readAll(input, key)[0];
}

function toNumber(value: string | undefined, { min, max }: { min: number; max: number }) {
  if (value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
}

function toBool(value: string | undefined) {
  return value === "1" || value === "true";
}

function toSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption) ? (value as SortOption) : DEFAULT_QUERY.sort;
}

/** Parses and clamps anything user-supplied into a safe, normalised query. */
export function parseProductQuery(input: SearchParamsInput): ProductQuery {
  const minPrice = toNumber(readOne(input, QUERY_KEYS.minPrice), { min: 0, max: 100_000 });
  const maxPrice = toNumber(readOne(input, QUERY_KEYS.maxPrice), { min: 0, max: 100_000 });

  // A reversed range is a user slip, not an error - swap rather than return zero results.
  const [lo, hi] =
    minPrice !== null && maxPrice !== null && minPrice > maxPrice ? [maxPrice, minPrice] : [minPrice, maxPrice];

  const limit = toNumber(readOne(input, QUERY_KEYS.limit), { min: 1, max: PAGINATION.maxLimit });
  const page = toNumber(readOne(input, QUERY_KEYS.page), { min: 1, max: 10_000 });

  return {
    search: (readOne(input, QUERY_KEYS.search) ?? "").slice(0, 80),
    category: readAll(input, QUERY_KEYS.category),
    brand: readAll(input, QUERY_KEYS.brand),
    minPrice: lo,
    maxPrice: hi,
    minRating: toNumber(readOne(input, QUERY_KEYS.minRating), { min: 0, max: 5 }),
    inStockOnly: toBool(readOne(input, QUERY_KEYS.inStock)),
    onSaleOnly: toBool(readOne(input, QUERY_KEYS.onSale)),
    sort: toSort(readOne(input, QUERY_KEYS.sort)),
    page: page ? Math.trunc(page) : DEFAULT_QUERY.page,
    limit: limit ? Math.trunc(limit) : DEFAULT_QUERY.limit,
  };
}

/**
 * Serialises back to search params, omitting defaults so shared URLs stay
 * short and two identical queries always produce the same string (which is
 * what lets the client cache/de-duplicate requests by key).
 */
export function buildSearchParams(query: Partial<ProductQuery>): URLSearchParams {
  const merged = { ...DEFAULT_QUERY, ...query };
  const params = new URLSearchParams();

  if (merged.search) params.set(QUERY_KEYS.search, merged.search);
  [...merged.category].sort().forEach((value) => params.append(QUERY_KEYS.category, value));
  [...merged.brand].sort().forEach((value) => params.append(QUERY_KEYS.brand, value));
  if (merged.minPrice !== null) params.set(QUERY_KEYS.minPrice, String(merged.minPrice));
  if (merged.maxPrice !== null) params.set(QUERY_KEYS.maxPrice, String(merged.maxPrice));
  if (merged.minRating !== null) params.set(QUERY_KEYS.minRating, String(merged.minRating));
  if (merged.inStockOnly) params.set(QUERY_KEYS.inStock, "1");
  if (merged.onSaleOnly) params.set(QUERY_KEYS.onSale, "1");
  if (merged.sort !== DEFAULT_QUERY.sort) params.set(QUERY_KEYS.sort, merged.sort);
  if (merged.page > 1) params.set(QUERY_KEYS.page, String(merged.page));
  if (merged.limit !== DEFAULT_QUERY.limit) params.set(QUERY_KEYS.limit, String(merged.limit));

  return params;
}

export function buildProductsHref(query: Partial<ProductQuery>, pathname = "/products") {
  const qs = buildSearchParams(query).toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Stable cache key for a query - identical filters always map to one string. */
export function queryCacheKey(query: Partial<ProductQuery>) {
  return buildSearchParams(query).toString();
}

export function countActiveFilters(query: ProductQuery) {
  return (
    (query.search ? 1 : 0) +
    query.category.length +
    query.brand.length +
    (query.minPrice !== null || query.maxPrice !== null ? 1 : 0) +
    (query.minRating !== null ? 1 : 0) +
    (query.inStockOnly ? 1 : 0) +
    (query.onSaleOnly ? 1 : 0)
  );
}
