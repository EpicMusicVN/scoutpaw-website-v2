---
title: Hover Polish + No-CTA Hero
description: >-
  Iteration 3 on Home + Shop UI. Remove Hero CTA buttons on both pages. Unify
  Home menu card hover (synchronized timing/easing + outer-Link composition
  lift). Fix Shop tile hover layout instability by dropping the un-tilt on
  hover.
status: completed
priority: P2
branch: ''
tags:
  - ui
  - polish
  - hover
  - hero
  - cards
  - shop
  - homepage
  - iteration-3
blockedBy: []
blocks: []
created: '2026-05-14T16:46:19.671Z'
createdBy: 'ck:plan'
source: skill
---

# Hover Polish + No-CTA Hero

## Overview

Iteration 3 on the Home + Shop visual pass. Iter-1 (`260514-2243`) and iter-2 (`260514-2321`) shipped earlier this session. User reviewed iter-2 and requested four interaction polish items:

1. **Home Hero** — remove the `Watch Now` + `Meet the Pack` buttons.
2. **Home menu cards** — current hover has mismatched timings (200/300/300ms) on image, text, and pill. User wants unified motion.
3. **Shop Hero** — remove the `Explore Collections` button.
4. **Shop tiles** — `group-hover:rotate-0` (un-tilt) causes apparent layout shift / "text becomes larger." Drop the un-tilt; keep tilt at rest.

Cross-cutting: card-level hover transitions standardize on `duration-500 ease-gentle` site-wide.

Source brainstorm: `plans/reports/brainstorm-260514-2341-hover-polish-no-cta.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero CTA removal (FullBleedHero + Shop caller)](./phase-01-hero-cta-removal-fullbleedhero-shop-caller.md) | Completed |
| 2 | [MenuCard hover unification](./phase-02-menucard-hover-unification.md) | Completed |
| 3 | [Shop tile hover stability](./phase-03-shop-tile-hover-stability.md) | Completed |
| 4 | [Validation + visual QA](./phase-04-validation-visual-qa.md) | Completed |

## Dependencies

None — iter-1 and iter-2 already shipped. Phases 1–3 are independent (different concerns within different files / blocks) and can run in any order. Phase 4 runs after.

## Key Files

- `components/home/full-bleed-hero.tsx` — Hero component (CTA removal).
- `app/shop/page.tsx` — Shop page caller (drop `actions` prop).
- `components/home/menu-cards.tsx` — Home menu cards (hover unification).
- `components/shop/explore-products.tsx` — Shop tiles (hover stability).

## Out of Scope

Watch page, mobile path, AboutShop, ProductGrid, NewsletterCTA, dividers, navbar, footer, structural refactors.
