---
phase: 1
title: Backend Swap
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 1: Backend Swap

## Overview

Replace Storefront client with a server-only Admin API helper. Update query for Admin schema. Rename env vars. Drop unused dependency.

## Requirements

- Functional: `getProducts()` returns live Shopify catalog when `SHOPIFY_MODE=live`, validated by existing `ShopProductsSchema`. Mock path unchanged.
- Non-functional: Admin token never reaches client bundle. Failures swallowed → `[]` so page degrades gracefully.

## Architecture

```
get-products.ts ──► adminFetch(query, vars) ──► POST https://{SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json
                                                  headers: X-Shopify-Access-Token, Content-Type
                                                  next: { revalidate: 3600, tags: ["shopify-products"] }
                          │
                          ▼
                  mapNode() → ShopProduct (zod-parsed)
                          │
                          ▼
              onlineStoreUrl ?? `https://{domain}/products/{handle}`
```

`import "server-only"` in `client.ts` and `get-products.ts` blocks accidental client import at build time.

## Related Code Files

- Modify: `lib/shopify/client.ts` — replace `createStorefrontApiClient` with `adminFetch<T>(query, variables)` helper. Read `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN`. Throw clearly when missing in live mode.
- Modify: `lib/shopify/queries.ts` — Admin GraphQL `products` query with `query: "status:active AND published_status:published"` filter + `sortKey: BEST_SELLING`. Fields: `id handle title description tags onlineStorePreviewUrl featuredImage{url altText} priceRangeV2{minVariantPrice{amount currencyCode}}`.
- Modify: `lib/shopify/get-products.ts` — update `LiveResponseNode` to Admin shape. Map `priceRangeV2 → price`. Build `onlineStoreUrl = node.onlineStorePreviewUrl ?? `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${node.handle}``. Keep `try/catch → []` fallback. Add `import "server-only"`.
- Modify: `lib/shopify/types.ts` — none expected; verify shape still fits.
- Modify: `.env.local.example` — replace `SHOPIFY_STOREFRONT_TOKEN=` with `SHOPIFY_ADMIN_TOKEN=` + comment naming the minimum Custom App scope (`read_products`).
- Modify: `package.json` — remove `@shopify/storefront-api-client`.
- Modify: `pnpm-lock.yaml` — auto-update via `pnpm install`.

## Implementation Steps

1. Edit `lib/shopify/client.ts`:
   - `import "server-only"`.
   - Export `async function adminFetch<T>(query: string, variables: Record<string, unknown>): Promise<{ data?: T; errors?: unknown }>`.
   - Read `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN`; throw if either missing.
   - `fetch` to `https://${domain}/admin/api/2024-10/graphql.json` with `method: "POST"`, headers `{ "X-Shopify-Access-Token": token, "Content-Type": "application/json" }`, body `JSON.stringify({ query, variables })`, `next: { revalidate: 3600, tags: ["shopify-products"] }`.
   - Return parsed JSON.
2. Edit `lib/shopify/queries.ts`: replace with Admin query above.
3. Edit `lib/shopify/get-products.ts`:
   - `import "server-only"`.
   - Drop `getStorefrontClient` import; import `adminFetch`.
   - Update `LiveResponseNode`: `priceRangeV2 { minVariantPrice {...} }` and `onlineStorePreviewUrl: string | null`.
   - Update `mapNode`: use `priceRangeV2.minVariantPrice` and the derived `onlineStoreUrl` rule above.
   - Keep mock branch + zod parse + error swallow.
4. Edit `.env.local.example`:
   - Replace `SHOPIFY_STOREFRONT_TOKEN=` with `SHOPIFY_ADMIN_TOKEN=`.
   - Comment: minimum scope `read_products` from a Custom App in Shopify admin.
5. Edit `package.json`: remove `@shopify/storefront-api-client` from `dependencies`. Run `pnpm install` to refresh lock.
6. `pnpm typecheck` → must pass.

## Success Criteria

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `grep -r "createStorefrontApiClient\|getStorefrontClient" lib/ app/` returns empty
- [ ] `grep -r "SHOPIFY_STOREFRONT_TOKEN" .` returns empty (outside historical plan docs)
- [ ] `import "server-only"` present in both `client.ts` and `get-products.ts`
- [ ] `pnpm install` produces no warnings about missing peer dep

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Admin token leaks to client bundle | `server-only` import throws at build if any client component imports these modules. |
| Wrong GraphQL field names (Admin vs Storefront drift) | `priceRangeV2` confirmed correct on 2024-10 Admin schema; query is small enough to manually verify against Shopify GraphiQL before commit. |
| `onlineStorePreviewUrl` null on inventory-only products | Fallback to constructed URL from domain + handle; combined with `published_status:published` filter this should never be a dead link. |
| Forgetting to remove the dep leaves dead code reachable | Step 5 deletes from `package.json` + grep gate in success criteria catches stragglers. |
