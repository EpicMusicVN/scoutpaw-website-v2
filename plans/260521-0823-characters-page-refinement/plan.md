---
title: "Characters Page Refinement"
description: >-
  Polish pass on the /characters carousel: swap to the Home FullBleedHero,
  make 3 cards fully visible, blend the carousel into the site background,
  uniform calm cards, arrows-only nav, and a cinematic center-first
  open/close transition.
status: completed
priority: P2
branch: "main"
tags:
  - characters
  - carousel
  - ui
  - polish
blockedBy: []
blocks: []
created: "2026-05-21T01:30:55.017Z"
createdBy: "ck:plan"
source: skill
---

# Characters Page Refinement

## Overview

Refinement of the `/characters` carousel shipped in `260521-0655-characters-carousel-page`
(completed). Six changes: Home-matching hero, 3-fully-visible focal coverflow,
site-blended background, uniform calm cards, arrows-only navigation, and a
cinematic center-first open/close transition. No new dependency, no content or
schema change. Design source: `plans/reports/brainstorm-260521-0823-characters-page-refinement.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero & Page Shell](./phase-01-hero-page-shell.md) | Completed |
| 2 | [Carousel Layout & Background](./phase-02-carousel-layout-background.md) | Completed |
| 3 | [Cards & Navigation](./phase-03-cards-navigation.md) | Completed |
| 4 | [Animation Rework](./phase-04-animation-rework.md) | Completed |
| 5 | [Cleanup & Docs Sync](./phase-05-cleanup-docs-sync.md) | Completed |

## Key Decisions

- Hero: reuse Home `FullBleedHero` + `CloudDivider` rhythm.
- Carousel: focal coverflow, **3 cards fully visible** (basis ~33.2% desktop), `MIN_SCALE` ~0.86.
- Background: remove `CharacterSceneBackdrop` block — carousel blends with site cyan; faint floating decor kept.
- Cards: **uniform calm white cards**; per-pup gradient reserved for the detail card.
- Navigation: left/right `ArrowButton`s only — pagination dots removed.
- Transition: **center-first** click → carousel recede → `layoutId` morph → staggered detail content; easing `cubic-bezier(0.16, 1, 0.3, 1)`.

## Key Dependencies

- Builds on the existing carousel components — modify, don't recreate.
- No new npm dependency. Reuses `FullBleedHero`, `CloudDivider`, `character-scene-decor`.

## Dependencies

No cross-plan blockers — `260521-0655-characters-carousel-page` is `completed`.
This plan supersedes parts of that build (hero, card styling, background, nav).
