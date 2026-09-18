import Link from "next/link";
import { TbBolt, TbBrandGithub, TbBrandX, TbMail } from "react-icons/tb";

import { productRepository } from "@/lib/data/product.repository";
import { SITE } from "@/lib/constants";

const SUPPORT_LINKS = [
  { label: "Shipping & delivery", href: "/products" },
  { label: "Returns", href: "/products" },
  { label: "Order tracking", href: "/products" },
  { label: "Contact us", href: "/products" },
];

export function Footer() {
  const categories = productRepository.getCategories();
  const stats = productRepository.getStats();

  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl gradient-brand text-white">
                <TbBolt className="size-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-semibold">{SITE.name}</span>
            </Link>
            <p className="max-w-xs text-sm text-muted">{SITE.tagline}. {stats.productCount} products, one checkout.</p>
            <div className="flex gap-2">
              {[
                { icon: TbBrandX, label: "X" },
                { icon: TbBrandGithub, label: "GitHub" },
                { icon: TbMail, label: "Email" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-pill border border-[var(--border)] text-muted"
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Shop</h2>
            <ul className="space-y-2 text-sm text-muted">
              {categories.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link href={`/products?category=${category.slug}`} className="hover:text-brand-600">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Support</h2>
            <ul className="space-y-2 text-sm text-muted">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-brand-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Stay in the loop</h2>
            <p className="mb-3 text-sm text-muted">Occasional emails about restocks and price drops. No spam.</p>
            <form className="flex gap-2" aria-label="Newsletter signup">
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-pill border border-[var(--border)] bg-surface-muted px-3.5 py-2 text-sm placeholder:text-muted/70 focus:border-brand-500"
              />
              <button
                type="submit"
                className="rounded-pill bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-muted sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. Demo storefront built for a frontend engineering task.
          </p>
          <p>Catalogue: {stats.productCount} products across {stats.categoryCount} categories.</p>
        </div>
      </div>
    </footer>
  );
}
