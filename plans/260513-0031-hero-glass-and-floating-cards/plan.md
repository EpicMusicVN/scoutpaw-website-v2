---
title: Hero Glass Card + Floating Pack Cards
description: >-
  Restructure home hero into a top-right glass card with new 3-tier typography
  and 70-word body. Restructure Step Into the Pack cards into two-element stacks
  (image card on top, narrower text card below with negative-margin overlap).
status: completed
priority: P2
branch: ''
tags:
  - home
  - hero
  - cards
  - ui
  - restructure
blockedBy: []
blocks: []
created: '2026-05-12T17:35:53.377Z'
createdBy: 'ck:plan'
source: skill
---

# Hero Glass Card + Floating Pack Cards

## Overview

Two home-page restructures (3 files):
1. Hero — upper-left text panel becomes upper-right `bg-honey/85 backdrop-blur-xl` glass card with new SCOUTPAW TV / THE ULTIMATE WORKDAY HANGOUT / 70-word body copy. Mobile: stacks below banner; md+: absolute top-right.
2. Pack cards — single sticker card per item becomes two stacked elements: aspect-square image card on top + narrower bg-surface text card below with `-mt-10` overlap. Card rotation hack removed.

**Brainstorm:** [reports/brainstorm-260513-0031-hero-glass-and-floating-cards.md](../reports/brainstorm-260513-0031-hero-glass-and-floating-cards.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero Restructure](./phase-01-hero-restructure.md) | Completed |
| 2 | [Page Wiring](./phase-02-page-wiring.md) | Completed |
| 3 | [Pack Cards Restructure](./phase-03-pack-cards-restructure.md) | Completed |
| 4 | [Typecheck + Lint](./phase-04-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Hero: top-right glass card (`bg-honey/85 backdrop-blur-xl`), max-w-md/lg, accept peeker pup overlap
- Hero mobile fallback: banner `aspect-[4/3]` + card flows below with `-mt-8`
- Hero typography: 3-tier (kicker SCOUTPAW TV / headline THE ULTIMATE WORKDAY HANGOUT / 70-word body)
- Hero CTAs: keep both (Watch Now + Meet the Pack)
- Gradient mask removed (glass card self-contained)
- Pack cards: two stacked cards w/ `-mt-10` overlap, aspect-square image card + bg-surface text card
- Card rotation hack removed (rotate-2/-rotate-2/hover:rotate-0)

## Dependencies

None. Previous plans 260512-2209, 260512-2338, 260513-0005 are completed.

## Success Criteria (Plan-level)

- Hero: glass card pinned top-right on md+, stacked below banner on mobile
- Hero: new 3-tier copy renders with comfortable hierarchy
- Pack cards: image card visibly "sits on" text card; hover lifts image more than text
- `pnpm typecheck` + `pnpm lint` clean
- No mobile-menu / footer regression
- Visual QA at 360/768/1024/1440 confirms integrity

## Out of Scope

- Other home sections (spotlight, character showcase, feature banner, video grid, newsletter)
- Shop / Watch / Coming-Soon heroes
- Banner asset (unchanged)
- Navbar / Footer (unchanged)
- Button component (unchanged)
