import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils/cn";
import type { ProductSummary } from "@/types";

/**
 * Server-rendered grid. The first four cards get `priority` so the largest
 * contentful image is fetched eagerly instead of lazily.
 */
export function ProductGrid({
  products,
  className,
  priorityCount = 4,
}: {
  products: ProductSummary[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
