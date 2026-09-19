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

/** What the UI needs to render an error state. */
export interface NormalisedError {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
  /** True when the request was aborted rather than failing. */
  aborted: boolean;
  retryable: boolean;
}
