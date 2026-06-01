---
title: "Characters Page v8 Merch Sections"
description: "Replace the v7 carousel/detail with a vertical scroll of themed per-character sections that blend character intro + related merchandise."
status: pending
priority: P1
branch: "main"
tags: [frontend, ui, characters, commerce, nextjs]
blockedBy: []
blocks: []
created: "2026-05-22T08:50:21.679Z"
createdBy: "ck:plan"
source: skill
---

# Characters Page v8 Merch Sections

## Overview

Redesign `/characters` from the v7 carousel/detail model into a scroll-through
of 5 themed per-character sections. Each section blends character intro
(visual + name + description) with related merchandise (2 products + purchase
CTA) so merch feels naturally part of each character's world. Adds a
character↔merchandise data link.

Approved design: `plans/reports/brainstorm-260522-1544-characters-page-v8-merch-sections.md`.

**Key decisions (user-approved):** vertical per-character sections (replaces the
v7 carousel/detail) · merch data embedded in `characters.json` · 2 products per
character · each section links to the existing `/characters/[slug]` story page.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Data Layer](./phase-01-data-layer.md) | Pending |
| 2 | [Section Components](./phase-02-section-components.md) | Pending |
| 3 | [Page Rewrite and Carousel Removal](./phase-03-page-rewrite-and-carousel-removal.md) | Pending |
| 4 | [QA Gate and Docs](./phase-04-qa-gate-and-docs.md) | Pending |

## Dependency Graph

- Phase 1 (Data) — independent
- Phase 2 (Components) — depends on 1 (components consume the new `products`
  schema/type)
- Phase 3 (Page + Carousel removal) — depends on 2 (page imports `CharacterSection`)
- Phase 4 (QA + Docs) — depends on 3

Sequential: 1 → 2 → 3 → 4.

## Build Verification

`pnpm typecheck` + `pnpm lint` + a live dev-server render check
(`curl localhost:3000/characters` → HTTP 200) are the gate. A concurrent
`pnpm dev` server holds `.next`, so `pnpm build` fails on cache contention —
environmental, not a code defect (recurring in this project). All component
files stay under 200 lines.

## Dependencies

No cross-plan dependencies. Supersedes the completed v5-v7 carousel plans
(latest: 260522-1038-characters-page-v7-redesign).
