import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils/cn";
import type { ProductSummary } from "@/types";

/**
 * Horizontally scrolling row of cards (home-page rails, related products).
 *
 * Scrolling is CSS scroll-snap rather than a carousel library: no JavaScript,
 * and it keeps native touch/trackpad behaviour.
 */
export function ProductRail({ products, className }: { products: ProductSummary[]; className?: string }) {
  if (products.length === 0) return null;

  return (
    <div
      className={cn(
        "-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 scrollbar-none",
        "sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <div key={product.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
