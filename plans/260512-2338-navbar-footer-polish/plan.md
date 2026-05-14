---
title: Navbar + Footer Polish — Logo Aspect Fix & Newsletter Simplification
description: >-
  Fix Next/Image aspect-ratio mismatches that caused stretched logos, downsize
  both navbar+footer logos to premium compact range, and replace the navbar
  Newsletter outline button with a text link + envelope SVG.
status: completed
priority: P2
branch: ''
tags:
  - nav
  - footer
  - ui
  - polish
  - logo
blockedBy: []
blocks: []
created: '2026-05-12T16:41:24.726Z'
createdBy: 'ck:plan'
source: skill
---

# Navbar + Footer Polish — Logo Aspect Fix & Newsletter Simplification

## Overview

After the asset refresh, navbar `full-logo.png` (intrinsic 1.18:1) and footer `text-logo.png` (intrinsic 4.44:1) render with mismatched aspect ratios because `<Image width/height>` props declare 2.5:1 and 2.92:1 respectively. This causes visible squishing. Plan fixes the aspect props, downsizes both logos to premium-modern scale, and simplifies the navbar Newsletter CTA to a text link.

**Brainstorm:** [reports/brainstorm-260512-2338-navbar-footer-polish.md](../reports/brainstorm-260512-2338-navbar-footer-polish.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Navbar Edits](./phase-01-navbar-edits.md) | Completed |
| 2 | [Footer Edits](./phase-02-footer-edits.md) | Completed |
| 3 | [Typecheck + Lint](./phase-03-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Navbar logo size: 40/48/56 px (`h-10 / md:h-12 / lg:h-14`)
- Newsletter CTA: text link w/ inline envelope SVG (no form, no removal)
- Footer logo size: 32/40/48 px (`h-8 / md:h-10 / lg:h-12`)
- Fix `<Image width/height>` props to match intrinsic file aspect ratios
- Scale drop-shadow offsets to match smaller logo dimensions

## Dependencies

None. Previous plan `260512-2209-asset-refresh-home-logo` is completed.

## Success Criteria (Plan-level)

- Navbar logo renders true 1.18:1 aspect, no stretch
- Navbar feels light: smaller logo, text-link newsletter, primary "Shop" button retained
- Footer wordmark renders true 4.44:1 aspect, no squish
- `pnpm typecheck` + `pnpm lint` clean
- No regression in mobile menu rendering (uses same logo asset)

## Out of Scope

- Mobile menu (`mobile-nav.tsx`) — polished last session
- Hamburger / mobile nav internals
- Footer column structure, social icons, copyright line, grass strip
- Newsletter section on home page (`#newsletter` target — unchanged)
