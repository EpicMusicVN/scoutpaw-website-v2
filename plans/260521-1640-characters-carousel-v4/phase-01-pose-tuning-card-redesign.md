---
phase: 1
title: "Pose Tuning & Card Redesign"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Pose Tuning & Card Redesign

## Overview

Redesign the carousel card: full per-pup themed gradient background with the
pose straddling the card's top edge (~50% above), backed by a per-character
pose-tuning map so all 5 differently-framed PNGs read at a consistent size.

## Requirements

- Functional: card renders a `theme.heroGradient` background + motif + glow;
  pose sits ~50% inside / ~50% above the card; whole card stays a button with
  the `layoutId` pose for the detail morph.
- Non-functional: AA contrast (ink on the light gradient); all 5 pups visually
  consistent in apparent size + overlap.

## Architecture

New `character-carousel-poses.ts` exports a `Record<slug, { scale; offsetY }>`
map (+ a typed fallback) so each pose can be nudged to a common visual baseline.

`character-carousel-card.tsx` slide structure (the actual top-overflow is
realised in Phase 2 via viewport padding; here the card owns its internal layout):

```
card button (relative, themed gradient bg, overflow-visible)
├─ CharacterMotif + accent glow            (layered depth)
├─ pose (motion.div layoutId, absolute)    straddles the top edge
└─ text block (breed + "Say hi to {name}") lower zone, ink text
```

## Related Code Files

- Create: `components/characters/character-carousel-poses.ts` — per-slug `scale`/`offsetY` tuning map.
- Modify: `components/characters/character-carousel-card.tsx` — themed gradient bg, pose top-overflow, glow/motif/depth.
- Read for context: `lib/content/character-themes.ts`, `components/characters/character-motif.tsx`, `content/characters.json` (pose paths).

## Implementation Steps

1. Create `character-carousel-poses.ts`:
   - `interface PoseTuning { scale: number; offsetY: number }` (offsetY in %, +down).
   - `POSE_TUNING: Record<string, PoseTuning>` for the 5 slugs + a `DEFAULT_TUNING`.
   - `getPoseTuning(slug)` total/typed lookup. Start with `scale: 1, offsetY: 0`; tune by eye.
2. Rewrite `character-carousel-card.tsx`:
   - Card `<button>`: background `theme.heroGradient`; `border-ink/10`, `shadow-cozy-lg`;
     `overflow-visible` (the pose escapes the card top — clipping is the viewport's job, Phase 2).
   - `CharacterMotif` (per-personality shapes) + soft accent-color glow for layered depth.
   - Pose: `motion.div` with `layoutId={pup-art-${slug}}` (keep for the detail morph),
     absolutely positioned so ~50% is above the card top edge; apply `getPoseTuning(slug)`
     `scale` + `offsetY` so every pup lands consistently.
   - Text block in the card's lower zone: breed kicker + "Say hi to {name}", `text-ink`.
   - Keep the `onSelect` button behaviour + drag-guard contract unchanged.
3. Typecheck. (Visual verification happens in Phase 2 once the viewport padding exists.)

## Success Criteria

- [ ] `character-carousel-poses.ts` created with all 5 slugs + fallback.
- [ ] Card background fully themed (gradient + motif + glow) — no white/neutral.
- [ ] Pose straddles the card top edge ~50/50; `layoutId` preserved.
- [ ] Ink text AA-legible on the gradient.
- [ ] Typecheck passes.

## Risk Assessment

- Pose PNGs are framed inconsistently — the tuning map handles most of it; if a
  pup still looks off, note it for an art re-export rather than over-fitting CSS.
- `overflow-visible` on the card is intentional; the viewport (Phase 2) does the
  clipping — do not set `overflow-hidden` on the card.
