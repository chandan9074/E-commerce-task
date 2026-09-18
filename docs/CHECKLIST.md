# Implementation Checklist — Task 2: E-Commerce Product Search & Checkout

Legend: `[x]` done. Every item below is implemented and verified via `npm run verify`
(typecheck + lint + build) plus manual `curl` checks of every endpoint and route.

## Phase 0 — Foundation
- [x] Next.js 16 (App Router) + TypeScript + Tailwind v4 + ESLint scaffold
- [x] Dependencies: Redux Toolkit, react-redux, axios, react-icons, react-hook-form, zod, @hookform/resolvers, clsx, tailwind-merge
- [x] Design tokens: Deep Indigo + Amber palette, typography, radii, shadows (light + dark)
- [x] `next.config.ts`: remote image patterns, compiler options
- [x] Global layout shell: Header, Footer, Container, providers

## Phase 1 — Data layer (mock dataset)
- [x] Deterministic generator producing **500+ products** into `src/lib/data/products.json`
- [x] Rich fields: id, slug, title, brand, category, subcategory, price, compareAtPrice, discount, rating, reviewCount, stock, images[], tags[], specs, description, createdAt, featured
- [x] Per-product reviews (author, rating, title, body, date, verified)
- [x] Categories catalogue + brand list in `src/lib/data`
- [x] Types in `src/types` (Product, Review, Category, CartItem, ApiResponse, query params)

## Phase 2 — API layer (mock backend)
- [x] Route handlers: `GET /api/products` (search, category, brand, price, rating, inStock, sort, page, limit)
- [x] Route handler: `GET /api/products/:slug` (404 on invalid product)
- [x] Route handler: `GET /api/products/:slug/related`
- [x] Route handler: `GET /api/categories` (with facet counts + price bounds)
- [x] Query engine in `src/helpers` (filter → sort → paginate), pure + unit-testable
- [x] Consistent envelope `{ success, data, meta }` + typed `ApiError`

## Phase 3 — Client transport + services + hooks
- [x] Axios instance with **request/response interceptors** (base URL, timing, request id, error normalisation, abort support)
- [x] `services/product.service.ts`, `category.service.ts`, `order.service.ts` — the only place that knows endpoints
- [x] Server-side path bypasses HTTP round-trip where appropriate (no self-fetch waterfalls)
- [x] Hooks: `useProductFilters` (URL state), `useApiResource`, `useProductSearch`, `useDebouncedValue`, `useCart`, `useHydrated`, `useBodyScrollLock`, `useOnClickOutside`
- [x] Request de-duplication + `AbortController` cleanup on unmount / param change

## Phase 4 — Product listing & discovery
- [x] `/products` Server Component reads `searchParams` and renders first paint on the server
- [x] Search box (debounced, writes to URL)
- [x] Filters: category, brand, price range, min rating, in-stock only
- [x] Sort: relevance, price asc/desc, rating, newest, popularity
- [x] Pagination (URL driven, refresh + share safe)
- [x] Active filter chips + clear-all
- [x] Mobile filter drawer
- [x] Loading skeletons (`loading.tsx` + Suspense), empty state, error state + retry

## Phase 5 — Product detail
- [x] `/products/[slug]` Server Component, `generateMetadata` (title, description, OG, canonical)
- [x] JSON-LD Product schema (offers, aggregateRating)
- [x] Image gallery with thumbnails, stock badge, price/discount, rating summary
- [x] Specs, description, reviews list with rating breakdown
- [x] Related products (scored by subcategory, category, brand and price band)
- [x] `not-found.tsx` for invalid product, `error.tsx` for failures

## Phase 6 — Cart (Redux)
- [x] Redux Toolkit store + typed hooks
- [x] `cartSlice`: add, remove, increment/decrement, setQuantity, clear, stock clamping
- [x] localStorage persistence middleware + hydration effect (SSR-safe, no mismatch)
- [x] Memoised selectors for totals (subtotal, discount, shipping, tax, grand total)
- [x] Cart drawer + `/cart` page, quantity stepper, empty state
- [x] Header cart badge (subscribes to count only)

## Phase 7 — Checkout
- [x] `/checkout` with React Hook Form + Zod resolver
- [x] Fields: contact, shipping address, billing toggle, payment (mock), notes
- [x] Field-level errors, disabled/submitting states, server error surface
- [x] Order submission through `order.service` → `/api/orders`
- [x] `/checkout/success` order confirmation, cart cleared
- [x] Guard: redirect to cart when cart is empty

## Phase 8 — SEO, performance, polish
- [x] Root metadata, `sitemap.ts`, `robots.ts`, OG defaults
- [x] `React.memo` on ProductCard / review rows, `useCallback` for stable handlers, `useMemo` for derived data
- [x] Minimal client bundle: client components only at the interactive leaves
- [x] Responsive pass (320 → 1536px), keyboard focus states, aria labels
- [x] Home page sections (hero, categories, trending, value props)
- [x] `npm run lint` + `npm run build` clean

## Phase 9 — Submission artefacts
- [x] README: setup, scripts, features
- [x] README: architecture + folder structure explanation
- [x] README: API / data-fetching approach
- [x] README: Server vs Client Components rationale
- [x] README: performance decisions (useMemo / useCallback / memo / rendering)
- [x] Git history with meaningful commits
