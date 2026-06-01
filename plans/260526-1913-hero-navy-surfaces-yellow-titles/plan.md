---
title: Hero Navy Surfaces and Yellow Gold Titles
description: >-
  Convert hero text containers to navy bg + introduce a yellow-only gold
  gradient + new text-shadow-bold utility. Solves the 'yellow titles + yellow
  kicker' request that previous iterations compromised on for AA concerns.
  Yellow gradient on navy is AA-safe everywhere.
status: completed
priority: P1
branch: main
tags:
  - frontend
  - ui
  - hero
  - typography
  - gradient
blockedBy:
  - 260526-1605-typography-system-and-vip-spacing
  - 260526-1815-hero-gradient-saturation-kicker-polish
blocks: []
created: '2026-05-26T12:14:24.875Z'
createdBy: 'ck:plan'
source: skill
---

# Hero Navy Surfaces and Yellow Gold Titles

## Overview

Plan J of styling iteration 4. Decisive structural fix for the "yellow hero titles" request after 3 iterations of AA-compromised attempts.

**Core change:** hero text containers become navy bg. Yellow gradient titles + yellow kickers + white body text now read AA-safe everywhere.

**New utilities (`app/globals.css`):**
- `.heading-gradient-gold` — yellow-only gradient (`#b8862e → #d4a833 → #ffd70c → #fff5cc → #ffffff`)
- `.text-shadow-bold` — dark grounding shadow + golden glow for gold-on-navy depth

**Hero conversions:**
- `CinematicHero` text panel: `bg-surface` → `bg-navy`
- `FullBleedHero` glass card + glass blob: `bg-white/*` → `bg-navy/*`
- `WatchHero` centered text: wrap in `bg-navy` rounded container
- `ComingSoonHero` text: wrap in `bg-navy` rounded container
- `CharacterDetailHero`: exception — keeps themed surfaceTint bg (per-character intent); only h1/kicker color tweaks

**Brainstorm report:** [plans/reports/brainstorm-260526-1913-styling-iteration-4.md](../reports/brainstorm-260526-1913-styling-iteration-4.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Gradient and Shadow Utilities and Hero Container Conversion](./phase-01-gradient-and-shadow-utilities-and-hero-container-conversion.md) | Completed |
| 2 | [Verification and Docs](./phase-02-verification-and-docs.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1605-typography-system-and-vip-spacing` (Plan A — heading utilities baseline)
- **Blocked by:** `260526-1815-hero-gradient-saturation-kicker-polish` (Plan G — current tri-gradient that we replace on heroes)

## Affected Files (summary)

- `app/globals.css` — new utility classes
- 5 hero components: `cinematic-hero.tsx`, `full-bleed-hero.tsx`, `watch-hero.tsx`, `coming-soon-hero.tsx`, `character-detail-hero.tsx`
- `docs/project-changelog.md` — entry

## Out of Scope

- Per-page kicker text content (handled by content layer)
- Banner background images
- Plan G's `.heading-gradient-tri` — kept for any non-hero gradient usage (no current non-hero consumers, but utility remains)
