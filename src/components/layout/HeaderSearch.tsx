"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { TbLoader2, TbSearch, TbX } from "react-icons/tb";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useProductSearch } from "@/hooks/useProductSearch";
import { buildProductsHref } from "@/helpers/product-query.helpers";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Global search with live suggestions.
 *
 * This is the app's showcase of the client data path: `useProductSearch`
 * (debounce) -> `productService` -> axios interceptors -> `/api/products`.
 * Requests abort on every new term, so only the final keystroke's response can
 * ever reach the dropdown.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { suggestions, isFetching, isEmpty, total, enabled } = useProductSearch(term);

  useOnClickOutside(containerRef, () => setOpen(false), open);

  const goToResults = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!term.trim()) return;
      setOpen(false);
      router.push(buildProductsHref({ search: term.trim() }));
    },
    [router, term],
  );

  const pick = useCallback(
    (slug: string) => {
      setOpen(false);
      setTerm("");
      router.push(`/products/${slug}`);
    },
    [router],
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={goToResults} role="search">
        <TbSearch className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, brands, categories"
          aria-label="Search products"
          role="combobox"
          aria-expanded={open && enabled}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          className="w-full rounded-pill border border-[var(--border)] bg-surface-muted py-2.5 pr-10 pl-10 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:bg-surface"
        />

        <span className="absolute top-1/2 right-3 -translate-y-1/2">
          {isFetching && enabled ? (
            <TbLoader2 className="size-4 animate-spin text-brand-500" aria-hidden />
          ) : (
            term && (
              <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
                <TbX className="size-4 text-muted hover:text-foreground" aria-hidden />
              </button>
            )
          )}
        </span>
      </form>

      {open && enabled && (
        <div
          id="search-suggestions"
          className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-card border border-[var(--border)] bg-surface shadow-elevated"
        >
          {isEmpty ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No products match &ldquo;{term}&rdquo;. Try a broader term.
            </p>
          ) : (
            <>
              <ul className="max-h-96 overflow-y-auto">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => pick(product.slug)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        <Image src={product.thumbnail} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{product.title}</span>
                        <span className="block text-xs text-muted">{product.categoryName}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(product.price, product.currency)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(buildProductsHref({ search: term.trim() }));
                }}
                className="w-full border-t border-[var(--border)] bg-surface-muted px-4 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-600/10"
              >
                See all {total.toLocaleString()} results
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
