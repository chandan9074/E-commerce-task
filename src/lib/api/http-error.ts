import type { ApiErrorCode, NormalisedError } from "@/types";

/**
 * The one error shape the whole app understands.
 *
 * Route handlers throw it, the axios interceptor converts transport failures
 * into it, and error UI reads it. Components never see an `AxiosError`.
 */
export class ApiError extends Error implements NormalisedError {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly aborted: boolean;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { status?: number; details?: unknown; aborted?: boolean; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.code = code;
    this.status = options.status ?? statusForCode(code);
    this.details = options.details;
    this.aborted = options.aborted ?? code === "ABORTED";
  }

  /** Retrying a 404 or a validation failure just repeats the same answer. */
  get retryable() {
    return !this.aborted && (this.status >= 500 || this.code === "NETWORK_ERROR" || this.code === "TIMEOUT");
  }

  static notFound(message = "The requested resource could not be found.") {
    return new ApiError("NOT_FOUND", message);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError("BAD_REQUEST", message, { details });
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    return new ApiError("SERVER_ERROR", error instanceof Error ? error.message : "Something went wrong.", {
      cause: error,
    });
  }

  toJSON() {
    return { code: this.code, message: this.message, details: this.details };
  }
}

function statusForCode(code: ApiErrorCode): number {
  switch (code) {
    case "BAD_REQUEST":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 422;
    case "RATE_LIMITED":
      return 429;
    case "TIMEOUT":
      return 504;
    case "NETWORK_ERROR":
    case "ABORTED":
      return 0;
    default:
      return 500;
  }
}

/** Copy shown to users - deliberately free of stack traces and jargon. */
export function friendlyMessage(error: NormalisedError | null | undefined) {
  if (!error) return "Something went wrong.";
  switch (error.code) {
    case "NETWORK_ERROR":
      return "We could not reach the store. Check your connection and try again.";
    case "TIMEOUT":
      return "That request took too long. Please try again.";
    case "NOT_FOUND":
      return "We could not find what you were looking for.";
    case "RATE_LIMITED":
      return "Too many requests. Give it a moment and try again.";
    default:
      return error.message || "Something went wrong on our side.";
  }
}
