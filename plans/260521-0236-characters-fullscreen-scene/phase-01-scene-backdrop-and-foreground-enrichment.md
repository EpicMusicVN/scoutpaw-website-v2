---
phase: 1
title: Scene Backdrop and Foreground Enrichment
status: completed
priority: P1
effort: 4h
dependencies: []
---

# Phase 1: Scene Backdrop and Foreground Enrichment

## Overview

Make the `/characters` scene backdrop feel like a "premium animated universe":
enrich `character-scene-backdrop.tsx` with depth + lighting layers, and add a
new `character-scene-foreground.tsx` decorative layer that sits in front of the
characters for true depth.

## Requirements

- Functional: backdrop gains god-rays, bokeh orbs, aurora wash + layered depth;
  a foreground layer renders in front of the figures without blocking clicks.
- Non-functional: pure CSS/SVG, no client JS; all layers `aria-hidden` +
  `pointer-events-none`; animations compositor-friendly (transform/opacity);
  reduced-motion safe via the global reset; modest count of blurred+animated
  elements (blur+animation is GPU-costly).

## Architecture

Current `character-scene-backdrop.tsx` layers: sky gradient, sun glow, stars,
sparkles, clouds, music notes, meadow hills. Add:

- **God-ray light beams** — soft diagonal SVG gradient streaks from the sun
  area, very low opacity, optional slow drift.
- **Glowing bokeh orbs** — blurred soft circles, varied size/opacity/blur for
  depth; gentle float (reuse `figure-float` / `dust-float` keyframes).
- **Aurora wash** — a large soft-colored radial/linear blob behind the clouds,
  subtle hue/position drift.
- **Layered depth hills** — add a third, further-back hill behind the existing
  two for parallax-style depth.

New `character-scene-foreground.tsx`:
- A bottom-anchored foreground silhouette (grass tufts / foliage / a couple of
  large close bokeh orbs), darker/more saturated than the backdrop meadow so it
  reads as "near" the viewer.
- `aria-hidden`, `pointer-events-none` — clicks pass through to the figures
  behind it. Rendered by `CharacterScene` AFTER the figures (higher z).

Keep both files focused; backdrop stays < 200 lines (extract scatter-data
arrays / small SVG primitives as already done).

## Related Code Files

- Modify: `components/characters/character-scene-backdrop.tsx`
- Create: `components/characters/character-scene-foreground.tsx`
- Modify: `app/globals.css` (only if a new keyframe is genuinely needed)

## Implementation Steps

1. **Backdrop — god-rays:** add an SVG/gradient beam group fanning from the sun
   glow; low opacity (~0.1–0.18); `aria-hidden`.
2. **Backdrop — bokeh orbs:** add a data array of blurred circles (size, blur,
   opacity, position, float duration/delay); render as blurred `<div>`s with a
   gentle float. Keep count modest (~5–7 total).
3. **Backdrop — aurora wash:** add one large soft-colored blurred blob behind
   the clouds with a slow drift.
4. **Backdrop — depth hill:** add a third hill `<path>` further back (lighter,
   higher) for layered parallax-style depth.
5. **Create `character-scene-foreground.tsx`:** bottom foreground silhouette +
   1–2 close bokeh orbs; `aria-hidden`, `pointer-events-none`, `absolute`.
6. Add globals.css keyframes only if existing ones (`figure-float`,
   `cloud-drift`, `paw-drift`, `dust-float`, `twinkle`) don't cover the need.
7. `npx tsc --noEmit` — confirm clean (foreground not yet wired in; that is P2).

## Success Criteria

- [x] Backdrop visibly richer — god-rays, bokeh, aurora, 3 depth hills present.
- [x] `character-scene-foreground.tsx` created — `aria-hidden`,
      `pointer-events-none`, bottom-anchored.
- [x] All new decor is decorative-only; no client JS; `tsc` clean.
- [x] Blurred+animated element count kept modest.

## Risk Assessment

- **GPU cost** — many large `blur` + `animation` layers can jank low-end
  devices. Cap blurred-animated count; prefer transform/opacity; test scroll.
- **Contrast** — extra layers must not wash out the scene `<h1>` / characters;
  keep new layers low-opacity and away from the heading band.
- **File size** — backdrop must stay < 200 lines; keep extracting data arrays.
