---
phase: 4
title: Hero Cyan Pivot + Strong Card
status: completed
priority: P1
effort: 25m
dependencies: []
---

# Phase 4: Hero Cyan Pivot + Strong Card

## Overview

5th hero revision. Drop yellow zone entirely; both sides fade to cyan page bg. Text legibility carried by a strengthened opaque card (`bg-white/85 + border + backdrop-blur-md`). Mobile glass card retints from yellow → white.

**Convergence note:** If this still doesn't land, the next conversation should be about banner artwork choice, not gradient stacking. This iteration simplifies (drops a color layer rather than adds).

## Requirements

- Functional:
  - Left side fade: yellow → cyan (`from-paper to-transparent`)
  - Right side fade: cyan (already in place)
  - Desktop text card: `bg-white/85 + border-ink/10 + backdrop-blur-md + shadow-cozy`
  - Mobile card: white tint instead of yellow
- Non-functional:
  - Text contrast ≥10:1 against white-85 card
  - No layout shift
  - typecheck + lint clean

## Architecture

`components/home/full-bleed-hero.tsx`. Replace yellow gradient overlays. Bump card opacity + add border.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Replace left yellow zone overlay:
   ```tsx
   // Before
   <div className="... w-2/5 bg-gradient-to-r from-[#ffd70c] via-[#ffd70c]/85 to-transparent md:block" />
   // After
   <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-paper via-paper/70 to-transparent md:block" />
   ```
2. Right side already cyan from prior cook — verify unchanged.
3. Strengthen desktop card:
   ```tsx
   // Before
   <div className="max-w-md rounded-2xl bg-white/55 px-6 py-5 shadow-cozy backdrop-blur-sm lg:max-w-lg lg:px-8 lg:py-7">
   // After
   <div className="max-w-md rounded-2xl border border-ink/10 bg-white/85 px-6 py-5 shadow-cozy backdrop-blur-md lg:max-w-lg lg:px-8 lg:py-7">
   ```
4. Retint mobile card:
   ```tsx
   // Before
   <div className="relative mx-4 -mt-8 max-w-md rounded-3xl border border-white/40 bg-[rgb(255_215_12/0.9)] p-6 shadow-cozy-xl backdrop-blur-xl md:hidden">
   // After
   <div className="relative mx-4 -mt-8 max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-cozy-xl backdrop-blur-xl md:hidden">
   ```
5. Run `pnpm typecheck` + `pnpm lint`.
6. Visual smoke at 375px, 768px, 1024px, 1440px, 1920px.

## Success Criteria

- [ ] Zero yellow in hero
- [ ] Left + right gradients both cyan
- [ ] Text card readable (white/85 + border + shadow)
- [ ] Characters fully visible in center
- [ ] Mobile card white-tinted, not yellow
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Card looks like v1 glass card again. **Mitigation:** v1 was over characters; this card sits in cyan gutter zone. Different position, different design point.
- **Risk:** White card on cyan page = washed out. **Mitigation:** border + shadow provide edge definition; 85% opacity is high enough to read solid.
- **Risk:** This is 5th iteration; will user be satisfied? **Mitigation:** brainstorm explicitly flags banner-artwork pivot if still off after this round.
