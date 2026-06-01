---
title: Watch Hero Poses and Subscribe Card Spacing
description: >-
  Fix watch hero's flanking poses being clipped at half-body (section
  overflow-hidden + tight container). Resize subscribe-card decorative dogs
  (w-64 → w-48, push out, move up) and bump section padding for footer clearance
  — same pattern as Plan F.
status: completed
priority: P3
branch: main
tags:
  - frontend
  - ui
  - watch
  - spacing
  - layout
blockedBy: []
blocks: []
created: '2026-05-26T11:16:50.787Z'
createdBy: 'ck:plan'
source: skill
---

# Watch Hero Poses and Subscribe Card Spacing

## Overview

Plan I of styling iteration 3. Two targeted fixes on the watch page:

1. **Watch hero flanking poses** (`husky1` + `corgi2`) are clipped at half-body — they live in a tight `<div className="relative">` text container with no padding, and the section has `overflow-hidden`. Fix by adding bottom padding to the text container so the pose natural height fits.
2. **Subscribe-card decoratives** (`corgi1` + `collie1`) are `w-64` (256px) overlapping card content + sit too close to footer. Resize to `w-48` (matching newsletter-cta pattern from Plan F) and bump section padding.

**Brainstorm report:** [plans/reports/brainstorm-260526-1815-styling-iteration-3.md](../reports/brainstorm-260526-1815-styling-iteration-3.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Watch Hero PB and Subscribe Card Resize](./phase-01-watch-hero-pb-and-subscribe-card-resize.md) | Completed |
| 2 | [Verification and Docs](./phase-02-verification-and-docs.md) | Completed |

## Dependencies

- None directly. Watch-hero and subscribe-card are not blocked by any in-flight plan.

## Affected Files (summary)

- `components/watch/watch-hero.tsx` — text container padding
- `components/watch/subscribe-card.tsx` — dog sizes + positions + section padding
- `docs/project-changelog.md` — entry

## Out of Scope

- Other watch page sections (OurChannels, VideoRail, ExploreVideos) — no spacing changes
- Footer behavior
- Watch hero gradient (handled by Plan G's global utility update)
