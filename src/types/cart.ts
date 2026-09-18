import type { ProductSummary } from "./product";

/**
 * Cart lines store a snapshot of the product rather than a reference, so a
 * persisted cart still renders after a refresh without re-fetching anything.
 */
export interface CartItem {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  thumbnail: string;
  stock: number;
  freeShipping: boolean;
  quantity: number;
  addedAt: number;
}

export type CartLineInput = Pick<
  ProductSummary,
  | "id"
  | "slug"
  | "title"
  | "brand"
  | "price"
  | "compareAtPrice"
  | "currency"
  | "thumbnail"
  | "stock"
  | "freeShipping"
>;

export interface CartTotals {
  itemCount: number;
  lineCount: number;
  subtotal: number;
  savings: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingRemaining: number;
}

export interface OrderLine {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface OrderPayload {
  contact: { email: string; phone: string };
  shipping: {
    fullName: string;
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };
  billingSameAsShipping: boolean;
  billing?: OrderPayload["shipping"];
  payment: { method: string; cardholder?: string; last4?: string };
  notes?: string;
  items: OrderLine[];
  totals: CartTotals;
}

export interface OrderConfirmation {
  orderId: string;
  placedAt: string;
  email: string;
  estimatedDelivery: string;
  total: number;
  currency: string;
  itemCount: number;
}
