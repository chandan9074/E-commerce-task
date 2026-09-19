import "server-only";

import dataset from "./products.json";
import type { Category, Product } from "@/types";

// `server-only` keeps the dataset out of the client bundle. Indexes are
// built once per server process, not per request.
const products = dataset.products as Product[];
const categories = dataset.categories as Category[];
const brands = dataset.brands as string[];

const bySlug = new Map<string, Product>(products.map((p) => [p.slug, p]));
const byId = new Map<string, Product>(products.map((p) => [p.id, p]));

/** Pre-lowercased search text per product, so search is a substring scan. */
const searchIndex = new Map<string, string>(
  products.map((p) => [
    p.id,
    [p.title, p.brand, p.categoryName, p.subcategoryName, p.color, p.shortDescription, ...p.tags]
      .join(" ")
      .toLowerCase(),
  ]),
);

const priceBounds = products.reduce(
  (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
  { min: Number.POSITIVE_INFINITY, max: 0 },
);

export const catalog = {
  products,
  categories,
  brands,
  priceBounds: { min: Math.floor(priceBounds.min), max: Math.ceil(priceBounds.max) },
  getBySlug: (slug: string) => bySlug.get(slug),
  getById: (id: string) => byId.get(id),
  getSearchText: (id: string) => searchIndex.get(id) ?? "",
  categoryBySlug: (slug: string) => categories.find((c) => c.slug === slug),
  generatedAt: dataset.generatedAt as string,
};

export type Catalog = typeof catalog;
