# Brainstorm — Revert Shopify to Storefront API

**Date:** 2026-06-01 04:28 | **Status:** Agreed | **Parent plan:** `260601-0256-shopify-admin-shop-products`

## Problem Statement

Live mode set up earlier today (Phase 1+2 of parent plan) failed with HTTP 401 from Shopify Admin. Diagnostic patches surfaced the cause: token in `.env.local` is `shpss_...` (Storefront), not `shpat_...` (Admin). User does not have a static Admin token because **Shopify deprecated legacy Custom Apps on 2026-01-01**. The new flow is Partners Dev Dashboard → Client ID + Client Secret → client-credentials grant → 24h `shpat_` token.

## Reframe

The whole pivot to Admin API in this session was based on a wrong premise. User's actual use case — **public marketing-site product catalog** — is exactly what Storefront API is built for. We should revert.

## Evaluated Approaches

| # | Approach | Effort | Verdict |
|---|---|---|---|
| 1 | Revert to Storefront API; use existing `shpss_` token | ~30m | **Chosen** |
| 2 | Implement client-credentials grant for Admin API (token exchange + 24h cache) | ~1.5h + ongoing maintenance | Rejected — YAGNI; Admin's extra fields are unused |
| 3 | Use "App automation token" if it's a long-lived `shpat_` | <10m if it works | Deferred — Shopify's own docs don't describe what that token is; not worth bet |

## Final Solution — Revert Backend, Keep UI

Keep this session's Phase 2 page wiring (ProductGrid section on `/shop`, async RSC, ScrollReveal wrapping, empty-state fallback) — UI work doesn't depend on API choice. Roll back Phase 1 backend layer + docs to Storefront contract.

### Files to touch

| File | Change |
|---|---|
| `lib/shopify/client.ts` | Swap endpoint to `https://{domain}/api/2024-10/graphql.json` (no `admin/`). Header `X-Shopify-Storefront-Access-Token`. Read `SHOPIFY_STOREFRONT_TOKEN`. Keep diagnostic logging from earlier patch. Keep `server-only`. |
| `lib/shopify/queries.ts` | Storefront schema: `priceRange.minVariantPrice` (not `priceRangeV2`), `onlineStoreUrl` (not `onlineStorePreviewUrl`), drop `status/published_status` filter (Storefront already only returns published-to-online-store products). `sortKey: BEST_SELLING` still valid. |
| `lib/shopify/get-products.ts` | Update `LiveResponseNode` to Storefront shape. Map `priceRange.minVariantPrice` → `price`. Keep URL fallback `https://{domain}/products/{handle}`. Keep diagnostic splits from earlier patch. |
| `.env.local.example` | Rename `SHOPIFY_ADMIN_TOKEN=` → `SHOPIFY_STOREFRONT_TOKEN=` with updated comment (Storefront API access token, server-side use, no scope needed beyond default). |
| `docs/codebase-overview.md` | Stack line + folder annotation: Admin → Storefront. |
| `docs/deployment.md` | Env table + "Switching Mock → Live" steps reverted to Storefront-app flow. |
| `docs/project-changelog.md` | Add NEW entry under `[2026-06-01]` documenting the pivot (do not delete the earlier same-day Admin entry — audit trail). |

### User-side action
Rename in `.env.local`: `SHOPIFY_ADMIN_TOKEN=` → `SHOPIFY_STOREFRONT_TOKEN=` (value `shpss_...` already correct).

### What NOT changing

- `package.json` — NOT re-adding `@shopify/storefront-api-client` (raw fetch keeps zero deps; same pattern as current code).
- `app/shop/page.tsx` — UI untouched.
- `lib/shopify/types.ts` + `mock-products.ts` — schema unchanged, mock fixtures still valid.
- `next.config.ts` — `cdn.shopify.com` already in `images.remotePatterns`.

## Why this is OK

- Storefront API only returns published-to-online-store products by default → matches our intent.
- Storefront's `priceRange.minVariantPrice` and `onlineStoreUrl` are first-class fields → simpler mapping than Admin.
- No 24h token rotation → no module-cache, no failure mode for expired-token paths.
- Diagnostic logging from earlier patch carries over unchanged → debugging stays smooth.

## Risks

| Risk | Mitigation |
|---|---|
| Storefront API rate limits differ from Admin | Storefront limit is high for catalog reads; `revalidate: 3600` already throttles |
| `onlineStoreUrl` null when product has no public URL | Same `{domain}/products/{handle}` fallback as before |
| Audit confusion — two changelog entries on same day | Both kept intentionally; second entry explicitly references reverting the first |

## Success Criteria

- `pnpm typecheck` + `pnpm lint` clean
- `SHOPIFY_MODE=mock` still renders 8 mock products
- `SHOPIFY_MODE=live` + valid `shpss_` token + correct env-var name → real products render on `/shop`
- Server logs: clean — no `HTTP 401`, no diagnostic noise on success path
- Grep gate: no `X-Shopify-Access-Token` (Admin header) and no `admin/api/` URL fragments remaining in `lib/shopify/`

## Unresolved Questions

1. Confirm scope on the `shpss_` token. If it was generated under the old Custom App with limited scopes, may need regeneration via Storefront API access tokens section in the new Dev Dashboard app.
2. What "App automation token" actually is — open question; not blocking, can ignore.
3. Should we add `cache: "no-store"` for the non-OK response path so future token issues don't poison Next's fetch cache for an hour? (Carryover from earlier brainstorm, still relevant.)

## Sources

- [Client secrets and Admin API access (Shopify docs)](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets)
- [How to get Admin API tokens using apps in Dev Dashboard — Shopify community](https://community.shopify.dev/t/how-to-get-admin-api-tokens-using-apps-in-dev-dashboard/29472)
- [How to find admin api key after the new update — Shopify community](https://community.shopify.com/t/how-to-find-admin-api-key-after-the-new-update/582482)
