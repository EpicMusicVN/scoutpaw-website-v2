---
phase: 3
title: "Cards & Navigation"
status: completed
priority: P1
effort: "3h"
dependencies: [2]
---

# Phase 3: Cards & Navigation

## Overview

Restyle the carousel cards to a uniform calm treatment and strip the navigation
down to left/right arrows only (no pagination dots).

## Requirements

- Functional: cards share one neutral surface; per-pup identity via accent
  touches only. Carousel nav = two `ArrowButton`s, no dots.
- Non-functional: AA contrast (ink on light surface); arrows on-brand (soft white).

## Architecture

`character-carousel-card.tsx` drops `theme.heroGradient` as the card background —
becomes a uniform white `surface` card. Per-pup identity = soft accent-color glow
+ faint motif + (optional) small accent touch. The bold gradient stays exclusive
to `character-detail-card.tsx` (the open-state payoff).

`character-carousel-arrows.tsx` loses `CarouselControls` (dots + arrows) — keeps
only `ArrowButton`. The track renders two `ArrowButton`s bottom-right directly.

## Related Code Files

- Modify: `components/characters/character-carousel-card.tsx` — uniform calm card.
- Modify: `components/characters/character-carousel-arrows.tsx` — remove `CarouselControls`/dots; keep `ArrowButton`.
- Modify: `components/characters/character-carousel-track.tsx` — render two `ArrowButton`s; remove `selectedIndex` state + `select` subscription + dot wiring.
- Read for context: `components/characters/character-detail-card.tsx` (already renders `ArrowButton`s — keep the pattern consistent).

## Implementation Steps

1. **Uniform calm card** (`character-carousel-card.tsx`):
   - Card background → `bg-surface` (white) with `border-ink/10` + `shadow-cozy-lg`.
   - Keep the soft accent-color glow behind the pose (`accentColor`).
   - Keep a faint per-pup `CharacterMotif` (low opacity) for subtle identity.
   - Text stays ink (`text-ink` / `text-ink/65`) — AA holds on white.
   - Keep the `layoutId` artwork wrapper unchanged (morph target).
2. **Remove dots** (`character-carousel-arrows.tsx`):
   - Delete `CarouselControls` and the dots markup; export only `ArrowButton`.
3. **Track nav** (`character-carousel-track.tsx`):
   - Replace `<CarouselControls .../>` with a bottom-right flex row of two
     `ArrowButton`s (`prev`/`next` → `emblaApi.scrollPrev/scrollNext`).
   - Remove `selectedIndex` state, the `onSelectSnap` `select` subscription, and
     the `names`/`onSelectDot` wiring (only the dots used them).
4. Confirm `character-detail-card.tsx` still imports `ArrowButton` correctly.
5. Run `pnpm typecheck` + `pnpm lint` + `pnpm build`.

## Success Criteria

- [ ] All carousel cards share one uniform calm surface; no per-pup gradient on cards.
- [ ] Per-pup identity still readable (glow + motif + pose).
- [ ] Detail card retains its themed gradient (unchanged).
- [ ] Navigation = arrows only; no dots anywhere.
- [ ] AA contrast holds; typecheck + lint + build pass.

## Risk Assessment

- Removing `selectedIndex` must not break the coverflow tween (tween uses Embla
  scroll progress, not React state) — verify scrolling still scales correctly.
- Calm cards reduce per-pup colour in the browse state — accepted trade for a
  cleaner 3-up and a stronger detail-open reveal.
