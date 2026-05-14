---
title: Scroll Sun — Hero Decoration with Framer Motion
description: >-
  Add a decorative scroll-driven sun to the hero. SVG (circle + 8 rays),
  brand-honey color, stacked drop-shadow glow. Vertical descent + horizontal
  drift via Framer Motion useScroll + useTransform. Hero-bound (scrolls away
  with section). Hidden on mobile. Respects prefers-reduced-motion.
status: completed
priority: P3
branch: ''
tags:
  - home
  - hero
  - motion
  - decoration
blockedBy: []
blocks: []
created: '2026-05-12T18:38:15.833Z'
createdBy: 'ck:plan'
source: skill
---

# Scroll Sun — Hero Decoration with Framer Motion

## Overview

New decorative element: scroll-linked sun at upper-right of hero. Descends ~220 px and drifts horizontally as user scrolls through the hero section. Built with Framer Motion (already a dep). No new dependencies.

**Brainstorm:** [reports/brainstorm-260513-0134-scroll-sun-hero-decoration.md](../reports/brainstorm-260513-0134-scroll-sun-hero-decoration.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Create ScrollSun Component](./phase-01-create-scrollsun-component.md) | Completed |
| 2 | [Wire into FullBleedHero](./phase-02-wire-into-fullbleedhero.md) | Completed |
| 3 | [Typecheck + Lint](./phase-03-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Scope: hero-bound (sun lives inside hero section, scrolls away naturally)
- Style: simple geometric (circle r=22 + 8 ray lines), no face
- Color: `text-brand-honey` via currentColor
- Glow: stacked drop-shadow (24px 0.55 alpha + 16px 0.28 alpha)
- Motion set: vertical scroll-link (0→220 px) + horizontal drift (0→+28→-16 multi-stop). No rotation, no continuous float.
- Position: `right-[12%] top-[14%] lg:right-[16%] lg:top-[16%]`
- Size: `h-20 w-20 md` / `lg:h-24 lg:w-24` (80/96 px)
- Mobile: `hidden md:block` — sun does not render below 768 px
- Accessibility: `aria-hidden="true"`, `pointer-events-none`, `useReducedMotion`

## Dependencies

None. Previous plans completed.

## Success Criteria (Plan-level)

- Sun renders at upper-right of hero on md+
- Vertical descent + horizontal drift smooth, no jank
- Hidden on mobile
- Reduced-motion users see static sun
- `pnpm typecheck` + `pnpm lint` clean
- No regression to hero layout, glass card, banner image
