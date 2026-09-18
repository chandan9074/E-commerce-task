import Link from "next/link";
import { TbBolt } from "react-icons/tb";

import { CartButton } from "@/components/cart/CartButton";
import { HeaderSearch } from "./HeaderSearch";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { productRepository } from "@/lib/data/product.repository";
import { SITE } from "@/lib/constants";

/**
 * Site header - a **Server Component**.
 *
 * It reads the category list straight from the repository at render time (no
 * fetch, no loading state) and mounts only three client islands: search, cart
 * button and theme toggle.
 */
export function Header() {
  const categories = productRepository.getCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-surface/85 backdrop-blur-lg">
      <div className="container-page">
        <div className="flex h-16 items-center gap-3 lg:h-18">
          <MobileNav categories={categories} />

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl gradient-brand text-white">
              <TbBolt className="size-5" aria-hidden />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">{SITE.name}</span>
          </Link>

          <HeaderSearch className="mx-auto hidden w-full max-w-xl md:block" />

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeToggle />
            <CartButton />
          </div>
        </div>

        {/* Category bar: plain links, so each one is crawlable and prefetchable. */}
        <nav aria-label="Categories" className="hidden lg:block">
          <ul className="-mb-px flex items-center gap-1 overflow-x-auto pb-2 text-sm scrollbar-none">
            <li>
              <Link
                href="/products"
                className="rounded-pill px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                All products
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="rounded-pill px-3 py-1.5 whitespace-nowrap text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <Link
                href="/products?onSale=1&sort=discount"
                className="rounded-pill px-3 py-1.5 font-medium whitespace-nowrap text-accent-600 transition-colors hover:bg-accent-500/10"
              >
                Deals
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-page pb-3 md:hidden">
        <HeaderSearch />
      </div>
    </header>
  );
}
