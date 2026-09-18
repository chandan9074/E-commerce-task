import { request } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CartItem, CartTotals, OrderConfirmation, OrderPayload } from "@/types";
import type { CheckoutValues } from "@/validations/checkout.schema";
import type { RequestOptions } from "./product.service";

/**
 * Order service.
 *
 * Also owns the form-values -> API-payload mapping, so the checkout component
 * stays a form and nothing else. Note the card number never leaves this file:
 * only the last four digits are sent.
 */
export const orderService = {
  buildPayload(values: CheckoutValues, items: CartItem[], totals: CartTotals): OrderPayload {
    const digits = (values.cardNumber ?? "").replace(/\D/g, "");

    return {
      contact: { email: values.email, phone: values.phone },
      shipping: {
        fullName: values.shipping.fullName,
        address1: values.shipping.address1,
        address2: values.shipping.address2 || undefined,
        city: values.shipping.city,
        state: values.shipping.state || undefined,
        postalCode: values.shipping.postalCode,
        country: values.shipping.country,
      },
      billingSameAsShipping: values.billingSameAsShipping,
      billing:
        values.billingSameAsShipping || !values.billing
          ? undefined
          : {
              fullName: values.billing.fullName ?? "",
              address1: values.billing.address1 ?? "",
              address2: values.billing.address2 || undefined,
              city: values.billing.city ?? "",
              state: values.billing.state || undefined,
              postalCode: values.billing.postalCode ?? "",
              country: values.billing.country ?? values.shipping.country,
            },
      payment: {
        method: values.paymentMethod,
        cardholder: values.paymentMethod === "card" ? values.cardholder || undefined : undefined,
        last4: values.paymentMethod === "card" && digits.length >= 4 ? digits.slice(-4) : undefined,
      },
      notes: values.notes || undefined,
      items: items.map((item) => ({
        productId: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      totals,
    };
  },

  create(payload: OrderPayload, options: RequestOptions = {}): Promise<OrderConfirmation> {
    return request<OrderConfirmation>({
      method: "post",
      url: endpoints.orders.create(),
      data: payload,
      signal: options.signal,
    });
  },
};
