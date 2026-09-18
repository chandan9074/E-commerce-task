import Link from "next/link";
import { TbPackageOff } from "react-icons/tb";

import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { productRepository } from "@/lib/data/product.repository";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Rendered (with a real 404 status) when `notFound()` is called for an unknown
 * slug. Offers a way forward instead of a dead end.
 */
export default function ProductNotFound() {
  const suggestions = productRepository.getTrending(4);

  return (
    <div className="container-page py-16">
      <EmptyState
        icon={<TbPackageOff className="size-7" aria-hidden />}
        title="We could not find that product"
        description="The link may be out of date, or the product may have been discontinued. Here is what people are buying right now."
        action={
          <Link href="/products" className={buttonClasses("primary")}>
            Browse all products
          </Link>
        }
        className="mx-auto max-w-2xl"
      />

      <section className="mt-16 space-y-6">
        <SectionHeading eyebrow="Popular right now" title="Trending products" />
        <ProductRail products={suggestions} />
      </section>
    </div>
  );
}
