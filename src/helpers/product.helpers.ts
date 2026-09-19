import type { Product, ProductSummary, Review } from "@/types";

// Derived values used by cards, badges and the product page.

export type StockLevel = "out-of-stock" | "low-stock" | "in-stock";

export interface StockStatus {
  level: StockLevel;
  label: string;
  available: boolean;
}

export const LOW_STOCK_THRESHOLD = 6;

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return { level: "out-of-stock", label: "Out of stock", available: false };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { level: "low-stock", label: `Only ${stock} left`, available: true };
  return { level: "in-stock", label: "In stock", available: true };
}

export function getSavings(product: Pick<ProductSummary, "price" | "compareAtPrice">) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round((product.compareAtPrice - product.price) * 100) / 100;
}

/** 5 -> 1 star distribution for the rating bars. */
export function getRatingBreakdown(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0];
  for (const review of reviews) {
    const index = Math.min(4, Math.max(0, Math.round(review.rating) - 1));
    counts[index] += 1;
  }
  const total = reviews.length || 1;
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars - 1],
    percent: Math.round((counts[stars - 1] / total) * 100),
  }));
}

export function buildBreadcrumbs(product: Product) {
  return [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: product.categoryName, href: `/products?category=${product.category}` },
    { name: product.title, href: `/products/${product.slug}` },
  ];
}
