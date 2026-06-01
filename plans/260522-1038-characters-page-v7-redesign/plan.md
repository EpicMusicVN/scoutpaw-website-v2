---
title: "Characters Page v7 Redesign"
description: "Max-anchored carousel, dominant-character cards on small solid-color nameplates, premium floating detail card."
status: completed
priority: P1
branch: "main"
tags: [frontend, ui, characters, nextjs]
blockedBy: []
blocks: []
created: "2026-05-22T03:48:33.326Z"
createdBy: "ck:plan"
source: skill
---

# Characters Page v7 Redesign

## Overview

Refine the just-shipped v6 Characters page: pin Max as the carousel anchor
(loop off); rebuild carousel cards so the character pose dominates and stands on
a small solid signature-color nameplate showing only name + tagline; rework the
detail view from de-boxed into a premium floating card over a themed wash.

Approved design: `plans/reports/brainstorm-260522-1038-characters-carousel-v7-redesign.md`.

**No schema/content changes.** Operates on the v6 `components/characters/*`
files. v7 reverses some v6 choices (white→colored cards, de-boxed→floating
detail) — intended, per the approved design.

**Key decisions (user-approved):** Embla `loop:false` (Max always anchored) ·
solid `accentColor` card fill · auto-contrast text (luminance) · detail =
floating card over a themed wash + drifting decor · artwork overflows the detail
card frame.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Carousel Track Loop and Arrows](./phase-01-carousel-track-loop-and-arrows.md) | Completed |
| 2 | [Carousel Card Rebuild](./phase-02-carousel-card-rebuild.md) | Completed |
| 3 | [Detail Floating Card](./phase-03-detail-floating-card.md) | Completed |
| 4 | [Cleanup and QA Gate](./phase-04-cleanup-and-qa-gate.md) | Completed |

## Dependency Graph

- Phase 1 (Track) — independent
- Phase 2 (Card) — independent
- Phase 3 (Detail) — independent
- Phase 4 (Cleanup + QA) — depends on 1 + 2 + 3 (the `compact`-prop removal
  needs Phase 2's card done; QA needs everything)

Phases 1, 2, 3 touch disjoint files and may be done in any order / parallel.

## Build Verification

`pnpm typecheck` + `pnpm lint` + a live dev-server render check
(`curl localhost:3000/characters` → HTTP 200) are the gate. A concurrent
`pnpm dev` server holds `.next`, so `pnpm build` fails on cache contention —
environmental, not a code defect (recurring in this project). All component
files stay under 200 lines.

## Dependencies

No cross-plan dependencies. Iterates on the completed v6 plan
(260522-1012-characters-page-v6-redesign).
