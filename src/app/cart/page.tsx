import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productRepository } from "@/lib/data/product.repository";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the items in your cart, adjust quantities and continue to checkout.",
  robots: { index: false, follow: true },
};

/**
 * The page shell stays a Server Component: heading, recommendations and
 * metadata are server-rendered, and only `CartView` (which needs the store)
 * runs on the client.
 */
export default function CartPage() {
  const recommendations = productRepository.getDeals(4);

  return (
    <div className="container-page py-8">
      <h1 className="font-display mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">Your cart</h1>

      <CartView />

      <section className="mt-16 space-y-6">
        <SectionHeading
          eyebrow="Before you go"
          title="Deals you might have missed"
          action={{ label: "See all deals", href: "/products?onSale=1&sort=discount" }}
        />
        <ProductRail products={recommendations} />
      </section>
    </div>
  );
}
