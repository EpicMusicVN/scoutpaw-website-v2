---
phase: 2
title: "Carousel Coverflow"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Carousel Coverflow

## Overview

Build the Focal-Coverflow carousel: Embla track with per-slide scale/opacity,
branded prev/next arrows bottom-right, shared cinematic sky backdrop. Carousel
mode only — clicking a card is wired in Phase 3.

## Requirements

- Functional: horizontal carousel of 5 pups; center card large + focal,
  neighbours dimmed + scaled; loop; drag/swipe; arrows scroll prev/next.
- Non-functional: GPU-only transforms (no CLS); fixed viewport height; smooth.

## Architecture

```
CharacterCarousel (client)
└─ carousel mode
   ├─ character-scene-backdrop        (reused — shared sky behind all)
   ├─ character-carousel-track        (Embla viewport + coverflow scaling)
   │  └─ character-carousel-card ×5   (accent-gradient panel, pose, title)
   └─ character-carousel-arrows       (custom prev/next, bottom-right)
```

**Coverflow scaling:** init Embla (`loop:true`, `align:"center"`,
`containScroll:false`); on `scroll`/`reInit` events compute each slide's
distance from the centered scroll position → set `scale` (center `1`,
neighbours `~0.82`) and `opacity` (`~0.55`) via inline `transform`/`opacity`.
Use a tween factor for smoothness. Apply only `transform` + `opacity`.

## Related Code Files

- Create: `components/characters/character-carousel-track.tsx` — Embla viewport, container, coverflow scaling, `selectedIndex` state.
- Create: `components/characters/character-carousel-card.tsx` — one focal card.
- Create: `components/characters/character-carousel-arrows.tsx` — branded prev/next buttons.
- Modify: `components/characters/character-carousel.tsx` — render backdrop + track + arrows.
- Read for context: `components/characters/character-scene-backdrop.tsx`,
  `components/characters/character-scene-decor.tsx`, `lib/content/character-themes.ts`,
  `lib/theme/tokens.ts`, `app/globals.css` (keyframes, shadows).

## Implementation Steps

1. `character-carousel-card.tsx`:
   - Props `{ character: Character; isActive: boolean; onSelect: () => void }`.
   - Rounded card; background = soft gradient derived from `accentColor` (or theme `heroGradient`).
   - `next/image` pose cutout (`character.poses[0]`), large, with accent glow.
   - "Say hi to {name}" title (derive from `name`), `font-display`.
   - Light decor: a couple of `character-scene-decor` primitives (note/sparkle).
   - Root is a `<button aria-label={\`Open \${name}'s profile\`}>` calling `onSelect`.
   - Add `layoutId={\`pup-\${slug}\`}` on the artwork wrapper (consumed in Phase 3).
2. `character-carousel-track.tsx`:
   - `"use client"`; `useEmblaCarousel({ loop:true, align:"center", containScroll:false })`.
   - Render Embla viewport/container; map characters → `character-carousel-card`.
   - Coverflow: `onScroll` handler reads `emblaApi.scrollProgress()` +
     `emblaApi.scrollSnapList()`, computes per-slide diff, sets `scale`/`opacity`.
     Re-run on `reInit`. Clamp + tween factor.
   - Track `selectedIndex` via `select` event; expose `scrollPrev/scrollNext` + `scrollTo` to parent (ref or callback props).
3. `character-carousel-arrows.tsx`:
   - Two `<button>`s, rounded, accent-tinted, `shadow-cozy`; `aria-label` "Previous/Next character".
   - Positioned bottom-right of the carousel section.
   - Optional: subtle dot indicators row (one dot per pup, active state).
4. Wire into `character-carousel.tsx`: render `character-scene-backdrop`, the
   track, and arrows. Section has a fixed responsive height (no CLS).
5. Respect `prefers-reduced-motion`: when set, skip coverflow tween (static scale),
   disable decor motion (global CSS already resets keyframes).
6. Typecheck + build + manual smoke test (drag, arrows, loop).

## Success Criteria

- [ ] Carousel renders 5 pups; center focal, neighbours dimmed/scaled.
- [ ] Drag/swipe + arrow buttons scroll smoothly with loop.
- [ ] No layout shift; transforms are GPU-only; fixed viewport height.
- [ ] Arrows keyboard-focusable with `aria-label`s.
- [ ] Reduced-motion: static scale, no decor animation.

## Risk Assessment

- Embla scroll-progress math near loop boundary can jump — use
  `slidesInView` / clamp diff, test the wrap point.
- Card files must stay <200 LOC — keep decor minimal, lift shared bits if needed.
