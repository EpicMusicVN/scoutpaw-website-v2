# Characters Page v8: From Carousel Showcase to Character-Driven Commerce

**Date**: 2026-05-22 15:44
**Severity**: Medium
**Component**: Characters page, merchandise integration
**Status**: Planned, awaiting implementation

## What Happened

Brainstormed and planned a fourth major redesign of the Characters page in a single day. v8 abandons the v5–v7 carousel/detail-view model entirely and replaces it with a vertical-scroll layout of 5 themed per-character sections. Each section blends character intro (visual, name, short description) with 2 related merchandise products and a "Shop Collection" CTA, paired with a link to the existing `/characters/[slug]` story page. Merchandise data embeds directly on the character schema in `characters.json` as a `products` array + `merchCtaHref` field. No new content files or adapter methods required. Design approved by user as-is; 4-phase implementation plan created and task list hydrated.

## The Brutal Truth

This is the **fourth Characters page design in one day**. The second one to substantially throw away same-day work: v7 (carousel/detail) is now fully superseded by v8 (vertical merch sections), with ~7 components being deleted—`character-carousel.tsx`, `character-carousel-card.tsx`, `character-carousel-arrows.tsx`, `character-carousel-track.tsx`, `character-carousel-fade.ts`, `character-detail-card.tsx`, `character-detail-hero.tsx`, among others. Code that was designed, implemented, and code-reviewed is now waste.

This is frustrating because **the page is being discovered by building, not by planning upfront**. We're learning the product shape in the browser, not in a spec. That's creative, but it's also expensive—each pivot costs hours of focused work, review cycles, and context switching.

The honest frame: a shift toward character-driven commerce is a legitimate product decision. But the velocity-as-waste tradeoff deserves to be named, not silently absorbed.

## Technical Details

**Merchandise schema change** (minimal, non-breaking):
```typescript
// characters.json: new fields per character
"products": [
  { "id": "...", "name": "...", "price": "...", "image": "..." },
  { "id": "...", "name": "...", "price": "...", "image": "..." }
],
"merchCtaHref": "https://shop.../[character-slug]"
```

**Component deletion list** (7 modules):
- `components/characters/character-carousel.tsx`
- `components/characters/character-carousel-card.tsx`
- `components/characters/character-carousel-arrows.tsx`
- `components/characters/character-carousel-track.tsx`
- `components/characters/character-carousel-poses.ts`
- `components/characters/character-detail-card.tsx`
- `components/characters/character-detail-hero.tsx`

**New component family** (3 zig-zag sections × 5 characters):
- `character-carousel.tsx` (wrapper, carousel removed)
- `character-detail-card.tsx` (merch-focused card pair + CTA)
- `character-motif.tsx` (character intro + link to story)

## Cross-Feature Overlap Surfaced

Earlier today, a Top Picks merchandise page was built. v8 makes the Characters page merch-focused too. **Same-day overlap flagged.** User's resolution: keep product data separate (Top Picks = curated deals; Characters = fandom-driven per-character merch). Different editorial cuts, same schema structure. Acceptable, but marks the merch-integration surface as a shared concern that may consolidate later.

## Parallel Component Smell

v8 introduces a **third product-card variant**: `ProductCard` (ShopProduct), `OfferCard` (TopPicks), now `CharacterMerchCard` (Characters). Accepted as YAGNI-over-forced-reuse—the character-merch card is simpler (2 products + CTA per section, no deal pricing, no countdown). Forcing a shared component would uglify the shape. **But three parallel components is a DRY smell.** A future consolidation pass should re-examine whether these can unify under a configurable `<MerchCard variant="..." />` system without excessive prop drilling.

## Side Effect Proactively Raised

The `/characters/[slug]` per-character story pages would become semi-orphaned once the carousel (which deep-linked into them) is removed. **Raised with user; user chose to keep them.** Each new v8 section now links to the full story page, so the pages stay discoverable and merch feels part of each character's world. Avoids content waste and maintains the narrative depth the story pages provide.

## Lessons Learned

1. **Rebuild velocity is acceptable when direction is explicitly approved.** The page has been rebuilt 4 times; that's okay if the user sees the iterations and signs off. What matters is that the decision to pivot is visible and intentional, not a hidden thrash.

2. **When two surfaces start converging (Top Picks + Characters both doing merch), name the overlap immediately and get an explicit keep-separate-or-share decision.** Silence lets architectural drift happen unconsciously.

3. **Three near-parallel components is a warning sign.** DRY consolidation should happen soon, not after 5 variants exist. Schedule a component audit pass in the next 1–2 feature cycles.

4. **Content-side decisions (keep or orphan /characters/[slug]) belong in the design phase, not discovery during implementation.** Good catch: raised and resolved before code started.

## Next Steps

1. **Phase 1**: Implement base section layout + character-motif component (name, image, intro, story link). Parallel: add `products` and `merchCtaHref` fields to characters.json.
2. **Phase 2**: Implement CharacterMerchCard (2-product layout + Shop Collection CTA) and zig-zag section alternation.
3. **Phase 3**: Delete carousel/detail components. Wire /characters page to render new sections.
4. **Phase 4**: Visual polish, responsive breakpoints, accessibility audit.

**Ownership**: Implementation team (via task list).
**Timeline**: Sequential phases; no parallelization (each phase depends on previous).
**Risk**: None identified; schema is backward-compatible, product data can be backfilled incrementally.
