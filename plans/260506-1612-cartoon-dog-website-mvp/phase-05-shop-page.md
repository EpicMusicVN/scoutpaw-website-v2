---
phase: 5
title: Shop Page
status: completed
priority: P1
effort: 4h
dependencies:
  - 3
---

# Phase 5: Shop Page

## Overview
Shopify Storefront API integration with **MOCK fallback for MVP** (store not set up yet). `getProducts()` selects source via env flag: `SHOPIFY_MODE=mock` returns fixture data, `SHOPIFY_MODE=live` queries real Storefront. Same shape, same components — swap is one env var. ISR 5min once live. Buy Now opens Shopify product URL in new tab; in mock mode, links to `#` w/ disabled state or to placeholder URL.

## Requirements
- Functional: display all products from Shopify store, Buy Now redirects to `https://{store}.myshopify.com/products/{handle}` (or custom domain), opens in new tab
- Non-functional: TTFB < 800ms (ISR cache hit); graceful fallback when API down

## Architecture
- `lib/shopify/client.ts`: Storefront API client w/ env config
- `lib/shopify/queries.ts`: GraphQL queries (PRODUCTS_QUERY)
- `lib/shopify/types.ts`: typed responses
- Server component fetches → ProductGrid client component for layout
- ISR: `export const revalidate = 300` (5min)
- On-demand revalidate via Phase 10 webhook

## Related Code Files
- Create: `app/shop/page.tsx`
- Create: `components/shop/product-grid.tsx`, `components/shop/product-card.tsx`, `components/shop/shop-empty-state.tsx`
- Create: `lib/shopify/client.ts`, `lib/shopify/queries.ts`, `lib/shopify/types.ts`, `lib/shopify/get-products.ts`, `lib/shopify/mock-products.ts`
- Create: `content/mock-products.json` (fixture data — 3-5 fake products w/ promotion.png from assets)
- Modify: `next.config.ts` — add Shopify CDN to `images.remotePatterns`

## Implementation Steps
1. Set up `@shopify/storefront-api-client` w/ env vars (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`)
2. Define `PRODUCTS_QUERY` GraphQL: id, handle, title, description, featuredImage, priceRange, onlineStoreUrl
3. `getProducts()` server fn: query, validate, return typed products[]
4. Wrap in try/catch — on error return cached/empty + log
5. `app/shop/page.tsx`: server component, `export const revalidate = 300`, fetches products, renders header + ProductGrid
6. `ProductCard`: featured image (next/image), title, price (formatted by currency), Buy Now button → `onlineStoreUrl` (target=_blank, rel=noopener)
7. `ProductGrid`: responsive grid (1/2/3 col), gap, motion fade-in on mount
8. `ShopEmptyState`: shown when 0 products or API error — character art + "Coming soon!" copy
9. Metadata: title "Shop — {brand}", description, OG image
10. Test: pull real products from a test store, verify Buy Now redirects correctly

## Success Criteria
- [ ] Shop page lists ≥ 1 product from Shopify Storefront API
- [ ] Buy Now opens Shopify product URL in new tab (verified)
- [ ] Prices format correctly per currency
- [ ] Empty state shown when API returns 0 products
- [ ] API error logged + empty state rendered (no crash)
- [ ] ISR confirmed via response headers (cache hit on 2nd request)
- [ ] Storefront token NOT in client bundle (verify via build output)

## Risk Assessment
- Storefront API rate limits — ISR + 5min cache absorbs traffic spikes
- `onlineStoreUrl` may be null if product unpublished — filter out in `getProducts()`
- Currency formatting locale mismatch — use `Intl.NumberFormat` w/ store's currency code
- Token exposure — use server-only env var (no `NEXT_PUBLIC_` prefix), all queries in server components/route handlers
