---
title: Characters Page Full-Screen Cinematic Scene
description: >-
  Iteration #6 of the Characters page: make the /characters immersive scene
  full-screen with a much richer code-built backdrop + foreground depth, larger
  characters, hover-only name reveal. Swap Buddy's pose to corgi2. Remove the
  "From the ScoutPaw Network" callout from detail pages and rebalance.
status: completed
priority: P2
branch: main
tags:
  - characters
  - ui
  - scene
  - immersive
blockedBy: []
blocks: []
created: '2026-05-20T19:36:38.736Z'
createdBy: 'ck:plan'
source: skill
---

# Characters Page Full-Screen Cinematic Scene

## Overview

Push the `/characters` immersive scene (built in iteration #5) further: a
**full-screen** cinematic stage, a much richer "premium animated universe"
backdrop (god-rays, bokeh, aurora, layered depth + foreground), **larger**
characters, and **hover/focus-only** name reveal (hidden on touch). Swap
Buddy's pose to `corgi2`. On detail pages, **remove** the "From the ScoutPaw
Network" callout and rebalance the layout.

Pure CSS/SVG, no client JS, no new code architecture. Authoritative design
spec: `plans/reports/brainstorm-260521-0236-characters-fullscreen-scene.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scene Backdrop and Foreground Enrichment](./phase-01-scene-backdrop-and-foreground-enrichment.md) | Completed |
| 2 | [Full-Screen Scene Composition](./phase-02-full-screen-scene-composition.md) | Completed |
| 3 | [Detail Page Callout Removal](./phase-03-detail-page-callout-removal.md) | Completed |
| 4 | [Validation and Docs](./phase-04-validation-and-docs.md) | Completed |

P1 enriches the backdrop + adds the foreground layer. P2 wires them into a
full-screen scene with larger characters + hover-only names (needs P1's
foreground component + the Buddy data swap). P3 is independent (detail pages).
P4 validates. P1 and P3 can run in parallel.

## Key Decisions (from brainstorm, user-approved)

- **Enrich CSS/SVG backdrop** — god-rays, bokeh orbs, aurora wash, layered
  depth + a new foreground layer. Server-only, zero client JS.
- **Full-screen scene** — `min-h-[100svh]`; desktop/tablet art-directed
  composition, mobile staggered scroll column.
- **Hover/focus-only names** — `opacity-0` default, reveal on hover/focus;
  hidden on touch (`aria-label` covers screen readers).
- **Buddy → corgi2** — reorder `poses` in `characters.json` (single source).
- **Remove the detail-page callout**, keep the title-area channel badge.

## Dependencies

No cross-plan dependencies. Supersedes parts of `260521-0150-characters-immersive-redesign`
(iteration #5, `completed`) — that plan is done; this iteration evolves its output.

## Out of Scope

- New character image assets beyond the existing `characters-position/*` poses.
- Client-side parallax / JS-driven motion (explicitly declined — perf).
- Home page or other-page changes.
- Copy / theme-palette changes.
