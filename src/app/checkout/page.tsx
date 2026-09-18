import type { Metadata } from "next";
import Link from "next/link";
import { TbArrowLeft } from "react-icons/tb";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely.",
  robots: { index: false, follow: false },
};

/** Shell is server-rendered; the form itself is the client boundary. */
export default function CheckoutPage() {
  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <Link
          href="/cart"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <TbArrowLeft className="size-4" aria-hidden />
          Back to cart
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
        <p className="mt-1.5 text-sm text-muted">
          Four short steps. Validation runs as you go, and again on the server before the order is accepted.
        </p>
      </div>

      <CheckoutForm />
    </div>
  );
}
