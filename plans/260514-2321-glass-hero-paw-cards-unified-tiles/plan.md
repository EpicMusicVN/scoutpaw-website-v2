---
title: Glass Hero + Paw Cards + Unified Shop Tiles
description: >-
  Iteration 2 on Home + Shop UI. Refactor FullBleedHero from bottom-left opaque
  (iter-1) → top-left frosted-glass. Add per-card paw-print tile pattern to Home
  menu cards. Unify Shop tiles from two sibling cards (iter-1) into one
  connected card container.
status: completed
priority: P2
branch: ''
tags:
  - ui
  - polish
  - hero
  - glass
  - paw-pattern
  - cards
  - shop
  - homepage
  - iteration-2
blockedBy: []
blocks: []
created: '2026-05-14T16:26:10.237Z'
createdBy: 'ck:plan'
source: skill
---

# Glass Hero + Paw Cards + Unified Shop Tiles

## Overview

Iteration 2 on the Home + Shop visual pass. Iteration 1 (`260514-2243-hero-cards-shop-layout-polish`) shipped earlier this session; user reviewed and redirected 3 of the 4 pieces. This iteration:

1. **FullBleedHero** — rebase from bottom-left opaque (iter-1) → top-left frosted-glass. Removes the bottom-up gradient added in iter-1.
2. **Home menu cards** — add per-card repeating paw-print background pattern (new SVG asset). Section-level scattered decor stays.
3. **Shop ExploreProducts** — fold two sibling cards (iter-1: image card + separate text card) into ONE unified container. Whole-card tilt + hover-untilt.
4. **Validation** — typecheck + lint + visual QA.

Out of scope: card image swap (iter-1 ✓), Watch page, mobile hero, AboutShop, ProductGrid, NewsletterCTA, dividers, navbar, footer.

Source brainstorm: `plans/reports/brainstorm-260514-2321-glass-hero-paw-cards-unified-tiles.md`
Supersedes hero + Shop-tile decisions from: `plans/260514-2243-hero-cards-shop-layout-polish/`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero refactor (top-left glass)](./phase-01-hero-refactor-top-left-glass.md) | Completed |
| 2 | [Paw-pattern asset + menu cards integration](./phase-02-paw-pattern-asset-menu-cards-integration.md) | Completed |
| 3 | [Shop tiles unified card](./phase-03-shop-tiles-unified-card.md) | Completed |
| 4 | [Validation + visual QA](./phase-04-validation-visual-qa.md) | Completed |

## Dependencies

None — iter-1 already shipped. Phases 1–3 are independent (different files) and can run in parallel. Phase 4 runs after.

## Key Files

- `components/home/full-bleed-hero.tsx` — Hero overlay (Home + Shop).
- `components/home/menu-cards.tsx` — Home destination cards.
- `components/shop/explore-products.tsx` — Shop category tiles.
- `public/assets/patterns/paw-tile.svg` — NEW asset for card pattern.
