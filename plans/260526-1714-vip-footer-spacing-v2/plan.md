---
title: VIP Footer Spacing v2
description: >-
  Move newsletter decorative dogs UP and add more bottom padding so dog feet no
  longer overlap the footer. Trivial single-file change.
status: completed
priority: P3
branch: main
tags:
  - frontend
  - ui
  - layout
  - newsletter
  - spacing
blockedBy: []
blocks: []
created: '2026-05-26T10:15:57.720Z'
createdBy: 'ck:plan'
source: skill
---

# VIP Footer Spacing v2

## Overview

Trivial follow-up to Plan A's VIP spacing bump. Plan A increased the newsletter section bottom padding (`pb-16 md:pb-20` → `pb-28 md:pb-36`) but the decorative dogs at the card edge are still positioned at `-bottom-2 / -bottom-1` which means their feet hang below the section padding line and touch the footer.

**Two-part fix:**
1. Move dogs UP inside the section (`-bottom-2` → `bottom-8`)
2. Bump section padding further (`pb-28 md:pb-36` → `pb-32 md:pb-48`)

Combined effect: dogs sit clearly inside the card area; ~80–120px clearance to footer.

**Brainstorm report:** [plans/reports/brainstorm-260526-1714-styling-iteration-2.md](../reports/brainstorm-260526-1714-styling-iteration-2.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Dog Position and Padding Bump](./phase-01-dog-position-and-padding-bump.md) | Completed |
| 2 | [Verification and Docs](./phase-02-verification-and-docs.md) | Completed |

## Dependencies

- None. (Plan A and Plan F operate on the same file at different lines; if both ship simultaneously, conflict risk is low and merge-resolvable.)

## Affected Files (summary)

- `components/home/newsletter-cta.tsx` — dog positions + section padding
- `docs/project-changelog.md` — entry

## Out of Scope

- Other pages using NewsletterCTA (home/shop/top-picks/characters) — the change is uniform and intentional across all consumers
- Footer component itself
- Mobile dog visibility (still `lg:block` only)
