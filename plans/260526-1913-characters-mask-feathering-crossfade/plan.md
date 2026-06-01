---
title: Character Scene Mask Feathering and True Crossfade
description: >-
  Add mask-image edge feathering to character scenes (top + bottom 12% fade to
  transparent) + widen incoming opacity to true 0→1 crossfade. Adjacent scenes
  blend through feathered edges instead of hard color cuts.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - characters
  - motion
  - css
blockedBy:
  - 260526-1714-characters-stacked-page-scroll
  - 260526-1815-characters-soft-transitions-vip-buffer
blocks: []
created: '2026-05-26T12:14:31.031Z'
createdBy: 'ck:plan'
source: skill
---

# Character Scene Mask Feathering and True Crossfade

## Overview

Plan L of styling iteration 4. Third pass at softening character scene transitions on `/characters`. Plan H's `0.5 → 1.0` opacity range still felt hard because:
- Adjacent scenes' solid tints meet edge-to-edge with no soft boundary
- Opacity never goes to 0, so previous scene stays partially visible during entry

**Two changes:**
1. **`mask-image` edge feathering** — top + bottom 12% of each scene fade to transparent via `linear-gradient` mask. Adjacent scenes show through each other's feathered edges.
2. **True 0 → 1 crossfade** — incoming opacity widens from `[0.5, 1]` (Plan H) to `[0, 1]`. Scene fully invisible at start of entry, fully opaque at sticky-pin time.

Combined: visible blend zone where Scene N's feathered bottom + Scene N+1's feathered top + Scene N+1's fading-in opacity all overlap — true cinematic crossfade.

**Brainstorm report:** [plans/reports/brainstorm-260526-1913-styling-iteration-4.md](../reports/brainstorm-260526-1913-styling-iteration-4.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Mask Image and Opacity Range](./phase-01-mask-image-and-opacity-range.md) | Completed |
| 2 | [Verification and Docs](./phase-02-verification-and-docs.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1714-characters-stacked-page-scroll` (Plan E — sticky structure)
- **Blocked by:** `260526-1815-characters-soft-transitions-vip-buffer` (Plan H — opacity tween being refined)

## Affected Files (summary)

- `components/characters/character-section.tsx` — add `maskImage` + `WebkitMaskImage` to motion.div style; widen incoming opacity range
- `docs/project-changelog.md` — entry

## Out of Scope

- Recoloring character tints (deferred — feathering should soften enough)
- Mobile behavior change (mask + opacity apply at all breakpoints; mobile reads as natural with no sticky)
- Other Plan E/H mechanics (scale, useReducedMotion guard, sticky positioning)
