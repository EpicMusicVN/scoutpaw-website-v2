# Brainstorm — Shopify Admin API on Shop page

**Date:** 2026-06-01 02:56 | **Status:** Agreed → planned | **Scope:** ~8 files

## Problem Statement

User asked to "connect website to Shopify, use credentials `REVALIDATE_SECRET` / `REVALIDATE_CLIENT_ID` / `REVALIDATE_TOKEN`, display products in the currently-hidden Products block on Shop page." Three issues surfaced on scout:

1. Env var names cited are not Shopify auth — `REVALIDATE_SECRET` is reserved for webhook signing; the other two don't exist anywhere in repo.
2. No "hidden Products block" on `/shop` — `ProductGrid` component exists but was deliberately removed from the page on 2026-05-20 (see prior brainstorm) when team chose external storefront tiles (Linktree + Fourthwall).
3. Current Shopify plumbing uses Storefront API client + token; user wants Admin API instead.

## Scout Findings

- `app/shop/page.tsx`: `FullBleedHero → ExploreProducts → AboutShop → NewsletterCTA`. No `ProductGrid` mounted.
- `components/shop/product-grid.tsx`: orphan, `"use client"`, expects `ShopProduct[]`.
- `lib/shopify/client.ts`: uses `@shopify/storefront-api-client`, reads `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN`.
- `lib/shopify/get-products.ts`: `SHOPIFY_MODE` gates mock vs live; errors swallowed → `[]`.
- `lib/shopify/types.ts`: zod schema covers Admin response shape after mapping — no schema change needed.
- `mock-products.ts`: 8 fixtures, used in mock mode.
- `.env.local`: absent. `.env.local.example` defines: `SHOPIFY_MODE`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `REVALIDATE_SECRET` (webhook).
- `package.json`: `@shopify/storefront-api-client ^1.0.4` installed; no Admin client.

## User Decisions

| Question | Answer |
|---|---|
| Credential set | Shopify Admin API (single token + shop domain) |
| Tiles vs grid | Keep tiles, add ProductGrid below |
| Click target | Open Shopify product page in new tab |
| Auth model | Custom App — single admin token + shop domain |
| Env naming | Rename to `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN` |

## Evaluated Approaches

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| A. `@shopify/admin-api-client` library | Typed client, official | New dep, less control over Next caching | Rejected |
| B. Raw `fetch` to Admin GraphQL endpoint | Zero deps, `next: { revalidate, tags }` ISR for free, server-only enforceable | Hand-roll auth header + JSON | **Chosen** |
| C. Keep Storefront API + new public access token | Already wired | Reverses user's stated direction (Admin) | Rejected |

## Final Solution

**Backend:** swap Storefront client for thin `adminFetch<T>()` helper. POST to `https://{domain}/admin/api/2024-10/graphql.json`, `X-Shopify-Access-Token` header, `next: { revalidate: 3600, tags: ["shopify-products"] }`. `import "server-only"` to gate client-bundle leaks.

**Query:** Admin GraphQL, `products(first, query: "status:active AND published_status:published", sortKey: BEST_SELLING)` returning `priceRangeV2.minVariantPrice` + `onlineStorePreviewUrl`. Map to existing `ShopProduct` zod shape; derive `onlineStoreUrl` fallback as `https://{domain}/products/{handle}`.

**Page:** `app/shop/page.tsx` becomes async RSC. Insert new section between `ExploreProducts` and `AboutShop`: header ("From the Shop" kicker + h2) + `ProductGrid` if non-empty else `ShopEmptyState`. External tiles untouched.

**Env:**
```
SHOPIFY_MODE=live
SHOPIFY_STORE_DOMAIN=puppylullaby.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...      # Custom App, read_products scope
REVALIDATE_SECRET=...              # unchanged, webhook
```

**Dep cleanup:** remove `@shopify/storefront-api-client`.

**Image allowlist:** add `cdn.shopify.com` to `next.config.ts` `images.remotePatterns`.

## Files Touched

| File | Change |
|---|---|
| `lib/shopify/client.ts` | Rewrite as `adminFetch<T>()` helper + `server-only` |
| `lib/shopify/queries.ts` | New Admin query (`priceRangeV2`, `onlineStorePreviewUrl`, status filter) |
| `lib/shopify/get-products.ts` | Update node shape + URL fallback + `server-only` |
| `lib/shopify/types.ts` | No change |
| `app/shop/page.tsx` | Async + new ProductGrid section |
| `.env.local.example` | Rename token var + scope comment |
| `package.json` + lock | Drop Storefront client dep |
| `next.config.ts` | Add `cdn.shopify.com` to images |
| `docs/codebase-overview.md` | Document Admin API path |
| `docs/project-changelog.md` | Entry |

## Risks

| Risk | Mitigation |
|---|---|
| Admin token in client bundle | `import "server-only"` + grep gate in success criteria |
| Wrong Admin field names | Manual verify against Shopify GraphiQL before commit |
| `onlineStorePreviewUrl` null | Fallback constructed URL; `published_status:published` filter prevents dead links |
| Image host not allowed | `next.config.ts` update in Phase 2 |
| Empty Shopify catalog or bad token | `ShopEmptyState` fallback; smoke test verifies |

## Out of Scope (YAGNI)

- On-site cart, checkout, variants, quantity selectors — Shopify owns the funnel
- Webhook revalidation endpoint wire-up — tagged for later (`REVALIDATE_SECRET` reserved)
- Pagination beyond `first: 24`
- New copy beyond placeholder section heading

## Success Metrics

- `pnpm typecheck` + `pnpm lint` + `pnpm build` clean
- `SHOPIFY_MODE=mock` still renders 8 fixtures
- `SHOPIFY_MODE=live` renders real products with working "Buy Now" → new tab
- No `shpat_` (token) string in client bundle
- DevTools Network: no browser → Shopify Admin calls

## Next Steps

Plan created at `plans/260601-0256-shopify-admin-shop-products/`. 3 phases:
1. Backend swap (~1h)
2. Page wiring (~45m)
3. Docs + smoke test (~30m)

## Unresolved Questions

1. Confirm exact shop domain (e.g. `puppylullaby.myshopify.com` vs another).
2. Section heading copy ("Fresh from the kennel.") — placeholder, brand sign-off?
3. `mock-products.ts` `onlineStoreUrl: "#mock-store"` — leave or update to real-shape placeholder?
