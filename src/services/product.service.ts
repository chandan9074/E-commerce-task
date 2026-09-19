import { request } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { buildSearchParams } from "@/helpers/product-query.helpers";
import type { Product, ProductListResult, ProductQuery, ProductSummary } from "@/types";

// Client-side gateway to the catalogue. Server Components use
// `productRepository` instead, which reads the same data in-process.

export interface RequestOptions {
  signal?: AbortSignal;
}

export const productService = {
  list(query: Partial<ProductQuery> = {}, options: RequestOptions = {}): Promise<ProductListResult> {
    return request<ProductListResult>({
      method: "get",
      url: endpoints.products.list(),
      params: buildSearchParams(query),
      signal: options.signal,
    });
  },

  /** Used by the header suggestions dropdown. */
  search(term: string, limit = 6, options: RequestOptions = {}): Promise<ProductListResult> {
    return this.list({ search: term, limit, sort: "relevance" }, options);
  },

  getBySlug(slug: string, options: RequestOptions = {}): Promise<Product> {
    return request<Product>({
      method: "get",
      url: endpoints.products.detail(slug),
      signal: options.signal,
    });
  },

  getRelated(slug: string, limit = 8, options: RequestOptions = {}): Promise<ProductSummary[]> {
    return request<ProductSummary[]>({
      method: "get",
      url: endpoints.products.related(slug),
      params: { limit },
      signal: options.signal,
    });
  },
};

export type ProductService = typeof productService;
