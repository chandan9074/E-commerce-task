"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/States";

/** `reset` re-renders the segment, which is the retry for a server failure. */
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
