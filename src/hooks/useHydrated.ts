"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` during SSR and the hydrating render, `true` afterwards.
 *
 * `useSyncExternalStore` is the right tool here rather than a
 * `useState` + `useEffect` pair: React knows the server and client snapshots
 * differ, so it switches after hydration without a mismatch warning and
 * without an extra cascading render.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
