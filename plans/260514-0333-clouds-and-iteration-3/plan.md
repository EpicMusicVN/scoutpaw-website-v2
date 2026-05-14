---
title: Cloud System + 3rd Iteration Pass
description: >-
  6 design refinements: white cloud decorative system, navbar glassmorphism (3rd
  color attempt), hero card-back + cyan right fade (4th hero iteration),
  Character Showcase narrower ratio + per-card paw scatter, Pack Leader subtitle
  title case.
status: completed
priority: P2
branch: ''
tags:
  - design-system
  - navbar
  - hero
  - homepage
  - decoratives
blockedBy: []
blocks: []
created: '2026-05-13T20:36:17.211Z'
createdBy: 'ck:plan'
source: skill
---

# Cloud System + 3rd Iteration Pass

## Overview

3rd iteration on home page after the cyan + yellow palette landed. User feedback after viewing the result: navbar still feels off, hero text still blends, right side feels unfinished, character showcase ratio needs adjusting. Plus a new decorative system: white clouds.

6 phases, sequential, ~3h total.

**Honest framing:** Hero is on its 4th revision. If the card-back + cyan right fade in P4 still doesn't land, the next conversation should be about the banner artwork itself, not more gradient layers.

**Source brainstorm:** `plans/reports/brainstorm-260514-0333-clouds-and-iteration-3.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Pack Leader Title Case](./phase-01-pack-leader-title-case.md) | Completed |
| 2 | [Character Showcase Ratio](./phase-02-character-showcase-ratio.md) | Completed |
| 3 | [Navbar Glassmorphism](./phase-03-navbar-glassmorphism.md) | Completed |
| 4 | [Hero Card-Back + Cyan Right Fade](./phase-04-hero-card-back-cyan-right-fade.md) | Completed |
| 5 | [Character Card Paw Scatter](./phase-05-character-card-paw-scatter.md) | Completed |
| 6 | [Cloud Divider Component](./phase-06-cloud-divider-component.md) | Completed |

## Execution Order

Sequential as numbered: P1 → P2 → P3 → P4 → P5 → P6.

Rationale: trivial-first (Pack Leader text), small-next (ratio), medium (navbar + hero), structural (per-card decor + cloud system).

## Validation After Each Phase

- `pnpm typecheck` clean
- `pnpm lint` clean
- Visual smoke check after P3 (navbar), P4 (hero), P5 (cards), P6 (clouds)

## Out of Scope

- New banner artwork
- Footer changes
- Logo asset re-tinting
- Animations beyond existing hover states
- Per-character `accentColor` updates
- Dark mode

## Dependencies

Builds on completed plans:
- `260514-0213-color-system-and-hero-rework` (palette + letterbox baseline)
- `260514-0315-website-iteration-pass` (yellow anchor + section polish)

No blockers.
