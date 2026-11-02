---
phase: 3
title: Entity Structured Data
status: completed
priority: P2
effort: 4h
dependencies:
  - 2
---

# Phase 3: Entity Structured Data

## Overview
Add per-entity JSON-LD so individual videos, products, and detail pages surface as rich
results and answer-engine facts: `VideoObject` (watch), `Product`+`Offer` (shop, live-mode
only), `BreadcrumbList` (detail/section pages).

## Requirements
- Functional: watch page emits `VideoObject` per video; shop emits `Product`/`Offer` only when
  `SHOPIFY_MODE !== "mock"`; detail pages emit `BreadcrumbList`.
- Non-functional: builders extend `lib/seo/structured-data.ts`; reuse `<JsonLd>`.
- Compliance: **no price/Offer schema for `/top-picks`** (Amazon Associates ToS — prices need PA-API).

## Architecture
Add to `lib/seo/structured-data.ts`:
- `videoObjectSchema(video, siteUrl)` → `name`, `description`, `thumbnailUrl`, `uploadDate`,
  `embedUrl`/`contentUrl` (YouTube), `publisher` (ref Organization). Map from `Video` fields
  (`title`/`description`/`youtubeId`/`uploadDate`/thumbnail). **Verify exact `Video` schema
  field names in `lib/content/schemas.ts` before coding.**
- `productSchema(product, siteUrl)` → `Product` with `offers: { @type: Offer, price,
  priceCurrency, availability, url }` from Shopify `price.{amount,currencyCode}` + `onlineStoreUrl`.
- `breadcrumbSchema(items)` → `BreadcrumbList` of `{name, item}`.

Injection points:
- `app/(frontend)/watch/page.tsx`: build `VideoObject[]` for rendered videos (cap to a
  reasonable count, e.g. featured + latest grid), render via `<JsonLd data={videos}>`.
- `app/(frontend)/shop/page.tsx`: **after** `getProducts()`, gate on
  `process.env.SHOPIFY_MODE !== "mock"` before emitting Product schema (real prices only).
- `app/(frontend)/characters/[slug]/page.tsx`, `coming-soon/[slug]/page.tsx`,
  `characters/page.tsx`, `shop/page.tsx`, `watch/page.tsx`, `top-picks/page.tsx`: `BreadcrumbList`.

## Related Code Files
- Modify: `lib/seo/structured-data.ts` (add 3 builders)
- Modify: `app/(frontend)/watch/page.tsx`
- Modify: `app/(frontend)/shop/page.tsx`
- Modify: `app/(frontend)/characters/[slug]/page.tsx`
- Modify: `app/(frontend)/coming-soon/[slug]/page.tsx`
- Modify: `app/(frontend)/{characters,top-picks}/page.tsx` (breadcrumb only)

## Implementation Steps
1. Read `Video` + `ShopProduct` schemas; confirm field names for the builders.
2. Add `videoObjectSchema`, `productSchema`, `breadcrumbSchema` to `structured-data.ts`.
3. Wire `VideoObject` into watch page (reuse the already-fetched video data — no extra calls).
4. Wire `Product` into shop page behind `SHOPIFY_MODE !== "mock"` guard.
5. Add `BreadcrumbList` to listed pages (Home > Section > Item).
6. Confirm `/top-picks` gets breadcrumb but **no** Product/Offer.
7. Typecheck + lint; validate each `@type` in Google Rich Results Test.

## Success Criteria
- [ ] Watch page: valid `VideoObject` per surfaced video (thumbnail + uploadDate present).
- [ ] Shop in live mode: `Product`+`Offer` with correct price/currency/availability; in mock mode: none.
- [ ] `/top-picks`: BreadcrumbList present, zero price-bearing schema.
- [ ] Detail pages: valid BreadcrumbList trail.
- [ ] Google Rich Results Test: 0 errors across types. `tsc`/lint clean.

## Risk Assessment
- **Risk:** `VideoObject` requires `uploadDate`; some videos lack it. *Mitigation:* omit
  VideoObject for videos missing required fields rather than emit invalid schema.
- **Risk:** Shopify `availability` not in current query. *Mitigation:* default to
  `https://schema.org/InStock` or add field to `PRODUCTS_QUERY`; decide during impl.
