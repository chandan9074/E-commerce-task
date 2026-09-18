"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { TbMenu2 } from "react-icons/tb";

import { Drawer } from "@/components/ui/Drawer";
import { HeaderSearch } from "./HeaderSearch";
import type { Category } from "@/types";

/** Compact navigation for small screens. Local state - nothing else needs it. */
export function MobileNav({ categories }: { categories: Pick<Category, "slug" | "name" | "productCount">[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid size-10 place-items-center rounded-pill text-foreground transition-colors hover:bg-surface-muted lg:hidden"
      >
        <TbMenu2 className="size-5" aria-hidden />
      </button>

      <Drawer open={open} onClose={close} side="left" title="Browse">
        <div className="space-y-5 p-5">
          <HeaderSearch />

          <nav>
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Categories</p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/products"
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-muted"
                >
                  All products
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    onClick={close}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                  >
                    {category.name}
                    <span className="text-xs text-muted">{category.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="border-t border-[var(--border)] pt-4">
            <ul className="space-y-0.5">
              {[
                { href: "/products?sort=discount&onSale=1", label: "Deals" },
                { href: "/products?sort=newest", label: "New arrivals" },
                { href: "/cart", label: "Cart" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Drawer>
    </>
  );
}
