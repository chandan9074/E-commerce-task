"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { TbAlertTriangle, TbBuildingBank, TbCash, TbCreditCard, TbLock, TbShoppingBag } from "react-icons/tb";

import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { useCart } from "@/hooks/useCart";
import { ApiError } from "@/lib/api/http-error";
import { orderService } from "@/services";
import {
  COUNTRY_OPTIONS,
  checkoutSchema,
  type CheckoutFormValues,
  type CheckoutValues,
} from "@/validations/checkout.schema";
import { ORDER_STORAGE_KEY } from "@/lib/constants";

const PAYMENT_OPTIONS = [
  { value: "card", label: "Card", icon: TbCreditCard, hint: "Visa, Mastercard, Amex" },
  { value: "paypal", label: "PayPal", icon: TbBuildingBank, hint: "Redirects on submit" },
  { value: "cod", label: "Cash on delivery", icon: TbCash, hint: "Pay the courier" },
] as const;

const DEFAULT_VALUES: CheckoutFormValues = {
  email: "",
  phone: "",
  shipping: { fullName: "", address1: "", address2: "", city: "", state: "", postalCode: "", country: "US" },
  billingSameAsShipping: true,
  billing: { fullName: "", address1: "", address2: "", city: "", state: "", postalCode: "", country: "US" },
  paymentMethod: "card",
  cardholder: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  notes: "",
  marketingOptIn: false,
  terms: false,
};

/** Counts leaf issues in a nested React Hook Form error object. */
function countIssues(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  if ("message" in (node as object) && typeof (node as { message?: unknown }).message === "string") return 1;
  return Object.values(node as Record<string, unknown>).reduce<number>(
    (total, value) => total + countIssues(value),
    0,
  );
}

/**
 * Fields stay uncontrolled and Zod owns every rule, so the form and the
 * `/api/orders` handler validate against the same schema.
 */
export function CheckoutForm() {
  const router = useRouter();
  const { items, totals, hydrated, clear } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  // Subscribes to these two fields only, so typing elsewhere does not
  // re-render the form shell.
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const billingSame = useWatch({ control, name: "billingSameAsShipping" });

  const onSubmit = useCallback(
    async (values: CheckoutValues) => {
      setSubmitError(null);

      try {
        const payload = orderService.buildPayload(values, items, totals);
        const confirmation = await orderService.create(payload);

        // Passed to the success page without exposing it in the URL.
        try {
          window.sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(confirmation));
        } catch {
          // The success page falls back to a generic confirmation.
        }

        clear();
        router.push("/checkout/success");
      } catch (caught) {
        const error = ApiError.from(caught);

        // Map server-side field errors back onto the form.
        if (error.code === "VALIDATION_ERROR" && Array.isArray(error.details)) {
          for (const issue of error.details as { path?: string; message?: string }[]) {
            if (issue.path && issue.message) {
              setError(issue.path as keyof CheckoutFormValues, { type: "server", message: issue.message });
            }
          }
        }

        setSubmitError(error.message);
      }
    },
    [clear, items, router, setError, totals],
  );

  /**
   * A blocked submit must never look like a dead button, so it always leaves a
   * message - the offending field may be hidden or have no inline error.
   */
  const onInvalid = useCallback((formErrors: FieldErrors<CheckoutFormValues>) => {
    const count = countIssues(formErrors);
    setSubmitError(
      count === 1
        ? "One field still needs your attention - it is highlighted above."
        : `${count} fields still need your attention - they are highlighted above.`,
    );
  }, []);

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-[720px] w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<TbShoppingBag className="size-7" aria-hidden />}
        title="There is nothing to check out"
        description="Your cart is empty. Add a product and come back - we will keep it saved for you."
        action={
          <Link href="/products" className={buttonClasses("primary")}>
            Browse products
          </Link>
        }
        className="mx-auto max-w-2xl"
      />
    );
  }

  const sectionClasses = "surface-card space-y-4 p-5 sm:p-6";

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-6">
        {/* Contact */}
        <section className={sectionClasses} aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-base font-semibold">
            1. Contact details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email?.message} required hint="Order confirmation goes here">
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register("email")}
                />
              )}
            </Field>

            <Field label="Phone" error={errors.phone?.message} required hint="For delivery updates">
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 0100"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register("phone")}
                />
              )}
            </Field>
          </div>
        </section>

        {/* Shipping */}
        <section className={sectionClasses} aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="text-base font-semibold">
            2. Shipping address
          </h2>

          <Field label="Full name" error={errors.shipping?.fullName?.message} required>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                autoComplete="name"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("shipping.fullName")}
              />
            )}
          </Field>

          <Field label="Address" error={errors.shipping?.address1?.message} required>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                autoComplete="address-line1"
                placeholder="Street and number"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("shipping.address1")}
              />
            )}
          </Field>

          <Field label="Apartment, suite (optional)" error={errors.shipping?.address2?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                autoComplete="address-line2"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("shipping.address2")}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" error={errors.shipping?.city?.message} required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  autoComplete="address-level2"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register("shipping.city")}
                />
              )}
            </Field>

            <Field label="State / region" error={errors.shipping?.state?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  autoComplete="address-level1"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register("shipping.state")}
                />
              )}
            </Field>

            <Field label="Postal code" error={errors.shipping?.postalCode?.message} required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  autoComplete="postal-code"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register("shipping.postalCode")}
                />
              )}
            </Field>
          </div>

          <Field label="Country" error={errors.shipping?.country?.message} required>
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                autoComplete="country"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("shipping.country")}
              >
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Checkbox label="Billing address is the same as shipping" {...register("billingSameAsShipping")} />
        </section>

        {/* Billing */}
        {!billingSame && (
          <section className={sectionClasses} aria-labelledby="billing-heading">
            <h2 id="billing-heading" className="text-base font-semibold">
              Billing address
            </h2>

            <Field label="Full name" error={errors.billing?.fullName?.message} required>
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("billing.fullName")} />
              )}
            </Field>

            <Field label="Address" error={errors.billing?.address1?.message} required>
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("billing.address1")} />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" error={errors.billing?.city?.message} required>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("billing.city")} />
                )}
              </Field>

              <Field label="State / region" error={errors.billing?.state?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("billing.state")} />
                )}
              </Field>

              <Field label="Postal code" error={errors.billing?.postalCode?.message} required>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    invalid={invalid}
                    {...register("billing.postalCode")}
                  />
                )}
              </Field>
            </div>

            <Field label="Country" error={errors.billing?.country?.message} required>
              {({ id, describedBy, invalid }) => (
                <Select id={id} aria-describedby={describedBy} invalid={invalid} {...register("billing.country")}>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </section>
        )}

        {/* Payment */}
        <section className={sectionClasses} aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-base font-semibold">
            3. Payment
          </h2>

          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {PAYMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = paymentMethod === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${
                      selected ? "border-brand-500 bg-brand-600/5" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="mt-0.5 size-4 accent-brand-600"
                      {...register("paymentMethod")}
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Icon className="size-4" aria-hidden />
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{option.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {errors.paymentMethod?.message && (
              <p className="mt-2 text-xs font-medium text-danger-600" role="alert">
                {errors.paymentMethod.message}
              </p>
            )}
          </fieldset>

          {paymentMethod === "card" && (
            <div className="space-y-4 border-t border-[var(--border)] pt-4">
              <Field label="Name on card" error={errors.cardholder?.message} required>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    autoComplete="cc-name"
                    aria-describedby={describedBy}
                    invalid={invalid}
                    {...register("cardholder")}
                  />
                )}
              </Field>

              <Field
                label="Card number"
                error={errors.cardNumber?.message}
                required
                hint="Demo store - try 4242 4242 4242 4242"
              >
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    aria-describedby={describedBy}
                    invalid={invalid}
                    {...register("cardNumber")}
                  />
                )}
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Expiry" error={errors.expiry?.message} required hint="MM/YY">
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="04/29"
                      aria-describedby={describedBy}
                      invalid={invalid}
                      {...register("expiry")}
                    />
                  )}
                </Field>

                <Field label="CVC" error={errors.cvc?.message} required>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      aria-describedby={describedBy}
                      invalid={invalid}
                      {...register("cvc")}
                    />
                  )}
                </Field>
              </div>
            </div>
          )}
        </section>

        {/* Review */}
        <section className={sectionClasses} aria-labelledby="review-heading">
          <h2 id="review-heading" className="text-base font-semibold">
            4. Review
          </h2>

          <Field label="Delivery notes (optional)" error={errors.notes?.message}>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                placeholder="Gate code, safe place, preferred delivery window..."
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("notes")}
              />
            )}
          </Field>

          <div className="space-y-2.5">
            <Checkbox label="Email me about restocks and price drops" {...register("marketingOptIn")} />
            <Checkbox label="I accept the terms of sale and the privacy policy" {...register("terms")} />
            {errors.terms?.message && (
              <p className="text-xs font-medium text-danger-600" role="alert">
                {errors.terms.message}
              </p>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/5 p-3 text-sm text-danger-600"
            >
              <TbAlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            {!isSubmitting && <TbLock className="size-4" aria-hidden />}
            {isSubmitting ? "Placing order..." : "Place order"}
          </Button>

          <p className="text-center text-xs text-muted">
            This is a demo storefront. No payment is processed and no card details are stored.
          </p>
        </section>
      </div>

      <CheckoutOrderSummary items={items} totals={totals} />
    </form>
  );
}
