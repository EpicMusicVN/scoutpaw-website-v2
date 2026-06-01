# Shopify Admin API Integration: Credential Naming & Design Reinstatement

**Date**: 2026-06-01 03:11  
**Severity**: Medium  
**Component**: Shop page, Shopify integration  
**Status**: Resolved  

## What Happened

Brainstorm for "connect Shop page to Shopify using REVALIDATE_SECRET/REVALIDATE_CLIENT_ID/REVALIDATE_TOKEN" surfaced a critical credential naming misalignment. User intended Admin API but cited env vars that don't exist or are reserved for unrelated purposes.

## The Brutal Truth

The credential names were wrong. `REVALIDATE_SECRET` is webhook-signing reserved (`.env.local.example:44`). `REVALIDATE_CLIENT_ID` and `REVALIDATE_TOKEN` don't exist in repo. User actually wanted Admin API (single Custom App token + shop domain). This confusion came straight from brainstorm, not user error — easy to fall into when env naming conventions are implicit.

Also: "hidden Products block" didn't exist. ProductGrid was deliberately removed May 20 (see `brainstorm-260520-2254-shop-explore-external-links.md`) to favor external storefront tiles. Reinstatement adds a second surface, not replacement.

## Technical Details

- Swapped `@shopify/storefront-api-client` → raw `fetch` to Admin GraphQL
- Leverages Next.js fetch cache for ISR (revalidate tags, on-demand revalidation)
- Added `import "server-only"` to `lib/shopify/{client,get-products}.ts`
- URL fallback: `https://{domain}/products/{handle}` when `onlineStorePreviewUrl` null
- Mounted ProductGrid below ExploreProducts (external tiles remain above)
- Env vars finalized: `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_STORE_DOMAIN`

## What We Tried

1. Clarified env expectations with user → Admin API confirmed
2. Chose raw fetch over `@shopify/admin-api-client` — simpler, free ISR cache
3. Kept external tile surface (Linktree, Fourthwall) + added ProductGrid as second surface

## Root Cause Analysis

Credential naming convention not documented. Admin API vs Storefront API distinction unclear in codebase context. May 20 design shift (remove ProductGrid) not reflected in brainstorm assumptions.

## Lessons Learned

1. **Credential names are contracts.** Document admin vs storefront auth upfront in `.env.local.example` and schema. Future devs won't guess.
2. **Design reversals have ghosts.** ProductGrid removal was intentional (external storefronts priority). Reinstatement needs design docs to prevent "why was this removed?" archaeology.
3. **Admin API + fetch = clean ISR.** No SDK overhead, fetch cache is built-in. Works.

## Next Steps

- User reviewing code before commit
- If approved: merge, deploy, monitor ISR revalidation
- Add credential naming guide to `docs/deployment.md`
- Link May 20 design decision in product architecture docs
