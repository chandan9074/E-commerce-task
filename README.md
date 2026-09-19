# Aurelia — E-Commerce Product Search & Checkout

A production-shaped storefront built for **Task 2 — Frontend Engineering**: a 520-product catalogue with
URL-driven search and filtering, SEO-ready product pages, a persistent cart, and a validated checkout.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Redux Toolkit · Axios · React Hook Form + Zod · React Icons

---

## Table of contents

1. [Quick start](#quick-start)
2. [What is implemented](#what-is-implemented)
3. [Architecture & folder structure](#architecture--folder-structure)
4. [Data & API approach](#data--api-approach)
5. [Server vs Client Components](#server-vs-client-components)
6. [State management & URL state](#state-management--url-state)
7. [Performance decisions](#performance-decisions)
8. [SEO](#seo)
9. [Loading, empty and error states](#loading-empty-and-error-states)
10. [Design system](#design-system)
11. [Trade-offs and what I would do next](#trade-offs-and-what-i-would-do-next)

---

## Quick start

```bash
# 1. install
npm install

# 2. (optional) point the app at a real origin for canonical URLs / OG tags
cp .env.example .env.local

# 3. run
npm run dev          # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (the mock API adds 40–400 ms of artificial latency so loading states are visible) |
| `npm run build` | Production build — prerenders the home page, cart, checkout and the 60 best-selling product pages |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, including the React Compiler hook rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run data:generate` | Regenerate `src/lib/data/products.json` from the seeded generator |
| `npm run verify` | typecheck → lint → build |

**Requirements:** Node 20.9+ and an internet connection for product imagery (`picsum.photos`, allow-listed in
`next.config.ts`).

Current state: `npm run verify` passes — 0 type errors, 0 lint errors/warnings, build green.

### Deploying

No environment variables are required. On Vercel, import the repo and deploy - the deployment's own domain is
detected automatically for canonical URLs, Open Graph tags, `sitemap.xml` and `robots.txt`
(`VERCEL_PROJECT_PRODUCTION_URL`, falling back to `VERCEL_URL`). Set `NEXT_PUBLIC_SITE_URL` only when you have a
custom domain — and give it a real URL rather than defining it empty, which tells the app nothing.


---

## What is implemented

| Requirement | Where |
| --- | --- |
| 500+ products | 520 generated products, 1,936 reviews, 7 categories, 32 brands — [`src/lib/data/products.json`](src/lib/data/products.json) |
| Search, category, price, rating, sorting, pagination | [`src/helpers/product-filter.helpers.ts`](src/helpers/product-filter.helpers.ts) + [`FilterPanel`](src/components/filters/FilterPanel.tsx) |
| URL-based filters with refresh persistence | [`useProductFilters`](src/hooks/useProductFilters.ts), [`product-query.helpers.ts`](src/helpers/product-query.helpers.ts) |
| Product details: images, stock, reviews, related | [`/products/[slug]`](src/app/products/[slug]/page.tsx) |
| Cart: add / remove / quantity / persistence | [`cart.slice.ts`](src/store/slices/cart.slice.ts) + [`cart-persistence.ts`](src/store/middleware/cart-persistence.ts) |
| Checkout with React Hook Form + Zod | [`CheckoutForm`](src/components/checkout/CheckoutForm.tsx), [`checkout.schema.ts`](src/validations/checkout.schema.ts) |
| SEO-friendly product pages | `generateMetadata`, JSON-LD, canonical URLs, sitemap, robots |
| Loading / empty / error states | `loading.tsx`, `error.tsx`, `not-found.tsx`, `EmptyState`, `ErrorState`, skeletons |

Extras beyond the brief: live search suggestions in the header, product quick view, facet counts that update
with the active query, light/dark theming, free-shipping progress, and a 404 that suggests alternatives.

---

## Architecture & folder structure

The rule everywhere: **components render, hooks coordinate, services talk, the repository owns the data.**
No component imports axios; no component knows a URL; no component knows the dataset shape.

```
src/
├── app/                              # Routes only — thin, no business logic
│   ├── layout.tsx                    # Fonts, metadata, theme script, providers, overlays
│   ├── page.tsx                      # Home (Server Component)
│   ├── products/
│   │   ├── (listing)/                # Route group: keeps the listing's loading UI
│   │   │   ├── page.tsx              #   from wrapping /products/[slug] (see note below)
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── [slug]/
│   │       ├── page.tsx              # Product detail + JSON-LD
│   │       ├── not-found.tsx         # Real 404 for an invalid product
│   │       └── error.tsx
│   ├── cart/ · checkout/ · checkout/success/
│   ├── api/                          # Mock backend (route handlers)
│   │   ├── products/route.ts
│   │   ├── products/[slug]/route.ts
│   │   ├── products/[slug]/related/route.ts
│   │   ├── categories/route.ts
│   │   └── orders/route.ts
│   ├── sitemap.ts · robots.ts · not-found.tsx · error.tsx
│
├── components/                       # Presentation, grouped by domain
│   ├── ui/                           # Design-system primitives (Button, Price, Rating, Drawer…)
│   ├── layout/                       # Header, Footer, HeaderSearch, MobileNav, ThemeToggle
│   ├── product/                      # ProductCard, Grid, Rail, Gallery, Reviews, QuickView
│   ├── filters/                      # FilterPanel, ActiveFilters, ResultsToolbar, Pagination
│   ├── cart/                         # CartDrawer, CartView, CartLineItem, CartSummary, AddToCartButton
│   ├── checkout/                     # CheckoutForm, OrderSummary, OrderConfirmationView
│   └── seo/                          # JSON-LD builders
│
├── sections/home/                    # Page-level compositions (Hero, CategoryGrid, ValueProps)
├── hooks/                            # useProductFilters, useApiResource, useCart, useDebouncedValue…
├── services/                         # product / category / order — the only modules that know endpoints
├── helpers/                          # Pure logic: query parsing, filter engine, cart maths, product derivations
├── lib/
│   ├── api/                          # axios client + interceptors, ApiError, route-handler wrapper, endpoints
│   ├── data/                         # products.json, catalog.ts (indexes), product.repository.ts
│   ├── utils/                        # cn, formatters
│   └── constants.ts                  # Commerce rules, query keys, storage keys, site metadata
├── store/                            # Redux Toolkit: slices, selectors, persistence middleware, provider
├── types/                            # Domain + transport contracts
└── validations/                      # Zod schemas shared by the form and the API
```

### Layer diagram

```
Server Component ─────────────────────────────► productRepository ──► catalog (products.json)
                                                      ▲
Client Component ──► hook ──► service ──► axios ──► /api/* route handler
                    (state)   (endpoints) (interceptors, dedupe)
```

Both paths run the **same** query engine (`helpers/product-filter.helpers.ts`) through the **same** repository,
so a filter combination produces identical results whether it was rendered on the server or fetched from the
browser. Replacing the JSON dataset with a database means rewriting `product.repository.ts` and nothing else.

> **Why the `(listing)` route group?** A `loading.tsx` at `app/products/` would wrap the nested `[slug]` route in
> a Suspense boundary, flushing a `200` shell before `notFound()` could run — so an invalid product would return
> HTTP 200. Moving the listing (and its loading/error UI) into a route group keeps the skeleton for `/products`
> **and** a real `404` for `/products/does-not-exist`. Verified with `curl -o /dev/null -w '%{http_code}'`.

---

## Data & API approach

### The dataset

`scripts/generate-products.mjs` builds the catalogue from a **fixed seed** (`mulberry32`), so the data is
identical on every machine and produces no git noise. Each product carries a slug, brand, category and
subcategory, price with an optional compare-at price, rating, review count, stock, SKU, tags, 3–4 images,
specs, a description and 0–7 written reviews.

`src/lib/data/catalog.ts` loads it once per server process and builds the indexes the app actually queries:
`Map` by slug, `Map` by id, a **pre-lowercased search haystack per product**, and global price bounds. It is
marked `server-only`, which makes importing it from a Client Component a build error — that is what guarantees
the 1.5 MB dataset never reaches the browser.

### The API layer

| Endpoint | Purpose |
| --- | --- |
| `GET /api/products` | Listing: `q`, `category[]`, `brand[]`, `minPrice`, `maxPrice`, `rating`, `inStock`, `onSale`, `sort`, `page`, `limit` |
| `GET /api/products/:slug` | Full product record — `404` with a typed error for unknown slugs |
| `GET /api/products/:slug/related` | Scored related products |
| `GET /api/categories` | Taxonomy, brand list and price bounds |
| `POST /api/orders` | Order placement — re-validates the payload and re-checks stock |

Every response uses one envelope:

```jsonc
{ "success": true,  "data": { … }, "meta": { "requestId": "…", "durationMs": 13 } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "…" }, "meta": { … } }
```

`createRouteHandler` ([`lib/api/route-handler.ts`](src/lib/api/route-handler.ts)) supplies the envelope, request
id, timing, `Cache-Control` and error mapping, so each handler is ~10 lines of business logic. Try it:

```bash
curl "http://localhost:3000/api/products?q=laptop&category=electronics&minPrice=500&sort=price-asc&limit=2"
curl -i "http://localhost:3000/api/products/does-not-exist"     # 404 + typed error body
```

### The client transport

[`lib/api/client.ts`](src/lib/api/client.ts) is a single axios instance with:

- **Request interceptor** — correlation id (`x-request-id`), client tag, start timestamp.
- **Response interceptor** — validates and unwraps the envelope, treats `200 + success:false` as a failure, logs
  client-vs-server timing in development.
- **Error interceptor** — collapses *every* failure mode (HTTP status, network down, timeout, abort, malformed
  body) into one `ApiError` with a `code`, a `status`, a `retryable` flag and a user-safe message. Components
  never see an `AxiosError`.
- **In-flight de-duplication** — concurrent identical `GET`s share one round-trip. Each caller keeps its own
  `AbortController` and the shared request is only cancelled once every subscriber has abandoned it, so one
  component unmounting cannot cancel a request another component is still waiting on.

### Avoiding unnecessary and duplicate fetching

- **Server Components never self-fetch over HTTP.** They call `productRepository` in-process. Fetching your own
  route handler during SSR adds a round-trip, a serialisation pass and a failure mode for zero benefit.
- **Listing payloads are projected.** `GET /api/products` returns `ProductSummary` (16 fields), not the full
  record with reviews and specs — roughly 7× less JSON for data a card cannot display.
- **Search is debounced (280 ms), aborted on every new term, and de-duplicated in transport.**
- **Quick view fetches on open, not on render.** 24 cards share one dialog; nothing is requested until a card is
  actually opened, and closing it aborts an in-flight request.
- **Facets are computed in the same pass** as filtering, so the filter panel needs no second request.

---

## Server vs Client Components

Default is server. A component becomes a Client Component only when it needs state, an event handler, a browser
API or the store — and then it is pushed as far down the tree as possible.

| Server Components | Why |
| --- | --- |
| Home page + all rails | Reads the repository directly; ships no JS of its own |
| `/products` listing | `searchParams` is the state — rendered server-side for the exact URL requested |
| `/products/[slug]` | Price, stock, specs, reviews and JSON-LD must be in the HTML for SEO |
| `ProductCard`, `ProductGrid`, `ProductRail` | A 24-card grid costs the JS of **two** small islands, not 24 cards |
| `Header`, `Footer` | Category nav read from the repository at render time — no fetch, no spinner |
| `ProductReviews`, `Rating`, `Price`, `StockBadge`, JSON-LD | Pure presentation |

| Client Components | Why |
| --- | --- |
| `FilterPanel`, `ResultsToolbar`, `ActiveFilters`, `ProductPagination` | Write to the URL |
| `ProductSearchInput`, `HeaderSearch` | Debounced input + live suggestions |
| `ProductGallery`, `ProductPurchasePanel` | Image selection, quantity |
| `AddToCartButton`, `CartButton`, `CartDrawer`, `CartView`, `CartLineItem` | Redux + localStorage |
| `CheckoutForm`, `OrderConfirmationView` | React Hook Form; sessionStorage |
| `QuickViewTrigger` / `QuickViewDialog` | Overlay state + a client fetch |
| `ThemeToggle` | Toggles a class on `<html>` — deliberately stateless |

**Rendering strategy per route**

| Route | Strategy |
| --- | --- |
| `/`, `/cart`, `/checkout`, `/checkout/success` | Static (prerendered at build) |
| `/products/[slug]` | SSG for the 60 best sellers + `dynamicParams` for the rest (prerendering all 520 would slow the build for pages almost nobody opens) |
| `/products` | Dynamic — it depends on `searchParams` |
| `/api/*` | Dynamic, with `Cache-Control` per endpoint (`s-maxage=60` listing, `300` catalogue, `no-store` orders) |

---

## State management & URL state

Three kinds of state, three homes:

1. **Filter state → the URL.** There is no `useState` mirror of the filters anywhere. `parseProductQuery` and
   `buildSearchParams` are the single translation layer, used by the Server Component, the client hook *and*
   the route handler, so the three can never disagree about what `?rating=4&page=2` means. Refresh, back/forward
   and link-sharing work with no extra code. `parseProductQuery` also clamps and sanitises everything
   user-supplied (a reversed price range is swapped, not rejected).

2. **Cart → Redux Toolkit.** `cart.slice.ts` clamps every quantity change against stock and the per-line maximum
   *inside the reducer*, so no caller can produce an invalid cart. Lines store a product snapshot rather than a
   reference, so a persisted cart renders after a refresh without re-fetching anything.

   **Persistence** is a listener middleware, not a `useEffect`: saving is a side effect of *state changing*, not
   of anything rendering. It refuses to write before hydration (otherwise the initial empty state would wipe a
   saved cart), and `readPersistedCart` validates every line so corrupt storage is discarded, never thrown.

3. **Overlays → a small `ui` slice.** Cart drawer, mobile filter sheet and quick view are triggered from
   unrelated branches of the tree, and each subscriber selects only the one value it needs.

### `useEffect` audit

Used in exactly six places, all genuine synchronisation:

| Where | Why it must be an effect |
| --- | --- |
| `StoreProvider` | Read localStorage after mount — reading during render would break hydration |
| `OrderConfirmationView` | Clear the sessionStorage entry so a refresh cannot resurrect an order |
| `ProductSearchInput` / `useDebouncedValue` | Timers, cleared on change and unmount |
| `useApiResource` | `AbortController` lifecycle |
| `PriceRangeFilter` | Re-sync the local draft when the URL changes from elsewhere |
| `useBodyScrollLock`, `useOnClickOutside`, `Drawer`, `Modal` | Document listeners and body style, each undone precisely on cleanup |

Everything else is derived during render. `useApiResource`, for instance, **derives** its status by comparing
the key a result was fetched for against the current key, instead of storing `loading` and setting it inside the
effect — no cascading renders, and a slow earlier response can never overwrite a newer one.

---

## Performance decisions

### `useMemo` — only where the work is real

| Location | Why it earns its place |
| --- | --- |
| `selectCartTotals` (`createSelector`) | Derived from every line and read by the header, drawer, cart page and checkout — computed once per cart change, not once per subscriber per render |
| `selectCartItemCount`, `selectCartQuantityById` | Scalar/map projections; the header badge re-renders only when the number changes |
| `FilterPanel.visibleBrands` | Filter + slice over 32 brands, re-evaluated on every keystroke *and* every URL change |
| `useProductFilters.query` | Parses `searchParams` once per navigation instead of once per consumer |
| `Pagination.buildPageList` | Windowing arithmetic, recomputed only when the page or page count moves |

Deliberately **not** memoised: `computeTotals` inside the reducer (one pass, already cheap), per-card formatting
(the `Intl` formatters are cached at module level instead — a better fix than memoising 24 call sites).

### `useCallback` — stability that something actually consumes

Every mutator from `useProductFilters` and `useCart` is `useCallback`-stable. `useProductFilters` keeps the live
query in a ref written from an effect, so the callbacks have **empty dependency lists** and never change
identity — which is what makes the `memo` below actually hold instead of being defeated by a new function
reference on every navigation.

### `React.memo` — on the components that would otherwise repaint in bulk

`OptionRow` (filter rows), `ChipButton`, `CartLineItem`, `QuantityStepper`, `Pagination`, `AddToCartButton`,
`QuickViewTrigger`, `CheckoutOrderSummary`. Concretely: editing line 3 of the cart re-renders line 3 only;
ticking one brand does not repaint the other 31 rows; typing in checkout does not repaint the order summary.

`memo` is *not* used on Server Components (it would do nothing) or on components whose props change every render.

### Rendering and network

- **Islands, not pages.** Interactivity is isolated to leaves — `ProductCard` stays a Server Component and only
  its two buttons hydrate.
- **`useTransition` on every filter change**, so the current results stay interactive while the server renders
  the next page; the toolbar shows a pending spinner instead of a blank screen.
- **`next/image`** with per-breakpoint `sizes`, AVIF/WebP, and `priority` on the first row and the hero (the LCP
  elements) — everything else lazy-loads.
- **`optimizePackageImports: ["react-icons"]`** so a single icon never drags in the pack.
- **Pre-lowercased search index**, built once at module load, turns search from "lowercase 520 strings per
  keystroke" into a substring scan.
- **`id` as the final sort tie-break**, so pagination is stable across requests.

> The React Compiler is deliberately left **off**. The task asks for explicit, reviewable memoisation decisions;
> auto-memoising everything would hide exactly the reasoning being assessed. The compiler's ESLint rules are
> still enforced — `npm run lint` is clean, including `react-hooks/refs` and `set-state-in-effect`.

---

## SEO

- `generateMetadata` per product: title, description, canonical, Open Graph, Twitter card and
  `product:price:*` tags.
- **JSON-LD** `Product` (offers, availability, `aggregateRating`, reviews) + `BreadcrumbList`.
- Listing metadata follows the filters; **filtered permutations are `noindex, follow`** so crawlers index the
  clean category pages instead of thousands of near-duplicate filter URLs.
- `sitemap.xml` generated from the repository — 529 URLs (520 products + 7 categories + 2 static).
- `robots.txt` blocks `/api/`, `/cart` and `/checkout`.
- Invalid products return a **real HTTP 404**, not a soft 404 (see the route-group note above).
- Semantic landmarks, one `h1` per page, a skip link, labelled controls, visible focus rings, and
  `prefers-reduced-motion` support.

---

## Loading, empty and error states

| State | Implementation |
| --- | --- |
| Route loading | `(listing)/loading.tsx` — a skeleton whose geometry matches the real grid, so nothing shifts |
| Inline pending | `isPending` from `useTransition` in the results toolbar |
| Client fetch loading | `useApiResource` status → skeletons in the quick view, spinner in header search |
| Empty results | `EmptyState` with a "clear all filters" action |
| Empty cart | Distinct copy in the drawer, the cart page and checkout |
| No reviews | Dedicated empty state inside the reviews block |
| Route errors | `error.tsx` at root, listing and product level, with `reset()` retry |
| Invalid product | `not-found.tsx` with trending suggestions, served with a 404 |
| Failed client fetch | `ErrorState` with a retry button — shown only when the error is actually retryable |
| Storage failures | `try/catch` around every `localStorage`/`sessionStorage` access (private mode, quota) |

In development the mock API adds 40–400 ms of latency so these states are visible; production builds skip it.

---

## Design system

A deep-indigo brand with an amber accent on slate neutrals, defined once as Tailwind v4 `@theme` tokens in
`globals.css` and consumed as utilities (`bg-brand-600`, `text-muted`, `surface-card`). Semantic tokens
(`--surface`, `--border`, `--foreground`, …) are redefined wholesale under `.dark`, so light and dark are one
palette swap rather than two sets of classes. An inline script applies the saved theme before first paint, so
there is no flash. Typography is Inter with Sora for display headings, via `next/font` (self-hosted, no layout
shift).

### Responsive

Every page was checked in a real browser at **320 / 375 / 414 / 540 / 768 / 1024 / 1280 / 1440 / 1920 px**, with
an assertion that `document.scrollWidth === clientWidth` (no sideways scroll) at each. Three failures that pass
code review but only show up in a browser were found and fixed that way:

- **Grid tracks refusing to shrink.** A grid item defaults to `min-width: auto`, so before the `lg` breakpoint
  the single column on cart/checkout was sized by the order summary's *min-content* width and pushed the page
  sideways. Fixed with `min-w-0` on the columns, and `minmax(0, 1fr)` on the listing and reviews grids. The same
  rule clipped the hero: a rigid `grid-cols-3` stats row forced its column to 428 px on a 375 px screen, cutting
  off the headline and paragraph.
- **A `backdrop-filter` ancestor capturing fixed positioning.** The header uses `backdrop-blur`, which makes it
  the containing block for `position: fixed` descendants, so the mobile navigation drawer was clamped to the
  header's 118 px height instead of filling the screen. `Drawer` and `Modal` now render through a portal into
  `document.body`.
- **An off-canvas panel extending the scroll area.** The closed drawer, translated 100% past the right edge,
  added ~90 px to the document scroll width, so mobile pages scrolled sideways with the panel edge visible. The
  overlay root now clips it, and `inert` keeps the closed panel out of the tab order and the a11y tree.


---

## Trade-offs and what I would do next

- **Mock data in-process.** Products live in a JSON file behind a repository, so the API is real but the
  storage is not. Swapping in Postgres/Prisma is a single-file change.
- **Server Components bypass HTTP.** The trade-off is that the interceptor stack is exercised by client
  interactions (search, quick view, checkout) rather than by SSR. The alternative — SSR fetching its own route
  handler — buys a round-trip and a failure mode for nothing.
- **60 prerendered product pages.** Enough to demonstrate SSG without a slow build; a real store would
  prerender by traffic and use `revalidate`.
- **No test suite.** The pure helpers (`product-filter`, `product-query`, `cart`) were written specifically to
  be testable without React or the network — that is where I would start with Vitest, followed by a Playwright
  pass over search → filter → add to cart → checkout.
- **Next:** Server Actions for order placement, optimistic cart updates with `useOptimistic`, a virtualised grid
  if page size grows past ~100, and real inventory reservation at checkout.
