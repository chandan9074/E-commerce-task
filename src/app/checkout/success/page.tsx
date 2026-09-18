import type { Metadata } from "next";

import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productRepository } from "@/lib/data/product.repository";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your order has been placed.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  const recommendations = productRepository.getFeatured(4);

  return (
    <div className="container-page py-14">
      <OrderConfirmationView />

      <section className="mt-20 space-y-6">
        <SectionHeading eyebrow="While you wait" title="Hand-picked for you" />
        <ProductRail products={recommendations} />
      </section>
    </div>
  );
}
