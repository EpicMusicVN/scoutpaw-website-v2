---
title: 'Characters Page v3: Stacked 100vh Scroll Scenes'
description: >-
  Rebuild /characters as stacked full-viewport sticky scenes with layered scroll
  choreography. Replaces Plan B's card model and removes Plan C's dividers from
  /characters. Mobile gets plain stacked sections — no sticky/transforms.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - characters
  - layout
  - motion
  - scroll
blockedBy:
  - 260526-1605-characters-cinematic-cards
  - 260526-1605-varied-cloud-dividers
blocks: []
created: '2026-05-26T10:15:55.996Z'
createdBy: 'ck:plan'
source: skill
---

# Characters Page v3: Stacked 100vh Scroll Scenes

## Overview

Major rebuild of `/characters`. Each character becomes a full-viewport (100vh) sticky scene; later scenes layer over earlier ones via z-index. As you scroll, the previous scene scales/fades slightly while the next slides up into view — like papers stacking. Mobile drops the sticky/transform choreography and shows plain stacked 100vh sections.

**Three phases:**
1. Rebuild `character-section.tsx` → `CharacterScene` (full-bleed scene, no card geometry)
2. Wire on `app/characters/page.tsx` with framer-motion scroll choreography; remove all dividers
3. Mobile gating (drop sticky on mobile) + verification + changelog

**Trade-off:** Retires Plan B's rounded card model and removes Plan C's dividers from `/characters` (Plan C component itself stays — used on top-picks/shop/watch). User confirmed.

**Brainstorm report:** [plans/reports/brainstorm-260526-1714-styling-iteration-2.md](../reports/brainstorm-260526-1714-styling-iteration-2.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [CharacterScene Component Rebuild](./phase-01-characterscene-component-rebuild.md) | Completed |
| 2 | [Page Wire and Motion Choreography](./phase-02-page-wire-and-motion-choreography.md) | Completed |
| 3 | [Mobile Gating and Verification](./phase-03-mobile-gating-and-verification.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1605-characters-cinematic-cards` (Plan B's `character-section.tsx` is the file being rebuilt)
- **Blocked by:** `260526-1605-varied-cloud-dividers` (Plan C added dividers on /characters; this plan removes them)

## Affected Files (summary)

- `components/characters/character-section.tsx` — wholesale rebuild (renamed concept: scene, not section)
- `app/characters/page.tsx` — restructure: remove dividers, add scene stack container
- `docs/project-changelog.md` — entry

## Out of Scope

- Typography body color (Plan D handles that)
- VIP spacing (Plan F)
- `CharacterAtmosphere` / `CharacterMotif` internals (kept as-is, just placed inside scene)
- Per-character detail page `/characters/[slug]` (separate component, not affected)
- Animation on Atmosphere/Motif (kept as-is)
