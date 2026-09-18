import type { MetadataRoute } from "next";

import { productRepository } from "@/lib/data/product.repository";
import { SITE } from "@/lib/constants";

/**
 * Sitemap covering the static routes, every category listing and all 500+
 * product pages - generated from the repository so it can never drift from the
 * catalogue.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = productRepository.getCategories().map((category) => ({
    url: `${SITE.url}/products?category=${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = productRepository.getAllSlugs().map((slug) => ({
    url: `${SITE.url}/products/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
