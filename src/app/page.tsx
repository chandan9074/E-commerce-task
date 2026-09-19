import type { Metadata } from "next";

import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryGrid } from "@/sections/home/CategoryGrid";
import { Hero } from "@/sections/home/Hero";
import { ValueProps } from "@/sections/home/ValueProps";
import { productRepository } from "@/lib/data/product.repository";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE.name} - ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

/** Every rail is read from the repository during the render. */
export default function HomePage() {
  const stats = productRepository.getStats();
  const categories = productRepository.getCategories();
  const featured = productRepository.getFeatured(9);
  const trending = productRepository.getTrending(8);
  const deals = productRepository.getDeals(8);
  const arrivals = productRepository.getNewArrivals(4);

  return (
    <>
      <Hero
        featured={featured[0] ?? trending[0]}
        stats={{
          productCount: stats.productCount,
          categoryCount: stats.categoryCount,
          brandCount: stats.brandCount,
        }}
      />

      <ValueProps />

      <CategoryGrid categories={categories} />

      <section className="container-page space-y-6 py-4">
        <SectionHeading
          eyebrow="Most wanted"
          title="Trending this week"
          description="Ranked by units sold across the whole catalogue."
          action={{ label: "See all", href: "/products?sort=popular" }}
        />
        <ProductRail products={trending} />
      </section>

      <section className="container-page space-y-6 py-12">
        <SectionHeading
          eyebrow="Save more"
          title="Biggest discounts"
          description="Everything here is at least 25% off its original price."
          action={{ label: "All deals", href: "/products?onSale=1&sort=discount" }}
        />
        <ProductRail products={deals} />
      </section>

      <section className="container-page space-y-6 pb-16">
        <SectionHeading
          eyebrow="Just landed"
          title="New arrivals"
          action={{ label: "Browse new", href: "/products?sort=newest" }}
        />
        <ProductRail products={arrivals} />
      </section>
    </>
  );
}
