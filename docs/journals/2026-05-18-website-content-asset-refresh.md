# Website Content Asset Refresh — Phase 1 Complete

**Date**: 2026-05-18 06:45
**Severity**: Medium
**Component**: Home page, Shop, Character data
**Status**: Phase 1 & 2 Complete; Phase 3-4 Pending

## What Happened

Executed Phase 1 (brainstorm + plan + implement) of content refresh. Landed 4 file edits: swapped character data for max/buddy slugs to align slug→name mapping, stripped visual cruft from home MenuCards, switched shop promo image format jpg, and retitled shop category tiles with SEO-friendly labels.

Build verified clean (tsc/lint/build all passing; /characters/max and /characters/buddy SSG'd correctly).

## The Brutal Truth

Discovered a pre-existing data bug: slug `"max"` mapped to name "Rocky" (Husky) while slug `"buddy"` mapped to name "Max" (Golden Retriever). Home component hardcodes `c.slug === "max"` and renders "Say hi to Max" — so it was showing a Husky photo under the Max headline. This is embarrassing and would confuse any user.

## Technical Details

**Root cause**: Likely a copy-paste error during initial content setup — slugs and names got crossed when somebody refactored character order.

**Why we fixed at data layer**: Rather than patch the component or swap just the image, we swapped the entire record bodies (name/breed/tagline/bio/funFacts/image/accentColor) between max/buddy keys. Bios reference dog-specific traits; moving them without the slug would create inconsistency downstream.

**Scope boundary**: Same pattern exists for bella/oscar/rocky slugs but excluded per YAGNI. Fixed only the actively rendered slug in FeaturedPupSpotlight.

## Lessons Learned

- **Content → code contracts are fragile.** Slug-driven lookups hide data inconsistencies until they render in production.
- **Prioritize data correctness over component defensiveness.** A clean data layer beats defensive component code.
- **Acknowledge partial fixes publicly.** Documented the bella/oscar/rocky gap so next dev knows it's intentional, not forgotten.

## Next Steps

- **Phase 3** (deploy + Cloudflare purge for shop images) — user owns
- **Phase 4** (post-deploy smoke tests) — user owns
- **Follow-up**: `lib/shopify/mock-products.ts` still references `shop/promotion.png` and product titles ("Buddy the Golden Plush", "Max the Husky Tee") that now contradict the swap. Out-of-scope now but flag before any public demo.
