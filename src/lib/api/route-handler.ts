import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { ApiError } from "./http-error";
import type { ApiFailure, ApiMeta, ApiSuccess } from "@/types";

export interface RouteResult<T> {
  data: T;
  /** Response `Cache-Control`. */
  cacheControl?: string;
  status?: number;
  meta?: Record<string, unknown>;
}

export const CACHE = {
  catalogue: "public, s-maxage=300, stale-while-revalidate=1800",
  listing: "public, s-maxage=60, stale-while-revalidate=300",
  none: "no-store",
} as const;

type Handler<Ctx> = (request: NextRequest, context: Ctx) => Promise<RouteResult<unknown>>;

function buildMeta(requestId: string, startedAt: number, extra?: Record<string, unknown>): ApiMeta {
  return { requestId, durationMs: Math.round(performance.now() - startedAt), ...extra };
}

export function createRouteHandler<Ctx>(handler: Handler<Ctx>) {
  return async function routeHandler(request: NextRequest, context: Ctx) {
    const startedAt = performance.now();
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

    try {
      const { data, cacheControl = CACHE.listing, status = 200, meta } = await handler(request, context);
      const body: ApiSuccess<unknown> = { success: true, data, meta: buildMeta(requestId, startedAt, meta) };

      return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": cacheControl, "x-request-id": requestId },
      });
    } catch (caught) {
      const error = ApiError.from(caught);

      if (error.status >= 500) {
        console.error(`[api] ${request.method} ${request.nextUrl.pathname} failed`, error);
      }

      const body: ApiFailure = {
        success: false,
        error: error.toJSON(),
        meta: buildMeta(requestId, startedAt),
      };

      return NextResponse.json(body, {
        status: error.status || 500,
        headers: { "Cache-Control": CACHE.none, "x-request-id": requestId },
      });
    }
  };
}

/** Artificial latency in development so loading states are visible. */
export async function simulateLatency(min = 60, max = 220) {
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_API_DELAY === "0") return;
  const ms = Math.floor(Math.random() * (max - min)) + min;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
