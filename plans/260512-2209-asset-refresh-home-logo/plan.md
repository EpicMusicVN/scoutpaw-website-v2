---
title: 'Asset Refresh — Banner, Cards, Logo Re-Optimization'
description: >-
  Re-optimize home hero, menu cards, and logo usage across navbar/footer/mobile
  menu after asset updates (new banner composition + background-removed
  transparent PNGs).
status: done
priority: P2
branch: ''
tags:
  - home
  - ui
  - polish
  - assets
blockedBy: []
blocks: []
created: '2026-05-12T15:14:59.734Z'
createdBy: 'ck:plan'
source: skill
---

# Asset Refresh — Banner, Cards, Logo Re-Optimization

## Overview

User updated 10 PNGs in `/assets/`: new fish-eye banner (5 dogs centered across full horizontal band), 7 transparent card icons, 2 transparent logo files. Components were laid out for the previous assets — new compositions risk text/icon overlap and ungrounded floating PNGs. This plan executes the approved brainstorm in 5 phases.

**Brainstorm:** [reports/brainstorm-260512-2209-asset-refresh-home-logo.md](../reports/brainstorm-260512-2209-asset-refresh-home-logo.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Asset Sync](./phase-01-asset-sync.md) | Completed |
| 2 | [Full-Bleed Hero Adjustments](./phase-02-full-bleed-hero-adjustments.md) | Completed |
| 3 | [Menu Cards Transparent-Icon Treatment](./phase-03-menu-cards-transparent-icon-treatment.md) | Completed |
| 4 | [Logo Treatments](./phase-04-logo-treatments.md) | Completed |
| 5 | [Visual QA + Type Check + Lint](./phase-05-visual-qa-type-check-lint.md) | Completed |

## Key Decisions (Locked)

- Sync `/assets/` → `/public/assets/` as part of this work
- Banner crop: keep dogs centered, crop sides (no art-direction)
- Cards: floating icon w/ soft shadow + subtle glow
- Logos: keep navbar shadow, add wordmark to mobile menu header, bump footer glow on navy
- **Out of scope:** favicon refresh, shop/watch heroes, character-cluster component

## Dependencies

None. All previous ScoutPaw plans (responsive audit, watch redesign, etc.) are completed.

## Success Criteria (Plan-level)

- All 10 PNGs synced to `/public/assets/`
- Home hero: dogs fully visible at 360/768/1024/1440; text panel in upper-left sky zone
- Menu cards: icons grounded w/ shadow + glow; hover lift smooth
- Logos: crisp on light (paper, honey) and dark (navy) backgrounds; mobile menu shows wordmark
- `pnpm lint` and `pnpm typecheck` pass; no LCP/CLS regression on home
