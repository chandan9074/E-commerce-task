import { CACHE, createRouteHandler, simulateLatency } from "@/lib/api/route-handler";
import { productRepository } from "@/lib/data/product.repository";

/** GET /api/categories - taxonomy, brands and price bounds. */
export const GET = createRouteHandler(async () => {
  await simulateLatency(40, 120);

  return {
    data: {
      categories: productRepository.getCategories(),
      brands: productRepository.getBrands(),
      priceBounds: productRepository.getPriceBounds(),
    },
    cacheControl: CACHE.catalogue,
  };
});
