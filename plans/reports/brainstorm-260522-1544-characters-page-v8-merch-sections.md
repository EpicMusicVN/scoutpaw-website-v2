# Brainstorm — Characters Page v8 (Character + Merch Sections)

**Date:** 2026-05-22 · **Status:** Approved · **Scope:** single page redesign + data-model addition

## Problem Statement

Redesign `/characters` so each character both introduces the character
(personality/story) and showcases related merchandise — engaging, modern,
merchandise-focused, character still the highlight. Each block: visual, name,
short description, related products, purchase CTA. Merch must feel naturally
connected to the character, not a separate store.

## Current State (v7, shipped ~5h prior)

`/characters` = FullBleedHero → `CharacterCarousel` (Max-anchored carousel of
nameplate cards → floating detail card) → NewsletterCTA. `characters.json` has
no merchandise linkage.

## Honesty Flags Raised

1. 4th Characters iteration today + a direction shift (showcase → character-
   driven commerce). v8 supersedes the v5-v7 carousel/detail model.
2. No character↔merchandise link exists — must be created.
3. Overlap with the `/top-picks` merch page — different cut (fandom vs curated
   deals); product data kept separate (per user decision).

## Decisions (user-approved)

| Topic | Decision |
|---|---|
| Page model | Vertical per-character sections (replaces the v7 carousel/detail) |
| Merch data | Embed a `products` array in `characters.json` |
| Merch count | 2 products per character |
| `[slug]` pages | Keep; each section links to `/characters/[slug]` ("full story") |

## Final Design

### Page (`app/characters/page.tsx` — rewritten)
FullBleedHero → CloudDivider → `CharacterSection` ×5 (Max first, alternating
sides) → CloudDivider → NewsletterCTA.

### `CharacterSection` (new) — themed per-character editorial block
Alternating zig-zag (image-left / image-right). Visual side: large character
pose + themed bloom + subtle atmosphere/motif decor (character stays the
highlight). Content side: breed kicker · name (`<h2>`) · tagline subtitle ·
short description (`bio`) · 2-product merch row · "Shop {name}'s Collection"
CTA · "Read {name}'s full story" link → `/characters/[slug]`. Section sits on a
soft themed wash (`surfaceTint`/`heroGradient`); merch cards pick up the
character `accentColor` so products live inside the character's themed world.
`id={slug}` anchor for `/characters#max` deep-linking.

### `CharacterMerchCard` (new, client)
Lean card: product image on a themed tile · title · optional accent badge ·
whole card → external storefront (new tab, `rel="noopener"`) + `track()` event.
Cozy-card language (rounded, `shadow-cozy`, hover lift). 3rd product-card
variant — accepted (character-merch shape is simpler than `TopPick`/
`ShopProduct`; forcing reuse would be uglier).

### Data — `characters.json`
Extend `CharacterSchema`: `products: array(CharacterProductSchema).default([])`
(`{ id, title, image, badge?, ctaHref }`) + `merchCtaHref?: string`. Populate
all 5 characters with 2 products each (reuse existing shop/character image
assets; CTAs → existing external storefronts). No new content file / adapter
method — `getCharacters()` already returns it.

### Retired (v7 carousel/detail superseded)
Delete: `character-carousel.tsx`, `-carousel-track`, `-carousel-card`,
`-carousel-arrows`, `-carousel-ambient`, `-detail-card`, `-detail-decor`.
Kept & reused: `CharacterAtmosphere`, `CharacterMotif`, `character-scene-decor`,
`character-themes.ts`, `CharacterQuote`, `character-card.tsx` (still used by the
`[slug]` page + Home showcase).

### Responsive / Perf / A11y
Desktop 2-col alternating; tablet/mobile stacked (pose top, content+merch
below), 2 merch cards side-by-side. `next/image`, `priority` only on the first
pose. `ScrollReveal` per section; reduced-motion honored. External CTAs
`target=_blank rel=noopener`; section name `<h2>`; light themed washes keep
`ink` AA.

## Files

**Create:** `components/characters/character-section.tsx` ·
`components/characters/character-merch-card.tsx`
**Modify:** `app/characters/page.tsx` (rewrite) · `lib/content/schemas.ts`
(`CharacterProductSchema` + `products`/`merchCtaHref`) · `content/characters.json`
(products ×5) · docs
**Delete:** the 7 carousel/detail components
All component files < 200 lines (extract the merch row if section overruns).

## Risks

| Risk | Mitigation |
|---|---|
| Deletes ~7 components built today (v5-v7) | Accepted via the "vertical sections" choice; grep-verify no dangling imports before deleting |
| `character-section.tsx` may exceed 200 lines | Extract the merch row into a sibling if needed |
| 3rd product-card variant | Accepted; genuinely simpler shape, YAGNI over forced reuse |
| atmosphere/motif/scene-decor must stay used | The new sections consume them; verify before keeping |

## Success Criteria

`/characters` is a scroll-through of 5 themed character sections · each block:
visual + name + description + 2 merch products + purchase CTA + full-story link ·
merch visually integrated into the character's themed world · alternating layout ·
responsive · carousel/detail components removed cleanly (no dangling refs) ·
typecheck + lint pass.

## Next Steps

1. `/ck:plan` from this report → phased implementation plan.
2. Implement → test → code-review → docs sync.

## Unresolved Questions

- Section CTA target: external storefront via per-character `merchCtaHref`
  (curated, pointing at the generic storefronts for now) — confirm at impl time
  if per-character collection URLs become available.
- Section vertical sizing (fixed `min-h` vs content-driven) — tune in QA.
