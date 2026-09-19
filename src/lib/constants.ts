import type { SortOption } from "@/types";

/**
 * Absolute origin used for canonical URLs, Open Graph tags, the sitemap and the
 * server-side axios base URL.
 *
 * `process.env.X ?? fallback` is not enough: a variable that is *defined but
 * empty* - trivially easy to create in a hosting dashboard - is still a string,
 * so it passes `??` and then throws `ERR_INVALID_URL` inside `new URL("")`
 * while Next collects page data, failing the production build.
 *
 * Every candidate is therefore trimmed, given a scheme if it lacks one, and
 * validated. A bad value falls through to the next candidate instead of
 * breaking the build.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Vercel exposes these automatically. The stable production domain is
    // preferred over the per-deployment URL so canonicals do not churn.
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
      // A hostname with no dot ("htp://site.com" mis-typed, say) would parse but
      // produce a nonsense origin, so reject it and let the next candidate win.
      if (parsed.hostname === "localhost" || parsed.hostname.includes(".")) return parsed.origin;
    } catch {
      // Malformed - try the next candidate.
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
