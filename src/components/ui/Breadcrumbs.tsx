import Link from "next/link";
import { TbChevronRight } from "react-icons/tb";

import { cn } from "@/lib/utils/cn";
import { truncate } from "@/lib/utils/format";

export interface Crumb {
  name: string;
  href: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && <TbChevronRight className="size-3.5 opacity-60" aria-hidden />}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {truncate(item.name, 48)}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-brand-600">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
