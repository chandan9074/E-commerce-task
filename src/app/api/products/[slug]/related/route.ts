import { CACHE, createRouteHandler, simulateLatency } from "@/lib/api/route-handler";
import { productRepository } from "@/lib/data/product.repository";

interface Context {
  params: Promise<{ slug: string }>;
}

/** GET /api/products/:slug/related?limit=8 */
export const GET = createRouteHandler<Context>(async (request, { params }) => {
  await simulateLatency(120, 400);

  const { slug } = await params;
  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(1, limitParam), 12) : 8;

  return { data: productRepository.getRelated(slug, limit), cacheControl: CACHE.catalogue };
});
