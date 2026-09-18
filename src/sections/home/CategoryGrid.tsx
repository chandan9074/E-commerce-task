import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category } from "@/types";

/** Category tiles. Each is a plain link into a pre-filtered listing URL. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="container-page space-y-6 py-16">
      <SectionHeading
        eyebrow="Browse"
        title="Shop by category"
        description="Seven departments, each with its own filters, facets and sort options."
        action={{ label: "All products", href: "/products" }}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className={`group relative overflow-hidden rounded-card border border-[var(--border)] ${
              index === 0 ? "col-span-2 row-span-2 md:col-span-2" : ""
            }`}
          >
            <div className={`relative ${index === 0 ? "aspect-square md:aspect-4/3" : "aspect-4/3"}`}>
              <Image
                src={category.image}
                alt=""
                fill
                sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-base font-semibold text-white">{category.name}</h3>
              <p className="text-xs text-white/75">{category.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
