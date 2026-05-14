---
title: Hero Center-Left + Larger Image Cards + Section Decorations
description: >-
  Three coordinated home-page refinements: hero card anchored upper-third center
  on desktop + strict true-stack on mobile; pack cards image upsize (h-40/44/48)
  + force exact equal text-card heights via flex-1; add 6 scattered SVG
  decorations (paw/bone/ball) at 10% opacity behind cards.
status: completed
priority: P2
branch: ''
tags:
  - home
  - hero
  - cards
  - decorations
  - ui
  - polish
blockedBy: []
blocks: []
created: '2026-05-12T18:22:49.777Z'
createdBy: 'ck:plan'
source: skill
---

# Hero Center-Left + Larger Image Cards + Section Decorations

## Overview

Iterative refinement on the home page after plan 260513-0054 just shipped:
1. Hero — anchor card visually at upper-third (top-24 / lg:top-32) and switch mobile to strict true-stack (no overlap on banner)
2. Pack cards — image card upsize medium bump (h-40/44/48), restructure outer wrapper to flex-col + flex-1 on text card so all text cards render exact same height
3. Section bg — add 6 dog-themed SVG decorations (paw/bone/ball) at 10% opacity behind cards

**Brainstorm:** [reports/brainstorm-260513-0115-hero-center-and-pack-section-decor.md](../reports/brainstorm-260513-0115-hero-center-and-pack-section-decor.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero Center + Mobile Stack](./phase-01-hero-center-mobile-stack.md) | Completed |
| 2 | [Pack Cards Image Upsize + Equal-Size Text](./phase-02-pack-cards-image-upsize-equal-size-text.md) | Completed |
| 3 | [Section Decorations](./phase-03-section-decorations.md) | Completed |
| 4 | [Typecheck + Lint](./phase-04-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Hero desktop: `md:top-24 lg:top-32` (upper-third visual center). Same horizontal position (`md:left-12 lg:left-16`).
- Hero mobile: `mt-8` (replaces `-mt-8`) — true stack with 32px gap below banner.
- Pack image: `h-40 w-40 / md:h-44 md:w-44 / lg:h-48 lg:w-48` (160/176/192 px square).
- Pack text card overlap: `-mt-20 / md:-mt-[88px] / lg:-mt-24`. Top padding: `pt-28 / md:pt-32 / lg:pt-36`.
- Pack wrapper: `group relative block h-full` → `group relative flex h-full flex-col`. Text card adds `flex flex-1 flex-col`.
- Decorations: 6 inline SVG icons (3 paw, 2 bone, 1 ball), scattered absolute positions in `opacity-[0.10] text-warm-text` layer, `pointer-events-none`.

## Dependencies

None. Previous plans (260512-2209, 260512-2338, 260513-0005, 260513-0031, 260513-0054) all completed.

## Success Criteria (Plan-level)

- Hero card vertically anchored at upper-third visual center on md+, true-stacked below banner on mobile
- Pack image cards visibly larger; all 3 text cards render exact same width + height
- Section bg shows 6 subtle dog-themed decorations behind cards
- `pnpm typecheck` + `pnpm lint` clean

## Out of Scope

- Hero copy/styling (unchanged — position only)
- Pack cards section header h2/intro (unchanged)
- Other home sections, banner asset, navbar, footer
