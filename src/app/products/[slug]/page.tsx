import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbCheck, TbRefresh, TbShieldCheck, TbTruck } from "react-icons/tb";

import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductRail } from "@/components/product/ProductRail";
import { ProductReviews } from "@/components/product/ProductReviews";
import { StockBadge } from "@/components/product/StockBadge";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildBreadcrumbs } from "@/helpers/product.helpers";
import { productRepository } from "@/lib/data/product.repository";
import { SITE } from "@/lib/constants";
import { formatCompact, titleCase } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render the 60 best sellers at build time; everything else is rendered on
 * first request and then cached. Building all 520 pages up front would slow the
 * build for products almost nobody opens.
 */
export async function generateStaticParams() {
  return productRepository.getTrending(60).map((product) => ({ slug: product.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = productRepository.findBySlug(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  const title = product.title;
  const description = `${product.shortDescription} ${product.rating.toFixed(1)}/5 from ${formatCompact(product.reviewCount)} reviews. Free returns at ${SITE.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.slug}`,
      images: product.images.slice(0, 2).map((image) => ({ url: image.url, alt: image.alt })),
    },
    twitter: { card: "summary_large_image", title, description, images: [product.thumbnail] },
    other: {
      "product:price:amount": product.price.toFixed(2),
      "product:price:currency": product.currency,
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
    },
  };
}

const GUARANTEES = [
  { icon: TbTruck, title: "Free delivery", description: "On orders over $75" },
  { icon: TbRefresh, title: "30-day returns", description: "No restocking fee" },
  { icon: TbShieldCheck, title: "2-year warranty", description: "Covered against defects" },
];

/**
 * Product detail - a **Server Component**.
 *
 * Reads the product in-process, so the HTML arrives complete with price, stock,
 * specs, reviews and JSON-LD. Only the gallery and the purchase panel hydrate.
 * An unknown slug calls `notFound()` and renders `not-found.tsx` with a 404.
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = productRepository.findBySlug(slug);

  if (!product) notFound();

  const related = productRepository.getRelated(slug, 8);
  const breadcrumbs = buildBreadcrumbs(product);

  return (
    <div className="container-page py-6">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} title={product.title} />

        <div className="min-w-0 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/products?category=${product.category}`}
                className="text-xs font-semibold tracking-wider text-brand-600 uppercase hover:underline dark:text-brand-400"
              >
                {product.categoryName}
              </Link>
              <span className="text-xs text-muted">&middot;</span>
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                className="text-xs text-muted hover:underline"
              >
                {product.brand}
              </Link>
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {product.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Rating value={product.rating} count={product.reviewCount} />
              <StockBadge stock={product.stock} />
              {product.tags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {titleCase(tag)}
                </Badge>
              ))}
            </div>
          </div>

          <Price
            value={product.price}
            compareAt={product.compareAtPrice}
            currency={product.currency}
            size="xl"
            showSaving
          />

          <p className="text-sm leading-relaxed text-muted">{product.description}</p>

          <ProductPurchasePanel product={product} />

          <ul className="grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-3">
            {GUARANTEES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <section aria-labelledby="specs-heading" className="border-t border-[var(--border)] pt-5">
            <h2 id="specs-heading" className="mb-3 text-sm font-semibold">
              Specifications
            </h2>
            <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 border-b border-[var(--border)] py-1.5">
                  <dt className="text-sm text-muted">{spec.label}</dt>
                  <dd className="text-right text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-b border-[var(--border)] py-1.5">
                <dt className="text-sm text-muted">SKU</dt>
                <dd className="text-right text-sm font-medium tabular-nums">{product.sku}</dd>
              </div>
            </dl>
          </section>

          {product.stock > 0 && (
            <p className="flex items-center gap-2 text-sm text-success-600">
              <TbCheck className="size-4" aria-hidden />
              Order today for delivery within 3-5 business days
            </p>
          )}
        </div>
      </div>

      <div className="mt-16 space-y-16">
        <ProductReviews
          reviews={product.reviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />

        {related.length > 0 && (
          <section aria-label="Related products" className="space-y-6">
            <SectionHeading
              title="You might also like"
              description={`More from ${product.categoryName}, picked by similarity in category, brand and price.`}
              action={{ label: "Browse category", href: `/products?category=${product.category}` }}
            />
            <ProductRail products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
