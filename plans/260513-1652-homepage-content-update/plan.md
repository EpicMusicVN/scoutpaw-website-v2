---
title: Homepage Content Update
description: >-
  Apply finalized brand copy across 7 home sections + footer, switch Pack Leader
  spotlight from Buddy to Max, decouple footer Explore from top-nav.
status: completed
priority: P2
branch: ''
tags:
  - content
  - homepage
  - footer
blockedBy: []
blocks: []
created: '2026-05-13T10:04:13.435Z'
createdBy: 'ck:plan'
source: skill
---

# Homepage Content Update

## Overview

Update homepage copy across hero, Step Into the Pack, Pack Leader, Shop, Watch, Newsletter, and footer sections per finalized brand spec. Touches `content/*.json` (data), `lib/content/schemas.ts` (schema), 5 home components, the footer, and `app/page.tsx` page wiring. Data-driven where possible (Max's bio + funFacts in `characters.json`), literal where decoupling required (section titles, kicker text). Top-nav unchanged.

**Source:** [Brainstorm Report](../reports/brainstorm-260513-1652-homepage-content-update.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Schema + Content Data](./phase-01-schema-content-data.md) | Completed |
| 2 | [Component Prop Additions](./phase-02-component-prop-additions.md) | Completed |
| 3 | [Component Literal Swaps](./phase-03-component-literal-swaps.md) | Completed |
| 4 | [Page Wiring](./phase-04-page-wiring.md) | Completed |
| 5 | [Typecheck + Lint](./phase-05-typecheck-lint.md) | Completed |

## Dependencies

None. Self-contained homepage content pass. Top-nav left untouched. Phase 4 depends on Phase 2 (new `subDescription` prop must exist before page passes it).

## Key Decisions (from brainstorm)

- **Pack Leader switch** Buddy → Max, data-driven (`characters.json` updated). Side effect: `/characters/max` page reflects new bio.
- **`footerExplore`** new field in `site-config.json`; top-nav `navItems` untouched.
- **Missing routes** Characters → `/#meet-the-pack` anchor; Top Picks → `/coming-soon/top-picks` stub.
- **`subDescription`** added only to `FeatureBanner` (shop section). Pack Leader reuses existing blockquote; Newsletter reuses existing `socialProof`.
- **X social** removed from JSON.
- **Subtitle for Pack Leader** literal in component (replaces `The {breed}` rendering), since the brand string isn't a breed.

## Success Criteria

- All copy strings render verbatim
- `pnpm typecheck` + `pnpm lint` clean
- Top-nav unchanged
- `/characters/max` renders w/o layout break
- `/coming-soon/top-picks` renders stub
- Footer Explore = exactly: Home, Characters, Shop, Watch, Top Picks, Activities
- 4 social icons render (yt, ig, fb, tt); X removed
