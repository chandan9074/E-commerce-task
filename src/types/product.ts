export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
  helpfulCount: number;
}

/** The full record. List endpoints return {@link ProductSummary} instead. */
export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  categoryName: string;
  subcategory: string;
  subcategoryName: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number;
  currency: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  color: string;
  tags: string[];
  images: ProductImage[];
  thumbnail: string;
  shortDescription: string;
  description: string;
  specs: ProductSpec[];
  unitsSold: number;
  featured: boolean;
  freeShipping: boolean;
  createdAt: string;
  reviews: Review[];
}

/** The fields a card actually renders. */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "slug"
  | "title"
  | "brand"
  | "category"
  | "categoryName"
  | "price"
  | "compareAtPrice"
  | "discountPercent"
  | "currency"
  | "rating"
  | "reviewCount"
  | "stock"
  | "thumbnail"
  | "shortDescription"
  | "tags"
  | "freeShipping"
>;

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
  productCount: number;
  image: string;
}

export const SORT_OPTIONS = [
  "relevance",
  "price-asc",
  "price-desc",
  "rating-desc",
  "newest",
  "popular",
  "discount",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

/** A normalised query, produced by the search-param parser. */
export interface ProductQuery {
  search: string;
  category: string[];
  brand: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sort: SortOption;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

/** Counted against the current query, so the numbers stay meaningful. */
export interface ProductFacets {
  categories: FacetBucket[];
  brands: FacetBucket[];
  priceRange: { min: number; max: number };
  ratings: FacetBucket[];
}

export interface ProductListResult {
  items: ProductSummary[];
  pagination: PaginationMeta;
  facets: ProductFacets;
  appliedQuery: ProductQuery;
}
