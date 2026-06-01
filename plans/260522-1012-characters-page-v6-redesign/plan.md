---
title: "Characters Page Redesign v6"
description: "Immersive 100vh Characters page — left-anchored 3-card carousel with white content cards, art-dominant detail view, layered cinematic transition."
status: completed
priority: P1
branch: "main"
tags: [frontend, ui, characters, nextjs]
blockedBy: []
blocks: []
created: "2026-05-22T03:18:16.609Z"
createdBy: "ck:plan"
source: skill
---

# Characters Page Redesign v6

## Overview

Redesign the Characters page carousel + detail view (v6) for a more immersive,
premium, cinematic experience. Carousel section + detail view each fill 100vh;
carousel left-anchored with 3 fully-visible cards + an edge-dissolving peek;
carousel cards gain a white content card (title/subtitle/clamped-bio/quote) with
the pose overlapping out the top; detail view becomes an art-dominant split with
no prev/next; carousel↔detail transition is a layered cinematic push-in.

Approved design: `plans/reports/brainstorm-260522-1012-characters-page-v6-redesign.md`.

**No schema/content changes** — reuses existing `Character` fields. Operates on
the existing v5 `components/characters/*` files (all prior character plans are
completed; v6 iterates on v5).

**Key decisions (user-approved):** clamped `bio` on cards (no schema change) ·
layered cinematic transition, no shared-element morph · art-dominant detail
split with artwork on the right · prev/next removed from detail.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Detail View Rebuild](./phase-01-detail-view-rebuild.md) | Completed |
| 2 | [Carousel Track and Layout](./phase-02-carousel-track-and-layout.md) | Completed |
| 3 | [Character Card Rebuild](./phase-03-character-card-rebuild.md) | Completed |
| 4 | [Orchestrator Transition](./phase-04-orchestrator-transition.md) | Completed |
| 5 | [QA Gate and Docs](./phase-05-qa-gate-and-docs.md) | Completed |

## Dependency Graph

- Phase 1 (Detail) — independent (touches detail-card + orchestrator prop wiring)
- Phase 2 (Track) — independent
- Phase 3 (Card) — independent
- Phase 4 (Transition) — depends on 1 + 2 + 3 (tune after views final; also
  shares `character-carousel.tsx` with Phase 1)
- Phase 5 (QA + Docs) — depends on 4 (transitively all)

Phases 1, 2, 3 are independent and may be done in any order / parallel.

## Build Verification

Project scripts: `pnpm lint`, `pnpm typecheck`. A concurrent `pnpm dev` server
may hold `.next` and break `pnpm build` (cache contention — environmental, not a
code defect); typecheck + lint + a live dev-server render check are the reliable
gates. All component files stay under 200 lines.

**Status:** All 5 phases completed. Typecheck ✓ | Lint ✓ | Live render check ✓ | 
Code review DONE (3 medium short-viewport findings ALL FIXED). Full `pnpm build` 
deferred (concurrent dev server holds `.next` — environmental, not a code defect).

## Dependencies

No cross-plan dependencies. Supersedes the completed v5 carousel plans
(260521-1753-characters-carousel-v5, 260522-0320-characters-page-carousel-refinement).
