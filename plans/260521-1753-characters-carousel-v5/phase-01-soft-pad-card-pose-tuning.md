---
phase: 1
title: "Soft-Pad Card & Pose Tuning"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Soft-Pad Card & Pose Tuning

## Overview

Redesign the carousel card: de-box it into a soft themed gradient pad with
masked edges, make the pose ~2x the pad and dominant, and re-introduce a
morph-safe per-pose tuning map.

## Requirements

- Functional: card renders a soft edge-masked themed gradient pad (no border/
  shadow/hard rectangle); the pose is large (~2x the pad), straddles the pad
  top, stays within the slide column; whole card is a button; pose keeps
  `layoutId` for the detail morph.
- Non-functional: AA contrast for text on the pad; morph stays correct with tuning.

## Architecture

Card `<button>` (fills the slide / viewport height) layers:
- **Soft pad** — `div`, `theme.heroGradient` background + `CharacterMotif`,
  with a radial `maskImage` fading the edges to transparent → no border, no
  shadow, no hard rectangle. Lower zone of the card.
- **Pose** — `div.pose-tuning` (per-pose `transform` from the tuning map) wraps
  `motion.div` (`layoutId`) wraps `Image`. The tuning is on an **ancestor** of
  the `layoutId` element, so framer measures the real on-screen rect → morph
  stays correct. Pose ~2x the pad, occupies the upper zone, in-column.
- **Text** — breed + "Say hi to {name}" on the pad's denser lower-centre.

## Related Code Files

- Create: `components/characters/character-carousel-poses.ts` — per-slug `{scale,offsetY}` map + `getPoseTuning`.
- Modify: `components/characters/character-carousel-card.tsx` — soft pad, big pose, tuning ancestor wrapper.
- Read for context: `lib/content/character-themes.ts`, `components/characters/character-motif.tsx`, `components/characters/character-atmosphere.tsx` (mask-gradient reference).

## Implementation Steps

1. Create `character-carousel-poses.ts`:
   - `interface PoseTuning { scale: number; offsetY: number }` + `DEFAULT_TUNING`
     + `POSE_TUNING` (all 5 slugs, neutral start) + total `getPoseTuning(slug)`.
   - Doc-comment: values are tuned against the rendered page.
2. Rewrite `character-carousel-card.tsx`:
   - **Soft pad:** a `div` in the card's lower zone — `background: theme.heroGradient`,
     contains `CharacterMotif`; apply a radial `maskImage`
     (`radial-gradient(ellipse, black ~55%, transparent ~95%)`) so the pad fades
     into the page. No `border`, no `shadow`, no hard `rounded` rectangle.
   - **Pose:** ancestor `div` with `style={{ transform: translateY(offsetY%) scale(scale) }}`
     from `getPoseTuning(slug)`; inside it the `motion.div` (`layoutId`,
     `reduce`-gated) wrapping the `Image` (`object-contain`, `priority` when
     centered). Size the pose to ~2x the pad, occupying the upper zone,
     `inset-x` kept within the slide width (in-column).
   - **Text:** breed kicker + "Say hi to {name}" on the pad's lower-centre, ink text.
   - Keep the `onSelect` button + drag-guard contract unchanged.
3. Typecheck. (Visual tuning happens after the build renders.)

## Success Criteria

- [ ] `character-carousel-poses.ts` created — 5 slugs + fallback, typed total lookup.
- [ ] Card is a soft edge-masked themed pad — no border, no shadow, no hard rectangle.
- [ ] Pose is large (~2x the pad), dominant, straddles the pad top, in-column.
- [ ] Tuning transform is on an ancestor of the `layoutId` element (morph-safe).
- [ ] Ink text AA-legible on the pad; typecheck passes.

## Risk Assessment

- Pose consistency at 2x — tuning map handles it but needs real values from a
  browser pass; ship neutral.
- Radial mask vs text legibility — keep the lower-centre dense; tune mask stops
  once rendered.
- Tuning must NOT be a CSS transform on the `layoutId` element itself (the v4
  morph trap) — it goes on an ancestor `div`.
