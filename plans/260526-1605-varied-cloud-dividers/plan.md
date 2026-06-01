---
title: Varied Cloud Dividers
description: >-
  Re-introduce cloud dividers between character cards on /characters with 4
  distinct shape variants (no animation per user choice). Shape variety alone
  provides the magical/playful feel.
status: completed
priority: P3
branch: main
tags:
  - frontend
  - ui
  - characters
  - decoration
  - svg
blockedBy:
  - 260526-1605-characters-cinematic-cards
blocks: []
created: '2026-05-26T09:10:56.975Z'
createdBy: 'ck:plan'
source: skill
---

# Varied Cloud Dividers

## Overview

Plan C of the website styling overhaul. Depends on Plan B's gap-between-cards structure.

**Goals:**
- Extend `components/ui/cloud-divider.tsx` with a `variant` prop (`"trio" | "duo-big" | "scatter" | "stack"`)
- Each variant uses a different cloud composition (puff count, sizing, vertical offset)
- Subtle white-to-soft-cyan gradient fills (volume, not flat white) via inline `<linearGradient>` with `useId()`-stable IDs
- Re-wire dividers on `app/characters/page.tsx` between character cards (cycling through variants by index)
- No animation — variety alone reads as playful and magical

**Brainstorm report:** [plans/reports/brainstorm-260526-1605-website-styling-overhaul.md](../reports/brainstorm-260526-1605-website-styling-overhaul.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Variant System and Component Extension](./phase-01-variant-system-and-component-extension.md) | Completed |
| 2 | [Wire Dividers Between Character Cards](./phase-02-wire-dividers-between-character-cards.md) | Completed |
| 3 | [Verification and Docs](./phase-03-verification-and-docs.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1605-characters-cinematic-cards` (Plan B creates the gaps these dividers will fill)

## Affected Files (summary)

- `components/ui/cloud-divider.tsx` — extend with variants + gradient fill
- `app/characters/page.tsx` — re-add dividers between cards with variant cycling
- `docs/project-changelog.md` — entry

## Out of Scope

- Animation (drift, sparkle, etc.) — explicitly declined by user
- Cross-page divider redesign (top-picks, shop, watch still use single variant — defer to follow-up if needed)
- New brand SVGs or paw-print decoratives
