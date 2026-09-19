"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/types";

/** The only stateful part of the product page, so the only client part. */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  const select = useCallback((index: number) => setActiveIndex(index), []);

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 lg:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => select(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-18 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                index === activeIndex ? "border-brand-600" : "border-transparent hover:border-[var(--border-strong)]",
              )}
            >
              <Image src={image.url} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-card bg-surface-muted">
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt || title}
          fill
          sizes="(max-width: 1024px) 100vw, 46vw"
          priority
          className="animate-fade-up object-cover"
        />
      </div>
    </div>
  );
}
