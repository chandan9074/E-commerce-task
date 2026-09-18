import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  cartDrawerOpen: boolean;
  mobileFiltersOpen: boolean;
  quickViewSlug: string | null;
}

const initialState: UiState = {
  cartDrawerOpen: false,
  mobileFiltersOpen: false,
  quickViewSlug: null,
};

/**
 * Cross-component overlay state.
 *
 * Kept in the store (not React context) because the triggers - header button,
 * product card, cart page - live in unrelated branches of the tree, and each
 * subscriber selects only the one boolean it cares about.
 */
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    cartDrawerOpened(state) {
      state.cartDrawerOpen = true;
    },
    cartDrawerClosed(state) {
      state.cartDrawerOpen = false;
    },
    cartDrawerToggled(state) {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    mobileFiltersToggled(state, action: PayloadAction<boolean | undefined>) {
      state.mobileFiltersOpen = action.payload ?? !state.mobileFiltersOpen;
    },
    quickViewOpened(state, action: PayloadAction<string>) {
      state.quickViewSlug = action.payload;
    },
    quickViewClosed(state) {
      state.quickViewSlug = null;
    },
  },
});

export const {
  cartDrawerOpened,
  cartDrawerClosed,
  cartDrawerToggled,
  mobileFiltersToggled,
  quickViewOpened,
  quickViewClosed,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
