---
title: Scroll Sun Fix — Global Fixed + Document Scroll
description: >-
  Reverse the prior hero-bound sun architecture. Sun becomes globally fixed in
  viewport, parallax-tracking document scroll, fading near footer. Lives on home
  page only.
status: completed
priority: P2
branch: ''
tags:
  - home
  - hero
  - motion
  - fix
blockedBy: []
blocks: []
created: '2026-05-12T19:04:52.329Z'
createdBy: 'ck:plan'
source: skill
---

# Scroll Sun Fix — Global Fixed + Document Scroll

## Overview

User reported sun "stays fixed/stuck on hero banner" — the hero-bound architecture (plan 260513-0134) worked as designed but doesn't match what user actually wants: a sun that travels across the entire page during scroll. Reverse to global fixed positioning + document-scroll-link + opacity fade near footer.

**Brainstorm:** [reports/brainstorm-260513-0158-scroll-sun-fix-global-document.md](../reports/brainstorm-260513-0158-scroll-sun-fix-global-document.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Rewrite ScrollSun](./phase-01-rewrite-scrollsun.md) | Completed |
| 2 | [Unwire from FullBleedHero](./phase-02-unwire-from-fullbleedhero.md) | Completed |
| 3 | [Wire to Home Page](./phase-03-wire-to-home-page.md) | Completed |
| 4 | [Typecheck + Lint](./phase-04-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Architecture: global fixed (`position: fixed`) + `useScroll()` document scroll
- Mount location: `app/page.tsx` (home only)
- Y travel: 0 → 400 px
- X drift: 0 → +40 → -20 (multi-stop)
- Opacity fade: `[0, 0.85, 1] → [1, 1, 0.3]` (fades to 0.3 in last 15% of scroll)
- z-index: `z-[5]` (above sections, below navbar z-30 + mobile menu z-50)
- Mobile: still `hidden md:block`

## Dependencies

None. Previous plan 260513-0134 (hero-bound version) completed but architecture reversed.

## Success Criteria (Plan-level)

- Sun stays in upper-right of viewport across all sections during scroll
- Sun translates Y/X smoothly; opacity fades near footer
- No layout shift; no overflow issues
- `pnpm typecheck` + `pnpm lint` clean

## Out of Scope

- Sun on other pages (Shop, Watch, Coming Soon) — not affected
- Sun rotation, continuous float, parallax differential — still excluded
- Mobile sun rendering — still hidden
