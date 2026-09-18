import { CACHE, createRouteHandler, simulateLatency } from "@/lib/api/route-handler";
import { productRepository } from "@/lib/data/product.repository";
import { parseProductQuery } from "@/helpers/product-query.helpers";

/**
 * GET /api/products
 *
 * Query params: q, category[], brand[], minPrice, maxPrice, rating, inStock,
 * onSale, sort, page, limit. Parsed by the shared parser, so the contract is
 * identical to the one the URL bar uses.
 */
export const GET = createRouteHandler(async (request) => {
  await simulateLatency();

  const query = parseProductQuery(request.nextUrl.searchParams);
  const result = productRepository.list(query);

  return {
    data: result,
    cacheControl: CACHE.listing,
    meta: { total: result.pagination.total, page: result.pagination.page },
  };
});
