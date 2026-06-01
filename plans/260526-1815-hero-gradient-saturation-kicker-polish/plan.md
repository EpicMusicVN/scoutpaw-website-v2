---
title: Hero Gradient Saturation and Kicker Polish
description: >-
  Boost saturation on the global `.heading-gradient-tri` utility (deeper navy
  start, brand-yellow mid, 5 color stops) so hero h1s read more vibrant across
  the site. Swap watch-hero kicker from dim gold to deep navy `text-ink-blue`
  for AA-safe brand consistency.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - typography
  - gradient
  - hero
blockedBy:
  - 260526-1605-typography-system-and-vip-spacing
blocks: []
created: '2026-05-26T11:16:47.163Z'
createdBy: 'ck:plan'
source: skill
---

# Hero Gradient Saturation and Kicker Polish

## Overview

Plan G of styling iteration 3. Two foundational visual tweaks:

1. **Global gradient saturation boost** — update `.heading-gradient-tri` utility in `app/globals.css` with deeper navy start, brand-primary yellow mid, 5 stops. Auto-propagates to all 5 hero h1s site-wide.
2. **Watch hero kicker color** — swap `text-brand-gold` (dim `#b8862e`) → `text-ink-blue` (deep navy) for AA-safe brand consistency on the cyan/cream surface.

**Brutal honesty note:** User asked for yellow kicker; yellow on light bg fails WCAG AA (~1.4:1). Plan applies the "yellow on dark, blue on light" rule strictly per Plan D's contract — kicker goes deep navy, not yellow.

**Brainstorm report:** [plans/reports/brainstorm-260526-1815-styling-iteration-3.md](../reports/brainstorm-260526-1815-styling-iteration-3.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Gradient Utility Update and Kicker Swap](./phase-01-gradient-utility-update-and-kicker-swap.md) | Completed |
| 2 | [Verification and Docs](./phase-02-verification-and-docs.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1605-typography-system-and-vip-spacing` (Plan A — defines `.heading-gradient-tri`; this plan refines its color stops)

## Affected Files (summary)

- `app/globals.css` — `.heading-gradient-tri` color stops (and mobile fallback)
- `components/watch/watch-hero.tsx` — kicker color
- `docs/project-changelog.md` — entry

## Out of Scope

- Plan B/D heading colors (`text-navy` h2, body sweep) unchanged
- Other hero kickers stay on `text-ink-blue/70` from Plan D (already AA-safe)
- Footer headings (already yellow on navy — correct per rule)
