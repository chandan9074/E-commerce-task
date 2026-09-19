import { CACHE, createRouteHandler, simulateLatency } from "@/lib/api/route-handler";
import { productRepository } from "@/lib/data/product.repository";
import { parseProductQuery } from "@/helpers/product-query.helpers";

/**
 * GET /api/products
 * q, category[], brand[], minPrice, maxPrice, rating, inStock, onSale, sort,
 * page, limit - parsed by the same parser the listing page uses.
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
