---
name: brainstorm-shop-jpg-image-swap
date: 2026-05-18
slug: shop-jpg-image-swap
type: brainstorm
status: agreed
related:
  - plans/260518-0645-website-content-asset-refresh/
  - plans/reports/brainstorm-260518-0645-website-content-asset-refresh.md
---

# Brainstorm — Shop Page JPG Image Swap

## Problem

Shop page references three deleted `.png` assets. Local files swapped to `.jpg`; code still points at old paths. Three broken references currently:

| File | Line | Current | Target |
|---|---|---|---|
| `components/shop/explore-products.tsx` | 26 | `shop/1.png` | `shop/1.jpg` |
| `components/shop/explore-products.tsx` | 34 | `shop/2.png` | `shop/2.jpg` |
| `app/shop/page.tsx` | 22 | `shop/banner.png` | `shop/banner.jpg` |

Prior plan (`260518-0645-website-content-asset-refresh`) assumed *replace-content-keep-filename* strategy. Strategy diverged to **extension change**, invalidating Phase 3 CDN purge list of that plan.

## Constraints

- R2 production bucket already has `1.jpg`, `2.jpg`, `banner.jpg` (user confirmed). No upload step required.
- `lib/shopify/mock-products.ts` (3× `promotion.png` references) deferred — out of scope.
- Old `.png` R2 objects still exist; can be left or purged.

## Approaches Evaluated

### A) Code swap only (CHOSEN)
Edit 3 lines. Deploy. Done.
- **Pro:** YAGNI. Three deterministic line edits. Zero risk of breaking anything else.
- **Pro:** No abstraction needed — `assetUrl()` already handles path resolution.
- **Con:** Old `.png` R2 objects linger. Minor storage cost; cosmetic.

### B) Extension-agnostic helper
Introduce `shopAsset("1")` that resolves to active extension via config.
- **Pro:** Future format changes are config-only.
- **Con:** Premature abstraction. YAGNI violation. Three callsites do not justify a helper. Rejected.

### C) Content-negotiation server route
Serve `/shop/1` and let server pick `.jpg`/`.webp` based on `Accept` header.
- **Pro:** Modern responsive image story.
- **Con:** Massive over-engineering for a one-time format swap. Rejected.

## Recommendation

**Approach A.** Three-line edit. No new files, no helpers, no tests required (image render is visual-only; Next.js `<Image>` already covers fallback).

## Implementation Outline

```diff
- // components/shop/explore-products.tsx:26
- image: assetUrl("shop/1.png"),
+ image: assetUrl("shop/1.jpg"),

- // components/shop/explore-products.tsx:34
- image: assetUrl("shop/2.png"),
+ image: assetUrl("shop/2.jpg"),

- // app/shop/page.tsx:22
- image={assetUrl("shop/banner.png")}
+ image={assetUrl("shop/banner.jpg")}
```

Verification:
1. `pnpm build` — ensure no TS/asset errors.
2. `pnpm dev` — visually verify `/shop` hero + Explore Products tiles render.
3. Optional CDN purge for `shop/1.png`, `shop/2.png`, `shop/banner.png` (legacy cleanup).

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `.jpg` not actually in R2 yet | Low (user confirmed) | One-shot `curl -I <R2_BASE>/assets/shop/1.jpg` before merge |
| `mock-products.ts` `promotion.png` references surface in QA | Low | Already noted in prior plan; deferred until product mock cleanup |
| Old `.png` cache served from browser/CDN | Medium | Hard refresh + optional CDN purge of legacy keys |

## Success Criteria

- `/shop` page hero loads without 404.
- Both Explore Products tiles show artwork (no broken image icon).
- Local `pnpm dev` and prod URL both render identically.

## Out of Scope

- `lib/shopify/mock-products.ts` (`promotion.png` × 3) — deferred per prior plan.
- Mismatched mock product titles (Buddy/Max breeds) — deferred per prior plan.
- Image optimization / format negotiation strategy — premature.

## Next Steps

1. (Optional) `/ck:plan` if user wants phased plan + journal entry.
2. Otherwise direct implementation: 3-line patch + manual verify.

## Unresolved Questions

None.
