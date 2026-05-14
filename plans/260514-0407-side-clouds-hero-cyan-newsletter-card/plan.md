---
title: 'Side Clouds, Hero Cyan Pivot, Newsletter Card Conversion'
description: >-
  4th iteration on home polish. Drops yellow from the hero (5th hero rev),
  converts newsletter to a Stay-Tuned style white card, removes footer
  GrassStrip, adds fixed-position side cloud decoratives for widescreens.
  Several reversals of recent decisions are intentional per user direction.
status: completed
priority: P2
branch: ''
tags:
  - design-system
  - hero
  - newsletter
  - footer
  - decoratives
blockedBy: []
blocks: []
created: '2026-05-13T21:07:59.939Z'
createdBy: 'ck:plan'
source: skill
---

# Side Clouds, Hero Cyan Pivot, Newsletter Card Conversion

## Overview

4th polish pass on home page. Net direction: yellow recedes (hero zone dropped, newsletter band dropped), white card surfaces lead, and a soft side-cloud frame appears on widescreens. Footer GrassStrip removed.

**Honest framing:** Hero is on its **5th revision**. This pass simplifies (drops a layer rather than adds). If still off, the next conversation should be about banner artwork.

**Source brainstorm:** `plans/reports/brainstorm-260514-0357-clouds-sides-and-newsletter-card.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Pack Leader Italic Removal](./phase-01-pack-leader-italic-removal.md) | Completed |
| 2 | [Character Featured Aspect 3-4](./phase-02-character-featured-aspect-3-4.md) | Completed |
| 3 | [Footer GrassStrip Removal](./phase-03-footer-grassstrip-removal.md) | Completed |
| 4 | [Hero Cyan Pivot + Strong Card](./phase-04-hero-cyan-pivot-strong-card.md) | Completed |
| 5 | [Newsletter White Card Conversion](./phase-05-newsletter-white-card-conversion.md) | Completed |
| 6 | [Side Clouds Component](./phase-06-side-clouds-component.md) | Completed |

## Execution Order

P1 → P2 → P3 → P4 → P5 → P6. Trivial-first, structural-last.

## Validation After Each Phase

- `pnpm typecheck` clean
- `pnpm lint` clean
- Visual smoke check after P3, P4, P5, P6

## Out of Scope

- New banner artwork
- Re-introducing yellow anywhere
- Logo asset tweaks
- Per-character `accentColor` changes
- Dark mode

## Dependencies

Builds on completed plans `260514-0213`, `260514-0315`, `260514-0333`. No blockers.
