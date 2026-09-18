"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { TbArrowRight } from "react-icons/tb";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { StockBadge } from "./StockBadge";
import { buttonClasses } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { useApiResource } from "@/hooks/useApiResource";
import { productService } from "@/services";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { quickViewClosed } from "@/store/slices/ui.slice";

/**
 * Quick view - the client-side slice of the data stack.
 *
 * Mounted once in the layout and driven by `ui.quickViewSlug`, so the 24 cards
 * on a listing page share one dialog instead of each carrying its own.
 * The fetch runs through hook -> service -> axios -> route handler and is
 * disabled (`enabled: false`) until a slug is actually set, so closing the
 * dialog aborts any request still in flight.
 */
export function QuickViewDialog() {
  const slug = useAppSelector((state) => state.ui.quickViewSlug);
  const dispatch = useAppDispatch();

  const close = useCallback(() => dispatch(quickViewClosed()), [dispatch]);

  const { data: product, error, isLoading, refetch } = useApiResource(
    ({ signal }) => productService.getBySlug(slug as string, { signal }),
    [slug],
    { enabled: Boolean(slug) },
  );

  return (
    <Modal open={Boolean(slug)} onClose={close} label="Product quick view">
      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-2">
        {isLoading && (
          <>
            <Skeleton className="aspect-square w-full rounded-card" />
            <div className="space-y-4 py-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-11 w-full rounded-pill" />
            </div>
          </>
        )}

        {error && !isLoading && (
          <div className="md:col-span-2">
            <ErrorState error={error} title="Could not load this product" onRetry={refetch} />
          </div>
        )}

        {product && !isLoading && (
          <>
            <div className="relative aspect-square overflow-hidden rounded-card bg-surface-muted">
              <Image
                src={product.images[0]?.url ?? product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 90vw, 40vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                {product.brand} · {product.categoryName}
              </p>

              <h2 className="font-display text-xl font-semibold text-balance text-foreground">{product.title}</h2>

              <Rating value={product.rating} count={product.reviewCount} />

              <Price
                value={product.price}
                compareAt={product.compareAtPrice}
                currency={product.currency}
                size="xl"
                showSaving
              />

              <StockBadge stock={product.stock} className="self-start" />

              <p className="line-clamp-4 text-sm leading-relaxed text-muted">{product.description}</p>

              <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
                <AddToCartButton product={product} className="flex-1" />
                <Link
                  href={`/products/${product.slug}`}
                  onClick={close}
                  className={buttonClasses("outline", "md", "flex-1")}
                >
                  Full details
                  <TbArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
