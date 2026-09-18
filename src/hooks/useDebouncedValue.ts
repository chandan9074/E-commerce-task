"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` only after it has stopped changing for `delay` ms.
 *
 * Every timer is cleared on change/unmount, so a fast typist schedules exactly
 * one network request instead of one per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) return;

    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
    // `debounced` is intentionally excluded: including it would restart the
    // timer every time the debounced value lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return debounced;
}
