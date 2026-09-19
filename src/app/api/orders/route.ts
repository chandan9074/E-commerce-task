import { ApiError } from "@/lib/api/http-error";
import { CACHE, createRouteHandler, simulateLatency } from "@/lib/api/route-handler";
import { productRepository } from "@/lib/data/product.repository";
import { orderPayloadSchema } from "@/validations/checkout.schema";
import type { OrderConfirmation } from "@/types";

/**
 * POST /api/orders - mock order placement. Re-validates the payload and
 * re-checks stock server-side.
 */
export const POST = createRouteHandler(async (request) => {
  await simulateLatency(400, 900);

  const body = await request.json().catch(() => {
    throw ApiError.badRequest("The request body must be valid JSON.");
  });

  const parsed = orderPayloadSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("VALIDATION_ERROR", "Some details need fixing before we can place the order.", {
      details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }

  const order = parsed.data;

  const unavailable = order.items
    .map((line) => ({ line, product: productRepository.findById(line.productId) ?? null }))
    .filter(({ line, product }) => !product || product.stock < line.quantity);

  if (unavailable.length > 0) {
    throw new ApiError("VALIDATION_ERROR", "Some items are no longer available in the quantity requested.", {
      details: unavailable.map(({ line }) => ({ productId: line.productId, title: line.title })),
    });
  }

  const placedAt = new Date();
  const estimated = new Date(placedAt.getTime() + 4 * 86400000);

  const confirmation: OrderConfirmation = {
    orderId: `AUR-${placedAt.getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    placedAt: placedAt.toISOString(),
    email: order.contact.email,
    estimatedDelivery: estimated.toISOString(),
    total: order.totals.total,
    currency: "USD",
    itemCount: order.totals.itemCount,
  };

  return { data: confirmation, status: 201, cacheControl: CACHE.none };
});
