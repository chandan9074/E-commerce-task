import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbSparkles } from "react-icons/tb";

import { buttonClasses } from "@/components/ui/Button";
import type { ProductSummary } from "@/types";

/**
 * Landing hero. Entirely server-rendered - the only "interactivity" is links,
 * and the feature image is marked `priority` because it is the LCP element.
 */
export function Hero({
  featured,
  stats,
}: {
  featured: ProductSummary;
  stats: { productCount: number; categoryCount: number; brandCount: number };
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-600/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 -left-24 size-[28rem] rounded-full bg-accent-500/10 blur-3xl"
      />

      <div className="container-page relative py-16 lg:py-24">
        {/* `min-w-0` on both columns: without it a grid track refuses to shrink
            below its content's min-content width, and the stats row below was
            forcing the whole column to 428px on a 375px screen - clipping the
            headline and the paragraph against the section's `overflow-hidden`. */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-600/10 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <TbSparkles className="size-3.5" aria-hidden />
              {stats.productCount}+ products, curated not collected
            </span>

            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Everything you need,
              <span className="block bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
                nothing you do not.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
              Search {stats.productCount} products across {stats.categoryCount} categories and {stats.brandCount}{" "}
              brands. Filter by price, rating and availability - every filter lives in the URL, so the view you
              find is the view you can share.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className={buttonClasses("primary", "lg")}>
                Shop all products
                <TbArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/products?onSale=1&sort=discount" className={buttonClasses("outline", "lg")}>
                View this week&rsquo;s deals
              </Link>
            </div>

            <dl className="mt-10 flex max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-[var(--border)] pt-6">
              {[
                { label: "Products", value: `${stats.productCount}+` },
                { label: "Categories", value: stats.categoryCount },
                { label: "Brands", value: stats.brandCount },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <dt className="text-[11px] tracking-wide text-muted uppercase sm:text-xs">{stat.label}</dt>
                  <dd className="font-display text-xl font-semibold tabular-nums sm:text-2xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative min-w-0">
            <div className="surface-card relative mx-auto max-w-md overflow-hidden p-3 shadow-card lg:max-w-none">
              {/* Catalogue imagery is square, so a square frame fills it edge to
                  edge with nothing cropped away. */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted">
                <Image
                  src={featured.thumbnail}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) min(90vw, 26rem), 42vw"
                  priority
                  className="object-cover"
                />
              </div>

              <div className="flex items-end justify-between gap-4 px-2 pt-4 pb-2">
                <div className="min-w-0">
                  <p className="text-xs tracking-wide text-muted uppercase">Editor&rsquo;s pick</p>
                  <p className="truncate text-sm font-semibold">{featured.title}</p>
                </div>
                <Link
                  href={`/products/${featured.slug}`}
                  className={buttonClasses("secondary", "sm", "shrink-0")}
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
