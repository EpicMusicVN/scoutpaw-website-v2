---
title: Hero + Cards + Shop Layout Polish
description: >-
  Drop ': Scoutpaw TV' from Home hero title. Refactor FullBleedHero overlay to
  bottom-left anchor (Home + Shop, shared component). Swap Home menu card images
  to Set A assets with bg fix for Characters. Refactor Shop ExploreProducts
  tiles to editorial (image-first, text-below) layout.
status: completed
priority: P2
branch: ''
tags:
  - ui
  - polish
  - hero
  - cards
  - shop
  - homepage
blockedBy: []
blocks: []
created: '2026-05-14T15:54:55.156Z'
createdBy: 'ck:plan'
source: skill
---

# Hero + Cards + Shop Layout Polish

## Overview

Four targeted UI polish changes, all visual / layout-only — no business logic, no new deps, no new components.

1. **Home hero title:** drop trailing `: Scoutpaw TV` suffix.
2. **FullBleedHero overlay:** vertically-centered card overlaps Corgi (Home) and merch (Shop). Re-anchor card to bottom-left, narrower default width, with localized bottom-up gradient for backdrop. Shared component — fixes both pages.
3. **Home menu cards:** swap to Set A images from `assets/card/`. Characters card bg `#fffbe6 → var(--bg-soft-sky)` to prevent yellow-duck blend.
4. **Shop ExploreProducts:** refactor sticker-overlay tile to editorial layout — image card on top (retains tile.rotate), separate text card below.

Source brainstorm: `plans/reports/brainstorm-260514-2243-hero-cards-shop-layout-polish.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero refactor (title + FullBleedHero)](./phase-01-hero-refactor-title-fullbleedhero.md) | Completed |
| 2 | [Home menu cards image swap](./phase-02-home-menu-cards-image-swap.md) | Completed |
| 3 | [Shop ExploreProducts editorial refactor](./phase-03-shop-exploreproducts-editorial-refactor.md) | Completed |
| 4 | [Validation + visual QA](./phase-04-validation-visual-qa.md) | Completed |

## Dependencies

None. Phases 1–3 are independent (different files) and can run in parallel if desired. Phase 4 (validation) runs after all three.

## Key Files

- `app/page.tsx` — Home title literal.
- `components/home/full-bleed-hero.tsx` — shared hero component (Home + Shop).
- `components/home/menu-cards.tsx` — Home destination cards.
- `components/shop/explore-products.tsx` — Shop category tiles.
- `assets/card/{characters,shop,watch}.png` — Set A images (transparency to be verified at impl).

## Out of Scope

Watch page, mobile Hero card path, AboutShop, ProductGrid/ProductCard, NewsletterCTA, CloudDivider, footer, navbar.
