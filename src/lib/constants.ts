import type { SortOption } from "@/types";

export const SITE = {
  name: "Aurelia",
  tagline: "Considered goods for everyday life",
  description:
    "Aurelia is a modern storefront with 500+ curated products across electronics, fashion, home, beauty, sport, gaming and workspace - with fast search, precise filters and a frictionless checkout.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_US",
  currency: "USD",
} as const;

/** Commerce rules kept in one place so cart, checkout and UI never disagree. */
export const COMMERCE = {
  freeShippingThreshold: 75,
  flatShippingRate: 6.95,
  taxRate: 0.08,
  maxQuantityPerLine: 10,
} as const;

export const PAGINATION = {
  defaultLimit: 24,
  maxLimit: 60,
  limitOptions: [12, 24, 48] as const,
} as const;

export const CART_STORAGE_KEY = "aurelia.cart.v1";
/** Hands the order confirmation to the success page without exposing it in the URL. */
export const ORDER_STORAGE_KEY = "aurelia.last-order";

/** Canonical search-param names. Imported everywhere instead of raw strings. */
export const QUERY_KEYS = {
  search: "q",
  category: "category",
  brand: "brand",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  minRating: "rating",
  inStock: "inStock",
  onSale: "onSale",
  sort: "sort",
  page: "page",
  limit: "limit",
} as const;

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "rating-desc": "Top rated",
  newest: "Newest arrivals",
  popular: "Most popular",
  discount: "Biggest discount",
};

export const RATING_FILTERS = [4.5, 4, 3.5, 3] as const;
