---
title: Cinematic Character Cards
description: >-
  Rebuild /characters per-character sections as large standalone rounded cards
  on the cyan canvas. Cinematic, premium, visually dominant. Each card houses
  its own tinted background, art composition, content, and merch.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - characters
  - layout
  - premium
blockedBy:
  - 260526-1605-typography-system-and-vip-spacing
blocks:
  - 260526-1605-varied-cloud-dividers
created: '2026-05-26T09:10:55.370Z'
createdBy: 'ck:plan'
source: skill
---

# Cinematic Character Cards

## Overview

Plan B of the website styling overhaul. Depends on Plan A's heading typography (uses `heading-gradient-cool` / `text-navy` on character name h2).

**Model Y — standalone cards on canvas:**
- Each `CharacterSection` becomes a large rounded card on the cyan body background
- Card holds the per-character `surfaceTint` *inside* it (was full-width tinted section before)
- `min-h-[80vh]` desktop for cinematic vertical presence; `min-h-auto` mobile (content-sized)
- Character pose may overflow card edge (top or side) for layered depth
- Generous gap between cards on cyan canvas — Plan C's varied dividers slot into these gaps

**Brainstorm report:** [plans/reports/brainstorm-260526-1605-website-styling-overhaul.md](../reports/brainstorm-260526-1605-website-styling-overhaul.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Card Component Rebuild](./phase-01-card-component-rebuild.md) | Completed |
| 2 | [Page Layout and Mobile Treatment](./phase-02-page-layout-and-mobile-treatment.md) | Completed |
| 3 | [Verification and Docs](./phase-03-verification-and-docs.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1605-typography-system-and-vip-spacing` (Plan A — character name h2 uses new heading style)
- **Blocks:** `260526-1605-varied-cloud-dividers` (Plan C inserts dividers in the gaps between cards Plan B creates)

## Affected Files (summary)

- `components/characters/character-section.tsx` — substantial rebuild (component → card)
- `app/characters/page.tsx` — minor layout tweak (gap between cards, no dividers in this plan)
- `components/characters/character-atmosphere.tsx`, `character-motif.tsx` — confirm clip inside card overflow rules
- `docs/project-changelog.md` — entry

## Out of Scope

- Dividers between cards (Plan C)
- Per-character detail page changes (`/characters/[slug]`) — separate concern
- Atmosphere/motif redesign (kept as-is; just clipped to card)
- Header hero changes (already handled by Plan A)
