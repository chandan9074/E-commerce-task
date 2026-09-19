import { ApiError } from "@/lib/api/http-error";
import { CACHE, createRouteHandler, simulateLatency } from "@/lib/api/route-handler";
import { productRepository } from "@/lib/data/product.repository";

interface Context {
  params: Promise<{ slug: string }>;
}

/** GET /api/products/:slug - full record, 404 for an unknown slug. */
export const GET = createRouteHandler<Context>(async (_request, { params }) => {
  await simulateLatency();

  const { slug } = await params;
  if (!slug || slug.length > 120) throw ApiError.badRequest("A valid product slug is required.");

  return { data: productRepository.getBySlug(slug), cacheControl: CACHE.catalogue };
});
