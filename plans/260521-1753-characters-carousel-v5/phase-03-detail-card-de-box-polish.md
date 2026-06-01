---
phase: 3
title: "Detail Card De-box & Polish"
status: completed
priority: P2
effort: "3h"
dependencies: [2]
---

# Phase 3: Detail Card De-box & Polish

## Overview

De-box the expanded detail card to match the carousel's integrated look, then
verify responsiveness, the morph, and reduced-motion, and sync docs.

## Requirements

- Functional: detail card loses border/shadow/hard rectangle and blends into the
  page; carousel⇄detail morph still smooth; responsive + reduced-motion clean.
- Non-functional: AA contrast on the de-boxed detail card; build/lint/typecheck green.

## Architecture

`character-detail-card.tsx` — drop `border` + `shadow-cozy-xl`; the `heroGradient`
panel gets a radial/edge `maskImage` so it melts into the page (same technique as
the carousel pad). `CharacterAtmosphere` + motif + the staggered content stay.
Section is already `min-h-[100svh]` (Phase 2) — detail mode fills it too.

## Related Code Files

- Modify: `components/characters/character-detail-card.tsx` — de-box (drop border/shadow, edge-mask gradient).
- Modify (if needed): `components/characters/character-carousel-card.tsx`, `character-carousel-track.tsx`, `character-carousel-poses.ts` — polish/tuning.
- Modify: `docs/codebase-overview.md`, `docs/project-changelog.md`.

## Implementation Steps

1. `character-detail-card.tsx`:
   - Remove `border` + `shadow-cozy-xl`; apply an edge `maskImage` to the
     `heroGradient` panel so it fades into the page (no hard rectangle).
   - Keep `CharacterAtmosphere`, `CharacterMotif`, decor, staggered story copy,
     close + prev/next, the `layoutId` pose.
   - Verify text contrast holds on the now-faded gradient (atmosphere wash + ink).
2. Polish pass — desktop (4 cards) / tablet / mobile: pose sizing, pad mask,
   100svh composition, arrows, touch targets.
3. Verify the click→detail `layoutId` morph from the tuned pose box — opens from
   a centered card cleanly; close + prev/next work; reduced-motion → crossfade.
4. Image loading — `priority` only on the initially-centered pose; `sizes` right
   for the new card width; no CLS.
5. `pnpm typecheck` + `pnpm lint` + `pnpm build` — green; `/characters` static;
   `/characters/[slug]` intact.
6. Sync docs: `codebase-overview.md` (carousel now 4-up, 100svh, soft-pad cards,
   de-boxed detail, `character-carousel-poses.ts`) + dated `project-changelog.md` entry.

## Success Criteria

- [ ] Detail card de-boxed — no border/shadow/hard rectangle; blends into page.
- [ ] Carousel⇄detail morph smooth; close + prev/next + reduced-motion verified.
- [ ] Carousel polished at desktop / tablet / mobile.
- [ ] build / lint / typecheck green; `/characters` static; `[slug]` untouched.
- [ ] `codebase-overview.md` + `project-changelog.md` updated.

## Risk Assessment

- De-boxed detail card — content contrast on a faded gradient; keep the
  atmosphere wash + ink text, verify AA.
- The morph, pad mask params and per-pose tuning all still want a real-browser
  pass — flag for the user; the build is set up to make them tunable.
