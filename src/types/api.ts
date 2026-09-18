/** Transport-level contracts shared by route handlers, axios and services. */

export interface ApiMeta {
  requestId: string;
  durationMs: number;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "ABORTED"
  | "SERVER_ERROR";

/** Everything the UI needs to render an error state, and nothing more. */
export interface NormalisedError {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
  /** True when the failure came from an aborted request, not a real problem. */
  aborted: boolean;
  retryable: boolean;
}
