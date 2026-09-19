import type { SortOption } from "@/types";

/**
 * Absolute origin for canonical URLs, Open Graph tags, the sitemap and the
 * server-side API base URL.
 *
 * `??` is not enough: an env var defined but empty is still a string, passes
 * the fallback and then throws in `new URL("")`. Each candidate is trimmed and
 * validated, and a bad one falls through to the next.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Set automatically on Vercel. The production domain comes first so
    // canonicals do not change per deployment.
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;

    try {
      const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      // A hostname with no dot means a mis-typed scheme; skip it.
      if (parsed.hostname === "localhost" || parsed.hostname.includes(".")) return parsed.origin;
    } catch {
      // Malformed; try the next candidate.
    }
  }

  return "http://localhost:3000";
}

export const SITE = {
  name: "Aurelia",
  tagline: "Considered goods for everyday life",
  description:
    "Aurelia is a modern storefront with 500+ curated products across electronics, fashion, home, beauty, sport, gaming and workspace - with fast search, precise filters and a frictionless checkout.",
  url: resolveSiteUrl(),
  locale: "en_US",
  currency: "USD",
} as const;

/** Commerce rules, shared by the cart, checkout and UI. */
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
/** Passes the order confirmation to the success page. */
export const ORDER_STORAGE_KEY = "aurelia.last-order";

/** Search-param names, so no component hard-codes one. */
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
