import "server-only";

import { catalog } from "./catalog";
import { ApiError } from "@/lib/api/http-error";
import { findRelated, queryProducts, toSummary } from "@/helpers/product-filter.helpers";
import { DEFAULT_QUERY } from "@/helpers/product-query.helpers";
import type { Category, Product, ProductListResult, ProductQuery, ProductSummary } from "@/types";

/**
 * Data-access layer. The only module that touches the catalogue directly.
 *
 * Both consumers go through it:
 *   - Server Components call it in-process (no HTTP round-trip on first paint)
 *   - Route handlers call it to serve the public JSON API
 *
 * Swapping the JSON dataset for Postgres or a headless commerce API means
 * rewriting this file and nothing else.
 */
export const productRepository = {
  list(query: Partial<ProductQuery> = {}): ProductListResult {
    const appliedQuery: ProductQuery = { ...DEFAULT_QUERY, ...query };
    const result = queryProducts(catalog.products, appliedQuery, (p) => catalog.getSearchText(p.id));
    return { ...result, appliedQuery: { ...appliedQuery, page: result.pagination.page } };
  },

  /** Throws a typed 404 rather than returning null - invalid ids are errors. */
  getBySlug(slug: string): Product {
    const product = catalog.getBySlug(slug);
    if (!product) throw ApiError.notFound(`No product exists with the slug "${slug}".`);
    return product;
  },

  findBySlug(slug: string): Product | undefined {
    return catalog.getBySlug(slug);
  },

  findById(id: string): Product | undefined {
    return catalog.getById(id);
  },

  getRelated(slug: string, limit = 8): ProductSummary[] {
    return findRelated(catalog.products, this.getBySlug(slug), limit);
  },

  getCategories(): Category[] {
    return catalog.categories;
  },

  getBrands(): string[] {
    return catalog.brands;
  },

  getPriceBounds() {
    return catalog.priceBounds;
  },

  /** Home-page rails. Sorted once here rather than in the component. */
  getFeatured(limit = 8): ProductSummary[] {
    return [...catalog.products]
      .filter((p) => p.featured && p.stock > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map(toSummary);
  },

  getTrending(limit = 8): ProductSummary[] {
    return [...catalog.products]
      .filter((p) => p.stock > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit)
      .map(toSummary);
  },

  getNewArrivals(limit = 8): ProductSummary[] {
    return [...catalog.products]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit)
      .map(toSummary);
  },

  getDeals(limit = 8): ProductSummary[] {
    return [...catalog.products]
      .filter((p) => p.discountPercent >= 25 && p.stock > 0)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, limit)
      .map(toSummary);
  },

  /** Used by `generateStaticParams` and the sitemap. */
  getAllSlugs(): string[] {
    return catalog.products.map((p) => p.slug);
  },

  getStats() {
    return {
      productCount: catalog.products.length,
      categoryCount: catalog.categories.length,
      brandCount: catalog.brands.length,
      generatedAt: catalog.generatedAt,
    };
  },
};
