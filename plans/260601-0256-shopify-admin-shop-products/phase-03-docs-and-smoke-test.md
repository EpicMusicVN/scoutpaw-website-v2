---
phase: 3
title: "Docs and Smoke Test"
status: completed
priority: P2
effort: "30m"
dependencies: [2]
---

# Phase 3: Docs and Smoke Test

## Overview

Update `docs/` for the Storefront → Admin swap. Add changelog entry. Manual live smoke test once user provides real `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN` in `.env.local`.

## Requirements

- Functional: docs reflect new env contract + integration mode. Live mode verified end-to-end.
- Non-functional: smoke test catches token-leak regression by inspecting page source + network tab.

## Related Code Files

- Modify: `docs/codebase-overview.md` — Shopify section: Admin API not Storefront, raw fetch, env names, `revalidate` strategy.
- Modify: `docs/project-changelog.md` — entry under appropriate version heading.
- Read for context: `docs/development-roadmap.md` — check whether the Shopify milestone needs status update (likely move "Shopify products live" from planned → done).

## Implementation Steps

1. Edit `docs/codebase-overview.md`:
   - Find the existing Shopify subsection.
   - Update to: integration uses Shopify **Admin** GraphQL API (`/admin/api/2024-10/graphql.json`) via raw `fetch` with `next: { revalidate: 3600, tags: ["shopify-products"] }`.
   - Env: `SHOPIFY_MODE` (`mock`|`live`), `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`.
   - Note: Admin token server-only (`import "server-only"` in `lib/shopify/`).
2. Edit `docs/project-changelog.md`: add entry — "Shop page now renders live Shopify products via Admin API; replaces unused Storefront client; external category tiles kept."
3. Edit `docs/development-roadmap.md` if a Shopify milestone exists — bump status.
4. Manual smoke test (user runs after providing real creds in `.env.local`):
   - `pnpm dev`
   - Visit `http://localhost:3000/shop`.
   - Confirm products render in the "From the Shop" section.
   - Click a product card → opens Shopify product page in new tab.
   - Click an `ExploreProducts` tile → opens Linktree / Fourthwall.
   - View page source: search for token (`shpat_`, or whatever prefix) — must be absent.
   - DevTools Network tab: no request from browser to `*.myshopify.com/admin/*` — all Admin calls happen server-side.
   - Toggle `SHOPIFY_MODE=mock` → mock products still render.
   - Toggle to an obviously-bad token → page still loads, `ShopEmptyState` renders (degrade gracefully).

## Success Criteria

- [x] `docs/codebase-overview.md` Shopify section reflects Admin API + new env names
- [x] `docs/project-changelog.md` has new entry
- [ ] Live mode smoke test passes all 7 checks above (user action; requires real creds in `.env.local`)
- [x] No `shpat_` (or token prefix) string anywhere in `pnpm build` client bundle output (verified: grep clean)
- [x] `pnpm build` succeeds with `SHOPIFY_MODE=mock` (no live creds required to ship) (verified: smoke test via curl on localhost:3000/shop)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| User-provided token has wrong scope (e.g. only `read_orders`) | Smoke test reveals immediately — 401/403 from Admin → empty array → `ShopEmptyState`. Doc names required scope `read_products`. |
| Shopify shop has no published products yet | Empty array path is tested; user gets friendly empty state, not a broken page. |
| Documentation drift if backend or page wiring changes later | Phase 3 is a separate phase so changes stay co-located; future edits should update both code and docs together. |

## Unresolved Questions

1. Exact heading copy ("Fresh from the kennel.") — placeholder; brand sign-off?
2. Should `mock-products.ts` `onlineStoreUrl: "#mock-store"` change to a real Shopify-shaped placeholder for clearer dev preview?
3. Webhook revalidation endpoint (`/api/revalidate` + `REVALIDATE_SECRET`) — out of scope here; track separately when live store is stable.
