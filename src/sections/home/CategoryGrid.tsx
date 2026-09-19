import Image from "next/image";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";

import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category } from "@/types";

/** Tiles linking into a pre-filtered listing. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="container-page space-y-6 py-16">
      <SectionHeading
        eyebrow="Browse"
        title="Shop by category"
        description="Seven departments, each with its own filters, facets and sort options."
        action={{ label: "All products", href: "/products" }}
      />

      {/* The eighth tile keeps the 2- and 4-column layouts evenly filled. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="group relative overflow-hidden rounded-card border border-[var(--border)]"
          >
            <div className="relative aspect-4/3">
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <h3 className="truncate text-sm font-semibold text-white sm:text-base">{category.name}</h3>
              <p className="text-xs text-white/75">{category.productCount} products</p>
            </div>
          </Link>
        ))}

        <Link
          href="/products"
          className="group relative flex min-h-full flex-col justify-end overflow-hidden rounded-card border border-[var(--border)] gradient-brand p-3 sm:p-4"
        >
          <span className="text-sm font-semibold text-white sm:text-base">All products</span>
          <span className="inline-flex items-center gap-1 text-xs text-white/80">
            Browse the full catalogue
            <TbArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}
