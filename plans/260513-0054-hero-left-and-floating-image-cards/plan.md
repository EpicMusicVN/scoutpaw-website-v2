---
title: Hero Left Swap + Floating-Image Pinterest Cards
description: >-
  Iterative refinement on the home page: swap hero glass card from upper-right
  to upper-left, and restructure Step Into the Pack cards to Pinterest pin
  pattern (small centered floating image + full-width text card below).
status: completed
priority: P2
branch: ''
tags:
  - home
  - hero
  - cards
  - ui
  - polish
blockedBy: []
blocks: []
created: '2026-05-12T17:59:33.016Z'
createdBy: 'ck:plan'
source: skill
---

# Hero Left Swap + Floating-Image Pinterest Cards

## Overview

Two refinements on what we just shipped:
1. Hero — change `md:right-12/lg:right-16` to `md:left-12/lg:left-16` on the glass card. Position-only swap, everything else identical.
2. Pack cards — invert the proportions. Previous: image card large + text card narrower below. New: small centered floating image card + full-width text card with the image overlapping the text card top edge (Pinterest pin pattern).

**Brainstorm:** [reports/brainstorm-260513-0054-hero-left-and-floating-image-cards.md](../reports/brainstorm-260513-0054-hero-left-and-floating-image-cards.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero Left Swap](./phase-01-hero-left-swap.md) | Completed |
| 2 | [Pack Cards Restructure](./phase-02-pack-cards-restructure.md) | Completed |
| 3 | [Typecheck + Lint](./phase-03-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Hero: just swap right → left, keep `max-w-md / lg:max-w-lg` width, all styling and copy unchanged
- Pack image card size: fixed `h-32 / md:h-36 / lg:h-40` (128/144/160 px square)
- Pack image style: colored badge (bg + glow + icon), smaller than before
- Text card: full column width, pulled up under image with `-mt-16 / md:-mt-[72px] / lg:-mt-20`, `pt-24 / md:pt-28 / lg:pt-32`
- Text alignment in text card: LEFT-aligned (consistent with site editorial style)
- Coming-soon badge: relocates to outer Link wrapper top-right (z-20)

## Dependencies

None. Previous plans 260512-2209, 260512-2338, 260513-0005, 260513-0031 are completed.

## Success Criteria (Plan-level)

- Hero glass card pinned `md:top-12 md:left-12 lg:top-16 lg:left-16`
- Pack cards show small centered floating image card visually overlapping a larger text card below
- Image card extends ~half its height above text card top, half overlaps text card with z-10
- `pnpm typecheck` + `pnpm lint` clean
- Visual QA at 360/768/1024/1440 confirms layout integrity

## Out of Scope

- Hero copy/styling (unchanged — position only)
- Other home sections, banner asset, navbar, footer, newsletter
