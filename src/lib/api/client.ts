import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { ApiError } from "./http-error";
import { SITE } from "@/lib/constants";
import type { ApiEnvelope, ApiErrorCode, ApiMeta } from "@/types";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: { startedAt: number; requestId: string };
  }
}

function resolveBaseUrl() {
  // Relative base keeps browser requests same-origin.
  if (typeof window !== "undefined") return "/api";
  return `${SITE.url.replace(/\/$/, "")}/api`;
}

export const httpClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  config.metadata = { startedAt: Date.now(), requestId };
  config.headers.set("x-request-id", requestId);
  config.headers.set("x-client", "aurelia-web");

  return config;
});

httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const envelope = response.data;

    if (!envelope || typeof envelope !== "object" || !("success" in envelope)) {
      throw new ApiError("SERVER_ERROR", "The server returned an unexpected response.", {
        status: response.status,
      });
    }

    // A 200 carrying `success: false` is still a failure.
    if (!envelope.success) {
      throw new ApiError(envelope.error.code, envelope.error.message, {
        status: response.status,
        details: envelope.error.details,
      });
    }

    logTiming(response.config, response.status, envelope.meta);
    return response;
  },
  (error: unknown) => {
    throw normaliseError(error);
  },
);

function logTiming(config: InternalAxiosRequestConfig, status: number, meta?: ApiMeta) {
  if (process.env.NODE_ENV === "production") return;
  const elapsed = config.metadata ? Date.now() - config.metadata.startedAt : 0;
  console.debug(
    `[api] ${config.method?.toUpperCase()} ${config.url} -> ${status} in ${elapsed}ms` +
      (meta ? ` (server ${meta.durationMs}ms)` : ""),
  );
}

/** Converts any axios failure into an ApiError. */
export function normaliseError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError("ABORTED", "Request cancelled.", { aborted: true });
  }

  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("TIMEOUT", "The request timed out.", { cause: error });
    }

    const envelope = error.response?.data as ApiEnvelope<unknown> | undefined;
    if (envelope && typeof envelope === "object" && "success" in envelope && !envelope.success) {
      return new ApiError(envelope.error.code, envelope.error.message, {
        status: error.response?.status,
        details: envelope.error.details,
        cause: error,
      });
    }

    if (!error.response) {
      return new ApiError("NETWORK_ERROR", "Unable to reach the server.", { cause: error });
    }

    return new ApiError(statusToCode(error.response.status), error.message, {
      status: error.response.status,
      cause: error,
    });
  }

  return ApiError.from(error);
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 404) return "NOT_FOUND";
  if (status === 400) return "BAD_REQUEST";
  if (status === 422) return "VALIDATION_ERROR";
  if (status === 429) return "RATE_LIMITED";
  return "SERVER_ERROR";
}

interface InFlightEntry {
  promise: Promise<unknown>;
  controller: AbortController;
  subscribers: number;
}

const inFlight = new Map<string, InFlightEntry>();

function dedupeKey(config: AxiosRequestConfig) {
  const params =
    config.params instanceof URLSearchParams ? config.params.toString() : JSON.stringify(config.params ?? {});
  return `${config.method ?? "get"}:${config.url}:${params}`;
}

/**
 * Typed request helper. Returns the envelope's `data`.
 *
 * Identical concurrent GETs share one request; it is aborted only once every
 * caller has abandoned it.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const method = (config.method ?? "get").toLowerCase();

  if (method !== "get") {
    const response = await httpClient.request<ApiEnvelope<T>>(config);
    return (response.data as { data: T }).data;
  }

  const { signal, ...rest } = config;
  // Axios types this as GenericAbortSignal, which lacks addEventListener.
  const callerSignal = signal as AbortSignal | undefined;
  const key = dedupeKey(config);

  let entry = inFlight.get(key);
  if (!entry) {
    const controller = new AbortController();
    const created: InFlightEntry = {
      controller,
      subscribers: 0,
      promise: httpClient
        .request<ApiEnvelope<T>>({ ...rest, signal: controller.signal })
        .then((response) => (response.data as { data: T }).data)
        .finally(() => {
          inFlight.delete(key);
        }),
    };
    inFlight.set(key, created);
    entry = created;
  }

  const active = entry;
  active.subscribers += 1;

  const release = () => {
    active.subscribers -= 1;
    if (active.subscribers <= 0) active.controller.abort();
  };

  if (!callerSignal) {
    return active.promise.finally(() => {
      active.subscribers -= 1;
    }) as Promise<T>;
  }

  if (callerSignal.aborted) {
    release();
    throw new ApiError("ABORTED", "Request cancelled.", { aborted: true });
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      release();
      reject(new ApiError("ABORTED", "Request cancelled.", { aborted: true }));
    };

    callerSignal.addEventListener("abort", onAbort, { once: true });

    (active.promise as Promise<T>)
      .then(resolve, reject)
      .finally(() => {
        callerSignal.removeEventListener("abort", onAbort);
        if (!callerSignal.aborted) active.subscribers -= 1;
      });
  });
}
