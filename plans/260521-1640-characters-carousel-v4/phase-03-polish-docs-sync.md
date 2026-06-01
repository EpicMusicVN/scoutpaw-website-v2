---
phase: 3
title: "Polish & Docs Sync"
status: completed
priority: P2
effort: "2h"
dependencies: [2]
---

# Phase 3: Polish & Docs Sync

## Overview

Verify responsiveness, the detail-open morph from the new straddling pose, and
reduced-motion; then sync docs.

## Requirements

- Functional: carousel works across breakpoints; click→detail morph still smooth
  from the overflowing pose; reduced-motion degrades cleanly.
- Non-functional: build/lint/typecheck green; docs accurate.

## Architecture

The pose now carries `layoutId` while straddling the card top — the morph source
box is the pose box. Verify the morph into the detail card still lands cleanly.
Detail card itself is unchanged.

## Related Code Files

- Modify (if tuning needed): `character-carousel-card.tsx`, `character-carousel-track.tsx`, `character-carousel-poses.ts`.
- Modify: `docs/codebase-overview.md`, `docs/project-changelog.md`.
- Read for context: `components/characters/character-detail-card.tsx`.

## Implementation Steps

1. Responsive pass — desktop (3 cards) / tablet (2) / mobile (1): pose overflow,
   card sizing, fade all clean; arrows reachable; touch targets ok.
2. Verify the click→detail `layoutId` morph from the straddling pose — opens from
   a centered card, no jump; close reverses; prev/next flip still works.
3. Reduced-motion: opacity fade static-safe, morph → crossfade, no scale jumps.
4. Image loading: `priority` only on the initially-centered pose; `sizes` correct
   for the new card width; no CLS.
5. `pnpm typecheck` + `pnpm lint` + `pnpm build` — all green; `/characters` static;
   `/characters/[slug]` intact.
6. Sync docs: `codebase-overview.md` (card now themed + pose-overflow; coverflow
   hook renamed to `use-carousel-fade`; new `character-carousel-poses.ts`) and a
   dated `project-changelog.md` entry.

## Success Criteria

- [ ] Carousel clean at desktop / tablet / mobile.
- [ ] Detail-open morph smooth from the overflowing pose; close + flip work.
- [ ] Reduced-motion path verified.
- [ ] build / lint / typecheck green; `/characters` static; `[slug]` untouched.
- [ ] `codebase-overview.md` + `project-changelog.md` updated.

## Risk Assessment

- The morph origin is now a box that extends above the card — if it looks off,
  the `layoutId` element can be scoped to a tighter sub-box; verify in a browser.
- Per-pup pose tuning may need a final eyeball pass once everything renders.
