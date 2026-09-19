import { z } from "zod";

// Shared by the checkout form and the /api/orders handler.

const COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "NL", "BD", "IN", "AE"] as const;
export const PAYMENT_METHODS = ["card", "paypal", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const COUNTRY_OPTIONS: { value: (typeof COUNTRIES)[number]; label: string }[] = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "BD", label: "Bangladesh" },
  { value: "IN", label: "India" },
  { value: "AE", label: "United Arab Emirates" },
];

/** Luhn check, to catch mistyped card numbers. */
export function isLuhnValid(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter the full name on the delivery")
    .max(80, "That name is too long"),
  address1: z.string().trim().min(5, "Enter a street address").max(120),
  address2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city").max(60),
  state: z.string().trim().max(60).optional().or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .min(3, "Enter a postal or ZIP code")
    .max(12)
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]*$/, "That postal code does not look right"),
  country: z.enum(COUNTRIES, { message: "Select a country" }),
});

export type AddressValues = z.infer<typeof addressSchema>;

/**
 * Billing is unconstrained at the field level; the real rules are applied in
 * `superRefine` only when a separate billing address is in use.
 *
 * `addressSchema.partial()` cannot be used: it still validates a key when
 * present, so the empty strings the form starts with would fail `min()` and
 * block submit with errors on hidden fields.
 */
const billingDraftSchema = z
  .object({
    fullName: z.string().max(80),
    address1: z.string().max(120),
    address2: z.string().max(120),
    city: z.string().max(60),
    state: z.string().max(60),
    postalCode: z.string().max(12),
    country: z.string().max(2),
  })
  .partial();

export const checkoutSchema = z
  .object({
    email: z.email("Enter a valid email address").max(120),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a contact number")
      .max(20)
      .regex(/^[+]?[\d\s()-]+$/, "Use digits, spaces, + and - only"),

    shipping: addressSchema,

    billingSameAsShipping: z.boolean(),
    billing: billingDraftSchema.optional(),

    paymentMethod: z.enum(PAYMENT_METHODS),
    cardholder: z.string().trim().max(80).optional().or(z.literal("")),
    cardNumber: z.string().trim().max(24).optional().or(z.literal("")),
    expiry: z.string().trim().max(7).optional().or(z.literal("")),
    cvc: z.string().trim().max(4).optional().or(z.literal("")),

    notes: z.string().trim().max(400, "Keep delivery notes under 400 characters").optional().or(z.literal("")),
    marketingOptIn: z.boolean().optional(),
    // `refine` rather than `literal(true)` so the input type stays boolean.
    terms: z.boolean().refine((value) => value === true, {
      message: "You need to accept the terms to place the order",
    }),
  })
  .superRefine((values, ctx) => {
    // Card fields are only required when paying by card.
    if (values.paymentMethod === "card") {
      if (!values.cardholder || values.cardholder.length < 2) {
        ctx.addIssue({ code: "custom", path: ["cardholder"], message: "Enter the name on the card" });
      }
      if (!values.cardNumber || !isLuhnValid(values.cardNumber)) {
        ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a valid card number" });
      }
      if (!values.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry)) {
        ctx.addIssue({ code: "custom", path: ["expiry"], message: "Use MM/YY" });
      } else {
        const [month, year] = values.expiry.split("/").map(Number);
        const expiresAt = new Date(2000 + year, month, 0, 23, 59, 59);
        if (expiresAt.getTime() < Date.now()) {
          ctx.addIssue({ code: "custom", path: ["expiry"], message: "That card has expired" });
        }
      }
      if (!values.cvc || !/^\d{3,4}$/.test(values.cvc)) {
        ctx.addIssue({ code: "custom", path: ["cvc"], message: "3 or 4 digits" });
      }
    }

    // A separate billing address has to be complete.
    if (!values.billingSameAsShipping) {
      const result = addressSchema.safeParse(values.billing ?? {});
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ code: "custom", path: ["billing", ...issue.path], message: issue.message });
        }
      }
    }
  });

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
export type CheckoutValues = z.output<typeof checkoutSchema>;

/** Payload accepted by POST /api/orders. The card number never leaves the form. */
export const orderPayloadSchema = z.object({
  contact: z.object({ email: z.email(), phone: z.string().min(5) }),
  shipping: addressSchema,
  billingSameAsShipping: z.boolean(),
  billing: addressSchema.optional(),
  payment: z.object({
    method: z.enum(PAYMENT_METHODS),
    cardholder: z.string().optional(),
    last4: z.string().regex(/^\d{4}$/).optional(),
  }),
  notes: z.string().max(400).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        title: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
        price: z.number().nonnegative(),
      }),
    )
    .min(1, "Your cart is empty"),
  totals: z.object({
    itemCount: z.number().int().nonnegative(),
    lineCount: z.number().int().nonnegative(),
    subtotal: z.number().nonnegative(),
    savings: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    total: z.number().nonnegative(),
    freeShippingRemaining: z.number().nonnegative(),
  }),
});

export type OrderPayloadInput = z.infer<typeof orderPayloadSchema>;
