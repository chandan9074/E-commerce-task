"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "./index";
import { cartHydrated, readPersistedCart } from "./middleware/cart-persistence";

/**
 * Store boundary for the whole app.
 *
 * The store is created exactly once per client via a lazy `useState`
 * initialiser - calling `makeStore()` in the render body would build a new
 * store on every re-render, and a module-level singleton would leak one
 * visitor's cart into another's render on the server.
 *
 * The saved cart is read in an effect. Reading localStorage during render
 * would produce server HTML that disagrees with the first client render; doing
 * it after mount is exactly the "client synchronisation" case `useEffect`
 * exists for.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    if (store.getState().cart.hydrated) return;
    store.dispatch(cartHydrated(readPersistedCart()));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
