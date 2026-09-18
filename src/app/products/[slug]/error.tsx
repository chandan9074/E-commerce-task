"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/States";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[product] render failed", error);
  }, [error]);

  return (
    <div className="container-page py-16">
      <ErrorState
        title="We could not load this product"
        error={error}
        onRetry={reset}
        className="mx-auto max-w-2xl"
      />
    </div>
  );
}
