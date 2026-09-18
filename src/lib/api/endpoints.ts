/**
 * Endpoint registry.
 *
 * Every URL the client can call lives here, so renaming a route is a one-line
 * change and no component ever hard-codes a path.
 */
export const endpoints = {
  products: {
    list: () => "/products",
    detail: (slug: string) => `/products/${encodeURIComponent(slug)}`,
    related: (slug: string) => `/products/${encodeURIComponent(slug)}/related`,
  },
  categories: {
    list: () => "/categories",
  },
  orders: {
    create: () => "/orders",
  },
} as const;
