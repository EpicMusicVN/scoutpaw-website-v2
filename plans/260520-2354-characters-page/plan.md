---
title: Characters Page
description: >-
  Build the /characters page — hero banner, quick-nav, and 5 alternating
  per-character showcase sections (Title/Subtitle/Description/Quote). Migrates
  the Character data model (add `quote`, drop `funFacts`), refreshes detail
  pages for consistency, and enables the Characters nav item.
status: completed
priority: P2
branch: main
tags:
  - characters
  - content
  - ui
  - page
blockedBy: []
blocks: []
created: '2026-05-20T17:02:25.208Z'
createdBy: 'ck:plan'
source: skill
---

# Characters Page

## Overview

New `/characters` page presenting all 5 ScoutPaw pups as alternating full-width
storytelling sections (large character image + Title / Subtitle / Description /
personality Quote). Playful-premium-warm, fully responsive, animated, accessible,
SEO-friendly. Takes the Bluey reference for *vibe* only — not its dense grid.

Authoritative design spec: `plans/reports/brainstorm-260520-2354-characters-page.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Data Model & Consumer Refresh](./phase-01-data-model-consumer-refresh.md) | Completed |
| 2 | [Characters Page Components](./phase-02-characters-page-components.md) | Completed |
| 3 | [Page Assembly & Navigation](./phase-03-page-assembly-navigation.md) | Completed |
| 4 | [Validation & Polish](./phase-04-validation-polish.md) | Completed |

Phases are sequential: P1 keeps the build green (schema + all consumers in one
pass), P2 builds new components, P3 assembles the page + wires nav, P4 validates.

## Key Decisions (from brainstorm, user-approved)

- **Single source of truth** — new copy lives in `content/characters.json`; detail
  pages & home reflect it. No hardcoded duplication.
- **Detail pages refreshed** — `/characters/[slug]` drops the stale `funFacts`
  list, shows the new personality quote.
- **Quick-nav + detail links** — top avatar jump-link row; each section links
  "Meet {Name} →" to its detail page.
- **Page order** — Max, Buddy, Bella, Oscar, Rocky (explicit, not JSON `order`).

## Dependencies

No cross-plan dependencies. The one pending plan
(`260518-0645-website-content-asset-refresh`) has its character-data work
completed; its remainder is deploy/CDN-only and orthogonal.

## Out of Scope

- New character image assets (reuse existing `characters/*` PNGs).
- JSON-LD structured data (metadata + semantic HTML only — YAGNI).
- Changing the home `character-showcase` layout.
