"use client";

import { useEffect } from "react";

/**
 * Freezes background scrolling while an overlay is open.
 *
 * The cleanup restores the exact previous value rather than clearing it, so
 * two overlays closing in any order cannot leave the page unscrollable - the
 * "always undo precisely what you did" rule for DOM side effects.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    // Compensating for the removed scrollbar stops the layout jumping sideways.
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
