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
  /** Keep the previous result visible while a new one loads. */
  keepPreviousData?: boolean;
}

/**
 * Data hook for the service layer: status, abort on unmount or key change,
 * and a stable `refetch`.
 *
 * Status is derived rather than stored - a result carries the key it was
 * fetched for - so a stale response cannot overwrite a newer one. The fetcher
 * lives in a ref so an inline arrow does not retrigger the request.
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
  // Declared before the fetch effect so it runs first in the same commit.
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
        // Aborts are expected when navigating away.
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
