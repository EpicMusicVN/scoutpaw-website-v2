---
title: 'Navbar Shop, Cloud Stacking, Hero Shift, Shop Split, Card Names'
description: >-
  6th home polish iteration. Demote navbar Shop pill to plain text link. Fix
  cloud z-index obscured by CharacterShowcase bg. Shift hero banner
  objectPosition right. View All button becomes solid blue (no arrow). Character
  names hover-only pill. Shop the Pack card image full-bleeds to edge.
status: completed
priority: P2
branch: ''
tags:
  - design-system
  - hero
  - navbar
  - homepage
  - polish
blockedBy: []
blocks: []
created: '2026-05-13T21:47:24.984Z'
createdBy: 'ck:plan'
source: skill
---

# Navbar Shop, Cloud Stacking, Hero Shift, Shop Split, Card Names

## Overview

6th polish iteration. Mostly small + 2 mediums (name hover + Shop split amplification). Hero only gets a `objectPosition` value tweak — convergence guardrail still holding (2nd round without structural hero changes).

**Source brainstorm:** `plans/reports/brainstorm-260514-0443-navbar-shop-clouds-hero-shop-split.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Navbar Shop Demotion](./phase-01-navbar-shop-demotion.md) | Completed |
| 2 | [Cloud Z-Index Fix](./phase-02-cloud-z-index-fix.md) | Completed |
| 3 | [Hero ObjectPosition Shift](./phase-03-hero-objectposition-shift.md) | Completed |
| 4 | [View All Blue Pill](./phase-04-view-all-blue-pill.md) | Completed |
| 5 | [Character Name Hover Pill](./phase-05-character-name-hover-pill.md) | Completed |
| 6 | [Shop The Pack Split Amplified](./phase-06-shop-the-pack-split-amplified.md) | Completed |

## Execution Order

Sequential: P1 → P6. Trivial-first.

## Validation After Each Phase

- `pnpm typecheck` clean
- `pnpm lint` clean
- Visual smoke after P5 + P6

## Out of Scope

- Hero structural changes
- Pack Leader card (already shipped, not in brief)
- New character motifs
- Banner artwork
- Footer
- Dark mode

## Dependencies

Builds on completed plans `260514-0213`, `260514-0315`, `260514-0333`, `260514-0407`, `260514-0431`. No blockers.
