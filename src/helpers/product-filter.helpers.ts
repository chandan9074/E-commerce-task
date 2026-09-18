import { RATING_FILTERS } from "@/lib/constants";
import type {
  FacetBucket,
  PaginationMeta,
  Product,
  ProductFacets,
  ProductQuery,
  ProductSummary,
  SortOption,
} from "@/types";

/**
 * The query engine: pure functions over a product array.
 *
 * Nothing here imports the dataset or `next/*`. The route handlers inject the
 * catalogue, which keeps this file trivially unit-testable and makes swapping
 * the mock dataset for a real database a one-file change.
 */

export type SearchTextResolver = (product: Product) => string;

const defaultSearchText: SearchTextResolver = (p) =>
  [p.title, p.brand, p.categoryName, p.subcategoryName, ...p.tags].join(" ").toLowerCase();

/** Field projection for list responses - see the note on `ProductSummary`. */
export function toSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    category: product.category,
    categoryName: product.categoryName,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    discountPercent: product.discountPercent,
    currency: product.currency,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    thumbnail: product.thumbnail,
    shortDescription: product.shortDescription,
    tags: product.tags,
    freeShipping: product.freeShipping,
  };
}

export function tokenise(search: string) {
  return search.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean);
}

/**
 * Relevance score for a product against the search tokens.
 * Returns -1 when the product does not match every token (AND semantics).
 */
export function relevanceScore(product: Product, haystack: string, tokens: string[]) {
  if (tokens.length === 0) return 0;

  const title = product.title.toLowerCase();
  const brand = product.brand.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (!haystack.includes(token)) return -1;
    if (title === token) score += 120;
    else if (title.startsWith(token)) score += 60;
    else if (title.includes(token)) score += 35;
    if (brand.includes(token)) score += 15;
    if (product.tags.some((tag) => tag.includes(token))) score += 8;
  }

  // Popular, well-rated products break ties between equally textual matches.
  return score + product.rating * 2 + Math.min(product.unitsSold / 1000, 5);
}

type Predicates = {
  [K in "search" | "category" | "brand" | "price" | "rating" | "stock" | "sale"]: (p: Product) => boolean;
};

function buildPredicates(query: ProductQuery, scores: Map<string, number>): Predicates {
  const categories = new Set(query.category);
  const brands = new Set(query.brand);

  return {
    search: (p) => (scores.size === 0 ? true : (scores.get(p.id) ?? -1) >= 0),
    category: (p) => categories.size === 0 || categories.has(p.category),
    brand: (p) => brands.size === 0 || brands.has(p.brand),
    price: (p) =>
      (query.minPrice === null || p.price >= query.minPrice) &&
      (query.maxPrice === null || p.price <= query.maxPrice),
    rating: (p) => query.minRating === null || p.rating >= query.minRating,
    stock: (p) => !query.inStockOnly || p.stock > 0,
    sale: (p) => !query.onSaleOnly || p.discountPercent > 0,
  };
}

/** Applies every predicate except the named ones (used for facet counting). */
function applyPredicates(products: Product[], predicates: Predicates, skip: (keyof Predicates)[] = []) {
  const active = (Object.keys(predicates) as (keyof Predicates)[])
    .filter((key) => !skip.includes(key))
    .map((key) => predicates[key]);
  return products.filter((product) => active.every((predicate) => predicate(product)));
}

const comparators: Record<SortOption, (a: Product, b: Product, scores: Map<string, number>) => number> = {
  relevance: (a, b, scores) => {
    if (scores.size > 0) {
      const diff = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
      if (diff !== 0) return diff;
    }
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.unitsSold - a.unitsSold;
  },
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "rating-desc": (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  popular: (a, b) => b.unitsSold - a.unitsSold || b.reviewCount - a.reviewCount,
  discount: (a, b) => b.discountPercent - a.discountPercent || a.price - b.price,
};

export function sortProducts(products: Product[], sort: SortOption, scores: Map<string, number>) {
  const compare = comparators[sort] ?? comparators.relevance;
  // `id` as the final tie-break keeps pagination stable across requests.
  return [...products].sort((a, b) => compare(a, b, scores) || a.id.localeCompare(b.id));
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  const pagination: PaginationMeta = {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };

  return { items: items.slice(start, start + limit), pagination };
}

function countBy(products: Product[], key: (p: Product) => string, label: (p: Product) => string): FacetBucket[] {
  const counts = new Map<string, FacetBucket>();
  for (const product of products) {
    const value = key(product);
    const bucket = counts.get(value);
    if (bucket) bucket.count += 1;
    else counts.set(value, { value, label: label(product), count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Facet counts are computed with the facet's own dimension excluded, so
 * selecting "Fashion" still shows how many products the other categories hold.
 */
export function buildFacets(products: Product[], predicates: Predicates): ProductFacets {
  const forCategories = applyPredicates(products, predicates, ["category"]);
  const forBrands = applyPredicates(products, predicates, ["brand"]);
  const forPrice = applyPredicates(products, predicates, ["price"]);
  const forRating = applyPredicates(products, predicates, ["rating"]);

  const bounds = forPrice.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: Number.POSITIVE_INFINITY, max: 0 },
  );

  return {
    categories: countBy(forCategories, (p) => p.category, (p) => p.categoryName),
    brands: countBy(forBrands, (p) => p.brand, (p) => p.brand).sort((a, b) => a.label.localeCompare(b.label)),
    priceRange: {
      min: Number.isFinite(bounds.min) ? Math.floor(bounds.min) : 0,
      max: bounds.max > 0 ? Math.ceil(bounds.max) : 0,
    },
    ratings: RATING_FILTERS.map((threshold) => ({
      value: String(threshold),
      label: `${threshold} & up`,
      count: forRating.filter((p) => p.rating >= threshold).length,
    })),
  };
}

export interface QueryProductsResult {
  items: ProductSummary[];
  pagination: PaginationMeta;
  facets: ProductFacets;
}

/** filter -> sort -> paginate, plus facets, in a single pass over the catalogue. */
export function queryProducts(
  products: Product[],
  query: ProductQuery,
  getSearchText: SearchTextResolver = defaultSearchText,
): QueryProductsResult {
  const tokens = tokenise(query.search);
  const scores = new Map<string, number>();

  if (tokens.length > 0) {
    for (const product of products) {
      scores.set(product.id, relevanceScore(product, getSearchText(product), tokens));
    }
  }

  const predicates = buildPredicates(query, scores);
  const matched = applyPredicates(products, predicates);
  const sorted = sortProducts(matched, query.sort, scores);
  const { items, pagination } = paginate(sorted, query.page, query.limit);

  return { items: items.map(toSummary), pagination, facets: buildFacets(products, predicates) };
}

/**
 * Related products: same subcategory first, then same category, then same
 * brand - scored rather than filtered so we always fill the row.
 */
export function findRelated(products: Product[], target: Product, limit = 8): ProductSummary[] {
  const priceBand = target.price * 0.6;

  return products
    .filter((p) => p.id !== target.id)
    .map((p) => {
      let score = 0;
      if (p.subcategory === target.subcategory) score += 50;
      if (p.category === target.category) score += 25;
      if (p.brand === target.brand) score += 15;
      score += p.tags.filter((tag) => target.tags.includes(tag)).length * 5;
      if (Math.abs(p.price - target.price) <= priceBand) score += 10;
      score += p.rating;
      return { product: p, score };
    })
    .filter((entry) => entry.score > 10)
    .sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id))
    .slice(0, limit)
    .map((entry) => toSummary(entry.product));
}
