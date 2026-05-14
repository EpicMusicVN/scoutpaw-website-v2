---
title: 'UI Polish Pass — Contrast, Heroes, Spacing, Card Cleanup'
description: >-
  Bounded polish pass after the Bluey-inspired redesign. Fixes nav contrast,
  swaps in supplied hero banners (banner.png home, promotion.png shop), reduces
  menu/product cards to live-data only, flips character cards to show name not
  breed, and closes the cream gap between newsletter and footer. ~10 files, ~150
  LOC, no new components unless hero variants warrant.
status: completed
priority: P2
branch: ''
tags:
  - ui
  - polish
  - contrast
  - hero
  - tailwind
blockedBy: []
blocks: []
created: '2026-05-10T15:55:18.546Z'
createdBy: 'ck:plan'
source: skill
---

# UI Polish Pass — Contrast, Heroes, Spacing, Card Cleanup

## Overview

Follow-up to the completed Bluey redesign (`../260508-1054-website-redesign/`). User reports the site still has readability + branding consistency gaps: nav links read faded, descriptions blend into cream, both heroes still use placeholder character clusters instead of the supplied `banner.png` / `promotion.png`, character cards show breed not name, shop has too many product tiles, and the newsletter has a dead cream band before the footer.

**Source brainstorm:** [`../reports/brainstorm-260510-2241-ui-polish-pass.md`](../reports/brainstorm-260510-2241-ui-polish-pass.md)

**User-confirmed design choices:**
1. Home hero → full-bleed `banner.png`, text in upper-left sky zone, honey gradient mask on left ~40%
2. Shop hero → stacked: full-width `promotion.png` on top, cream text-strip with kicker + CTAs below (no competing h1)
3. Nav contrast → `text-ink/80` → `text-ink` (full opacity)
4. Footer gap → drop bottom `SectionCurve` from newsletter + `mt-12` from `<footer>`; honey meets grass directly

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Contrast & Spacing](./phase-01-contrast-spacing.md) | Completed |
| 2 | [Hero Rebuild](./phase-02-hero-rebuild.md) | Completed |
| 3 | [Card Cleanup](./phase-03-card-cleanup.md) | Completed |

**Phase order rationale:** Phase 1 is broad/safe (color + spacing tokens) — lands fast wins, gives us a clean canvas. Phase 2 is the riskiest piece (visual rewrite of two heroes). Phase 3 is data-shape changes (filtering arrays, swapping breed→name) — keeps risk isolated to component internals.

## Dependencies

None. Bluey redesign (260508-1054) is `completed`. No cross-plan blocks.

## Out of Scope

- New routes, new components beyond hero variants if they emerge organically
- Tailwind config token additions
- Mobile-nav redesign beyond the color fix
- New banner art or image generation
- AboutShop section (not flagged)
- FeatureBanner on home (image-in-frame card display — leave as-is)

## Risks (Plan-Level)

| Risk | Mitigation |
|------|------------|
| `banner.png` is 6.5MB — bad LCP | `public/assets/banner/banner.webp` already exists; use webp via Next/Image priority |
| Removing newsletter bottom curve creates abrupt honey→grass edge | Grass strip's existing top wave still gives a soft handoff; verify visually at 1440 + 360 |
| Hero refactor introduces 2 variants in one file | Keep `CinematicHero` for two-zone; add `FullBleedHero` + `StackedHero` as separate files if branching exceeds ~30 LOC |
| Stale deployed build may still show "white text" symptom | Code on disk is `text-ink/*`, not white — flag for post-deploy hard-reload verification |

## Success Criteria (Plan-Level)

- [ ] All three pages (home / shop / watch) read as branded, contrast-clean, and hero-correct
- [ ] No regressions on existing CTAs, links, products, character routes
- [ ] Layout responsive at 360 / 768 / 1280 / 1440
- [ ] Lighthouse a11y ≥95 per page
- [ ] Type-check passes after each phase
- [ ] Visual smoke screenshots saved to `visuals/` for before/after comparison
