"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/States";

/**
 * Route error boundary. `reset` re-renders the segment, which is the correct
 * retry for a Server Component failure - a client-side refetch would not help.
 */
export default function ProductsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[products] render failed", error);
  }, [error]);

  return (
    <div className="container-page py-16">
      <ErrorState
        title="We could not load the catalogue"
        error={error}
        onRetry={reset}
        className="mx-auto max-w-2xl"
      />
    </div>
  );
}
