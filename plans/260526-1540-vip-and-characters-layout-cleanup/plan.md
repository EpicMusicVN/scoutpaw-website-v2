---
title: VIP Dogs Resize and Characters Page Dividers Removal
description: >-
  Shrink/reposition decorative dog images on the Become a VIP newsletter card so
  they stop overlapping content, and remove cloud dividers between sections on
  the characters page for a seamless flow.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - layout
  - newsletter
  - characters
blockedBy: []
blocks: []
created: '2026-05-26T08:41:29.433Z'
createdBy: 'ck:plan'
source: skill
---

# VIP Dogs Resize and Characters Page Dividers Removal

## Overview

Two small layout fixes on existing pages:

1. **Newsletter "Become a VIP" CTA** — decorative dog images at `w-72` overlap the card content at desktop widths. Shrink to `w-48`, push further outside the card, lower vertical position. Desktop-only behavior preserved.
2. **Characters page** — remove `<CloudDivider />` instances between every `<CharacterSection>` for a seamless tinted-block flow. Per-character `surfaceTint` color blocks become natural separators.

**Approach:** literal, KISS edits to two files. No new components, no schema changes, no dependency bumps.

**Brainstorm report:** [plans/reports/brainstorm-260526-1540-vip-and-characters-layout-cleanup.md](../reports/brainstorm-260526-1540-vip-and-characters-layout-cleanup.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Newsletter VIP Dogs Resize](./phase-01-newsletter-vip-dogs-resize.md) | Completed |
| 2 | [Characters Page Dividers Removal](./phase-02-characters-page-dividers-removal.md) | Completed |
| 3 | [Verification and Docs](./phase-03-verification-and-docs.md) | Completed |

## Dependencies

- None. The v8 characters plan (`260522-1544-characters-page-v8-merch-sections`) produced the `CharacterSection` this plan modifies, but that work is shipped — no blocking relationship.

## Affected Files

- `components/home/newsletter-cta.tsx` — dog Image sizes + positions (phase 1)
- `app/characters/page.tsx` — remove dividers, drop `Fragment` wrapper + `CloudDivider` import (phase 2)
- `docs/project-changelog.md` — append entry (phase 3)

## Out of Scope

- Removing `CloudDivider` component itself (still used on top-picks/shop/watch)
- Adding gradient blends between character sections (deferred unless live review shows harsh tint transitions)
- Corner paws / social-proof line tweaks
- Mobile/tablet dog visibility (stays hidden)
