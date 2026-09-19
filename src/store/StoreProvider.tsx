"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "./index";
import { cartHydrated, readPersistedCart } from "./middleware/cart-persistence";

/**
 * Creates the store once per client (lazy `useState`) and loads the saved cart
 * after mount - reading localStorage during render would break hydration.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    if (store.getState().cart.hydrated) return;
    store.dispatch(cartHydrated(readPersistedCart()));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
