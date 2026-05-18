---
phase: 1
title: Content and Asset Reference Updates
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 1: Content and Asset Reference Updates

## Overview

All code/data edits land here. Four independent file changes — bundle in one phase to keep the diff reviewable as a single content refresh.

## Requirements

- Functional:
  - MenuCards icons render on transparent backdrop, no paw-tile pattern, no glow.
  - FeaturedPupSpotlight displays Golden Retriever artwork + "Max" copy correctly.
  - FeatureBanner image points at `shop/promotion.jpg`.
  - ExploreProducts tiles show new titles + copy + section subtitle; `?cat=plushes`/`?cat=apparel` routing still works.
- Non-functional:
  - TypeScript types remain sound (drop unused `bg`/`accentGlow` from `Card` type cleanly).
  - aria-labels match new visible titles in ExploreProducts.
  - No regressions to hover lift, drop-shadow, or scroll-reveal motion.

## Architecture

Four targeted edits, no new abstractions:

```
content/characters.json
  └─ swap "max" ↔ "buddy" entries (image, breed, name, bio, funFacts, accentColor; preserve `order`)

components/home/menu-cards.tsx
  └─ remove bg/accentGlow fields, paw-tile overlay div, accent-glow div
     and inline style backgrounds

app/page.tsx
  └─ assetUrl("shop/promotion.png") → assetUrl("shop/promotion.jpg")

components/shop/explore-products.tsx
  └─ add `title?: string` to Tile type
     update plushes + apparel entries (title + copy)
     h3 uses tile.title ?? categoryLabel(tile.category)
     aria-label prefers tile.title
     update section subtitle copy
```

## Related Code Files

- Modify:
  - `content/characters.json`
  - `components/home/menu-cards.tsx`
  - `app/page.tsx`
  - `components/shop/explore-products.tsx`

## Implementation Steps

### Step 1 — `content/characters.json`: swap `max` ↔ `buddy`

Swap the full body (name, breed, tagline, bio, funFacts, image, accentColor) but PRESERVE each entry's `slug` and `order`. Bios reference dog-specific traits and must travel with the slug.

After swap:

- `slug: "buddy"` → name `Buddy`, breed `Husky`, image `characters/husky-bg.png`, accentColor `#5BC0EB`, bio/funFacts from current `max` entry, `order: 1`.
- `slug: "max"` → name `Max`, breed `Golden Retriever`, image `characters/golden-2.png`, accentColor `#FFB627`, bio/funFacts from current `buddy` entry, `order: 2`.

Tagline can travel with the body (the "Always up for an adventure" line lives with Husky temperament; "sunny optimist" with Golden).

Leave `bella`, `oscar`, `rocky` untouched (out of scope).

### Step 2 — `components/home/menu-cards.tsx`: strip backdrop

1. Drop `bg: string` and `accentGlow: string` from the `Card` type definition.
2. Remove `bg` and `accentGlow` keys from all three entries in `allCards`.
3. In `MenuCard`, on the floating image card `<div>`:
   - Remove `style={{ background: card.bg }}`.
   - Keep `className` (rounded, shadow, hover transitions) — the box stays, just becomes transparent.
4. Delete the paw-tile pattern overlay `<div>` (the one using `patterns/paw-tile.svg`).
5. Delete the radial accent-glow `<div>` (the one with `card.accentGlow`).
6. Keep `<Image>` with `object-contain p-3` + drop-shadow.

Result: bare floating icon card with rounded outline + shadow + hover lift, text card overlap unchanged.

### Step 3 — `app/page.tsx`: promotion path

Line ~49: change image to `assetUrl("shop/promotion.jpg")`. No other changes.

### Step 4 — `components/shop/explore-products.tsx`: tile titles, copy, subtitle

1. Extend `Tile` type with `title?: string`.
2. Update `plushes` entry:
   - `title: "Dog Calming & Essentials Collection"`
   - `copy: "Shop our curated collection for pet anxiety, comfort, and wellness. Free your pup from stress today!"`
3. Update `apparel` entry:
   - `title: "Dog owner gifts"`
   - `copy: "Keep your pup close to your heart with essentials designed to celebrate your unbreakable bond."`
4. In render:
   - `<h3>{tile.title ?? categoryLabel(tile.category)}</h3>`
   - `aria-label={`Browse ${tile.title ?? categoryLabel(tile.category)}`}`
5. Section subtitle (the `<p>` under the `<h2>Find Your Pup&rsquo;s Favourite.</h2>`):
   - Replace with: `"Curated picks for the whole pack — calming essentials for pups + gifts for the humans who love them."`

## Success Criteria

- [x] `content/characters.json` updated; `slug:"max"` shows Golden Retriever fields.
- [x] `components/home/menu-cards.tsx` no longer references `bg`/`accentGlow`; pattern + glow divs removed.
- [x] `app/page.tsx` references `shop/promotion.jpg`.
- [x] `components/shop/explore-products.tsx` shows new tile titles, copy, subtitle; aria-labels updated.
- [x] `pnpm tsc --noEmit` passes (no dangling type errors from dropped Card fields).
- [x] `pnpm lint` passes.

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `featured-pup-spotlight.tsx` reads slug `max`; swap could mis-render | Confirmed only callsite of slug "max" is the spotlight. Bios swap with slug so narrative stays coherent. |
| Visual flatten makes MenuCards icons feel disconnected | Drop-shadow + hover lift + text card overlap preserved. Visual review in Phase 4 smoke tests. |
| `/characters/[slug]` pages render swapped data | Intended — slug+name+breed+image now consistent. Smoke-test `/characters/max` and `/characters/buddy` in Phase 4. |
| Old `promotion.png` still referenced elsewhere | Grep `promotion\.png` across repo before deploy to confirm only `app/page.tsx` line. |

## Security Considerations

None — text + asset path edits only. No auth, no input handling, no new external calls.
