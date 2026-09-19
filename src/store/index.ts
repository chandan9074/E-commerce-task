import { configureStore } from "@reduxjs/toolkit";

import { cartPersistenceMiddleware } from "./middleware/cart-persistence";
import { cartReducer } from "./slices/cart.slice";
import { uiReducer } from "./slices/ui.slice";

/** A factory, not a singleton - a shared store would leak carts on the server. */
export function makeStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: true }).prepend(cartPersistenceMiddleware.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
