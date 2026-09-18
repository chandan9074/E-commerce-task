import { request } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Category } from "@/types";
import type { RequestOptions } from "./product.service";

export interface TaxonomyResponse {
  categories: Category[];
  brands: string[];
  priceBounds: { min: number; max: number };
}

export const categoryService = {
  getTaxonomy(options: RequestOptions = {}): Promise<TaxonomyResponse> {
    return request<TaxonomyResponse>({
      method: "get",
      url: endpoints.categories.list(),
      signal: options.signal,
    });
  },
};
