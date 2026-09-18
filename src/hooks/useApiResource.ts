"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api/http-error";

export type ResourceStatus = "idle" | "loading" | "success" | "error";

export interface ApiResource<T> {
  data: T | null;
  error: ApiError | null;
  status: ResourceStatus;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

interface Options<T> {
  enabled?: boolean;
  initialData?: T | null;
  /** Keep showing the previous result while a new one loads (no flicker). */
  keepPreviousData?: boolean;
}

/**
 * Generic data hook for the service layer.
 *
 * Owns the four things every client fetch needs and nothing else:
 *   - loading / error / empty status
 *   - an `AbortController` per request, cancelled on unmount or key change
 *   - a guard so a slow earlier response can never overwrite a newer one
 *   - a stable `refetch` for error-state retry buttons
 *
 * Status is *derived*, not stored: a result carries the key it was fetched
 * for, so "is this still loading?" is a comparison during render rather than a
 * second state update inside the effect. The fetcher is held in a ref (written
 * in an effect, never during render) so passing an inline arrow does not
 * retrigger the request.
 */
export function useApiResource<T>(
  fetcher: (options: { signal: AbortSignal }) => Promise<T>,
  deps: readonly unknown[],
  { enabled = true, initialData = null, keepPreviousData = false }: Options<T> = {},
): ApiResource<T> {
  const [reloadToken, setReloadToken] = useState(0);
  const key = `${reloadToken}:${JSON.stringify(deps)}`;

  const [result, setResult] = useState<{ key: string; data: T | null; error: ApiError | null }>({
    key: enabled ? "" : key,
    data: initialData,
    error: null,
  });

  const fetcherRef = useRef(fetcher);
  // Declared before the fetch effect so the latest fetcher is in place by the
  // time that effect runs in the same commit.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    fetcherRef
      .current({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({ key, data, error: null });
      })
      .catch((caught: unknown) => {
        const apiError = ApiError.from(caught);
        // An abort is the expected outcome of navigating away - not an error.
        if (apiError.aborted || controller.signal.aborted) return;
        setResult({ key, data: null, error: apiError });
      });

    return () => controller.abort();
  }, [enabled, key]);

  const settled = result.key === key;
  const status: ResourceStatus = !enabled ? "idle" : settled ? (result.error ? "error" : "success") : "loading";
  const data = settled || keepPreviousData ? result.data : initialData;

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    data,
    error: settled ? result.error : null,
    status,
    isLoading: status === "loading" && data === null,
    isFetching: status === "loading",
    refetch,
  };
}
