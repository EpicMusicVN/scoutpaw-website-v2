---
title: Characters Soft Transitions and VIP Buffer
description: >-
  Add fade-in opacity tween on incoming character scenes (paired with existing
  outgoing fade from Plan E) so adjacent scenes crossfade instead of hard-cut.
  Add breathing-room buffer above the newsletter on /characters.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - characters
  - motion
  - scroll
blockedBy:
  - 260526-1714-characters-stacked-page-scroll
blocks: []
created: '2026-05-26T11:16:49.003Z'
createdBy: 'ck:plan'
source: skill
---

# Characters Soft Transitions and VIP Buffer

## Overview

Plan H of styling iteration 3. Two refinements to the Plan E stacked-scroll work:

1. **Softer scene-to-scene transitions** — add a second `useScroll` per scene to track ENTRY progress; tween opacity `0.5 → 1.0` during the first viewport-height of scroll into the scene. Combined with Plan E's outgoing fade `1.0 → 0.85`, creates a visible crossfade window where adjacent scenes briefly overlap.
2. **VIP buffer on /characters** — wrap newsletter in `<div className="pt-24 md:pt-32">` so it doesn't sit directly on top of the last scene's scroll-end.

**Brainstorm report:** [plans/reports/brainstorm-260526-1815-styling-iteration-3.md](../reports/brainstorm-260526-1815-styling-iteration-3.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Incoming Opacity Tween and VIP Buffer](./phase-01-incoming-opacity-tween-and-vip-buffer.md) | Completed |
| 2 | [Verification and Docs](./phase-02-verification-and-docs.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1714-characters-stacked-page-scroll` (Plan E — `character-section.tsx` is the file being refined)

## Affected Files (summary)

- `components/characters/character-section.tsx` — add second `useScroll` + composite opacity
- `app/characters/page.tsx` — wrap newsletter in buffer container
- `docs/project-changelog.md` — entry

## Out of Scope

- Recoloring character tints (deferred — Plan H's fade-in alone should soften the hue jumps enough)
- Mobile gating changes (Plan E's mobile fallback unchanged)
- Plan A/D/E core architecture
