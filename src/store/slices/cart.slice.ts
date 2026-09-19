import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { clampQuantity } from "@/helpers/cart.helpers";
import { COMMERCE } from "@/lib/constants";
import type { CartItem, CartLineInput } from "@/types";

export interface CartState {
  items: CartItem[];
  /** False until localStorage has been read on the client. */
  hydrated: boolean;
  /** Product id of the most recent add. */
  lastAddedId: string | null;
}

const initialState: CartState = {
  items: [],
  hydrated: false,
  lastAddedId: null,
};

/** Quantities are clamped against stock and the per-line maximum here. */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartHydrated(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.hydrated = true;
    },

    itemAdded: {
      reducer(state, action: PayloadAction<{ product: CartLineInput; quantity: number; addedAt: number }>) {
        const { product, quantity, addedAt } = action.payload;
        if (product.stock <= 0) return;

        const existing = state.items.find((item) => item.id === product.id);

        if (existing) {
          existing.quantity = clampQuantity(existing.quantity + quantity, product.stock);
          // Refresh the snapshot in case price or stock changed.
          existing.price = product.price;
          existing.compareAtPrice = product.compareAtPrice;
          existing.stock = product.stock;
        } else {
          state.items.unshift({
            id: product.id,
            slug: product.slug,
            title: product.title,
            brand: product.brand,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            currency: product.currency,
            thumbnail: product.thumbnail,
            stock: product.stock,
            freeShipping: product.freeShipping,
            quantity: clampQuantity(quantity, product.stock),
            addedAt,
          });
        }

        state.lastAddedId = product.id;
      },
      // Generated in `prepare` so the reducer stays pure.
      prepare(product: CartLineInput, quantity = 1) {
        return { payload: { product, quantity, addedAt: Date.now() } };
      },
    },

    itemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.lastAddedId === action.payload) state.lastAddedId = null;
    },

    quantitySet(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (!item) return;

      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((entry) => entry.id !== action.payload.id);
        return;
      }

      item.quantity = clampQuantity(action.payload.quantity, item.stock);
    },

    quantityIncremented(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item && item.quantity < Math.min(item.stock, COMMERCE.maxQuantityPerLine)) item.quantity += 1;
    },

    quantityDecremented(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (!item) return;
      if (item.quantity <= 1) state.items = state.items.filter((entry) => entry.id !== action.payload);
      else item.quantity -= 1;
    },

    cartCleared(state) {
      state.items = [];
      state.lastAddedId = null;
    },

    lastAddedCleared(state) {
      state.lastAddedId = null;
    },
  },
});

export const {
  cartHydrated,
  itemAdded,
  itemRemoved,
  quantitySet,
  quantityIncremented,
  quantityDecremented,
  cartCleared,
  lastAddedCleared,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
