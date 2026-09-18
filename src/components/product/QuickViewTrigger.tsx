"use client";

import { memo, useCallback } from "react";
import { TbEye } from "react-icons/tb";

import { useAppDispatch } from "@/store/hooks";
import { quickViewOpened } from "@/store/slices/ui.slice";
import { cn } from "@/lib/utils/cn";

/**
 * Opens the quick-view dialog for a product.
 *
 * Only the slug crosses the boundary - the dialog fetches the full record
 * through the product service when (and only when) it is actually opened.
 */
export const QuickViewTrigger = memo(function QuickViewTrigger({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const onClick = useCallback(() => dispatch(quickViewOpened(slug)), [dispatch, slug]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Quick view: ${title}`}
      className={cn(
        "grid size-9 place-items-center rounded-pill bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-brand-600",
        className,
      )}
    >
      <TbEye className="size-4.5" aria-hidden />
    </button>
  );
});
