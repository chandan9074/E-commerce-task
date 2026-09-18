"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/States";

/** Root error boundary - the last stop before Next's default error screen. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <div className="container-page py-24">
      <ErrorState
        title="Something went wrong"
        error={error}
        onRetry={reset}
        className="mx-auto max-w-2xl"
      />
    </div>
  );
}
