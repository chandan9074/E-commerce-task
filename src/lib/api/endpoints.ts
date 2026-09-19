/** Every API path the client can call. */
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
