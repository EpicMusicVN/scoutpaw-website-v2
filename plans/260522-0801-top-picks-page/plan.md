---
title: "Top Picks Page"
description: "New /top-picks page — reused hero, category chips, accordion Deal Block, curated offer cards via a JSON content layer."
status: completed
priority: P1
branch: "main"
tags: [frontend, content-layer, nextjs]
blockedBy: []
blocks: []
created: "2026-05-22T01:05:47.493Z"
createdBy: "ck:plan"
source: skill
---

# Top Picks Page

## Overview

Build the `/top-picks` page for ScoutPaw TV. Showcases curated favourites:
cinematic hero (reused `FullBleedHero`), always-visible category chips, a
clickable "Deal Block" featured spotlight that accordion-expands a filterable
offer-card grid. New curated-JSON content type wired through the existing
content-adapter pattern. Design-system consistent, responsive, accessible.

Approved design: `plans/reports/brainstorm-260522-0801-top-picks-page-design.md`.

**Key decisions (user-approved):** reuse `FullBleedHero` as-is · inline accordion
(CSS `grid-rows`, no Framer) · reuse existing image assets as placeholders ·
standalone curated `content/top-picks.json` · ~10 seed picks (2 per category).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Content Layer](./phase-01-content-layer.md) | Completed |
| 2 | [Shared FilterChip Extraction](./phase-02-shared-filterchip-extraction.md) | Completed |
| 3 | [Top Picks Components and Page](./phase-03-top-picks-components-and-page.md) | Completed |
| 4 | [Nav Wiring and Cleanup](./phase-04-nav-wiring-and-cleanup.md) | Completed |
| 5 | [Docs and QA Gate](./phase-05-docs-and-qa-gate.md) | Completed |

## Dependency Graph

- Phase 1 (Content Layer) — independent
- Phase 2 (FilterChip) — independent (can run parallel to Phase 1)
- Phase 3 (Components + Page) — depends on Phase 1 + Phase 2
- Phase 4 (Nav Wiring) — depends on Phase 3 (route must exist before nav links to it)
- Phase 5 (Docs + QA) — depends on Phase 3 + Phase 4

## Build Verification

Project scripts: `pnpm lint`, `pnpm typecheck`, `pnpm build`. Run after each
code-touching phase; full set is the BLOCKING gate in Phase 5.

## Dependencies

No cross-plan dependencies. Phase 1 appends to `lib/content/schemas.ts`
(shared with character work) — additive only, no conflict.
