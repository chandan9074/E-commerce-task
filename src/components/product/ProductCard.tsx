import Image from "next/image";
import Link from "next/link";
import { TbTruck } from "react-icons/tb";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { QuickViewTrigger } from "./QuickViewTrigger";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { getStockStatus } from "@/helpers/product.helpers";
import { cn } from "@/lib/utils/cn";
import type { ProductSummary } from "@/types";

/**
 * Product card - a **Server Component**.
 *
 * The card itself ships no JavaScript: markup, image and typography are
 * rendered on the server, and only the two interactive affordances
 * (`AddToCartButton`, `QuickViewTrigger`) are client islands. A 24-card grid
 * therefore costs 2 small components' worth of JS, not 24 cards' worth.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductSummary;
  /** Set on the first row so the LCP image is not lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  const stock = getStockStatus(product.stock);
  const discounted = product.discountPercent > 0;

  return (
    <article
      className={cn(
        "group surface-card relative flex flex-col overflow-hidden transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-card focus-within:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        <Link href={`/products/${product.slug}`} className="block size-full" tabIndex={-1} aria-hidden>
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 22vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
              !stock.available && "opacity-55 grayscale",
            )}
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            {discounted && <Badge tone="danger">-{product.discountPercent}%</Badge>}
            {product.tags.includes("bestseller") && <Badge tone="accent">Bestseller</Badge>}
            {!stock.available && <Badge tone="neutral">Sold out</Badge>}
          </div>

          <div className="pointer-events-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <QuickViewTrigger slug={product.slug} title={product.title} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{product.brand}</p>

        <h3 className="text-sm leading-snug font-semibold text-foreground">
          {/* Stretched link keeps the whole card clickable without nesting anchors. */}
          <Link href={`/products/${product.slug}`} className="before:absolute before:inset-0 before:content-['']">
            {product.title}
          </Link>
        </h3>

        <Rating value={product.rating} count={product.reviewCount} size="sm" />

        <div className="mt-auto space-y-3 pt-1">
          <Price value={product.price} compareAt={product.compareAtPrice} currency={product.currency} size="lg" />

          <div className="flex items-center justify-between gap-2">
            {/* `min-w-0` + `truncate`: on a 2-column mobile grid the card is
                ~150px wide, and without them this label wrapped and shoved the
                add-to-cart button out of alignment. */}
            {product.freeShipping ? (
              <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted">
                <TbTruck className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">Free shipping</span>
              </span>
            ) : (
              <span className="min-w-0 truncate text-xs text-muted">{stock.label}</span>
            )}

            {/* Raised above the stretched link so the button stays clickable. */}
            <div className="relative z-10 shrink-0">
              <AddToCartButton product={product} size="sm" iconOnly label="Add to cart" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
