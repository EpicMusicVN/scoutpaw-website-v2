---
phase: 1
title: Hero Surface Revert
status: completed
priority: P1
effort: 45m
dependencies: []
---

# Phase 1: Hero Surface Revert

## Overview

Revert 4 hero components from pivot #6 dark-surface state back to pivot #4 light-surface state. Direct reversal of Phase 1 of plan 260528-0649.

## Requirements

- Functional: 4 components reshaped — section bg back to light, kicker back to ink-blue, h1 back to gradient utility, body back to ink-blue, mobile cards / glass blobs / image fades back to light variants.
- Non-functional: visual match to pivot #4 state shipped at 06:02 today.

## Architecture

Each hero file currently (post pivot #6):
- Outer section `bg-ink-blue`
- Kicker `text-brand-primary` (yellow)
- H1 `text-brand-primary text-shadow-bold` (solid yellow on dark)
- Body `text-white/85`
- Mobile cards / glass blobs / image fades — dark variants

Revert to pivot #4 state:
- Outer section `bg-paper` (or original surface — see per-file mapping)
- Kicker `text-ink-blue`
- H1 `heading-gradient-gold-light` (gradient, drop `text-shadow-bold`)
- Body `text-ink-blue` / `text-ink-blue/85`
- Mobile cards / glass blobs / image fades — light variants

`character-detail-hero.tsx` was NOT touched in pivot #6 Phase 1 (left for Phase 4). It WAS touched by pivot #6 Phase 4 (h1 made theme-aware). This phase doesn't touch it — Phase 4 of this plan reverts that.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`
- Modify: `components/home/cinematic-hero.tsx`
- Modify: `components/watch/watch-hero.tsx`
- Modify: `components/coming-soon/coming-soon-hero.tsx`

## Implementation Steps

### `components/home/full-bleed-hero.tsx`
1. Section line ~41: `bg-ink-blue` → `bg-paper`
2. Image fades lines ~57/62: `from-ink-blue` / `via-ink-blue/X` → `from-paper` / `via-paper/X`
3. Mobile glass card line ~67: `bg-ink-blue/95 border-white/10` → `bg-white/90 border-ink/10`
4. Desktop blob line ~83: `bg-ink-blue/85` → `bg-white/55`
5. Kicker line 28: `text-brand-primary` → `text-ink-blue`
6. H1 line 31: `text-brand-primary text-shadow-bold` → `heading-gradient-gold-light` (drop text-shadow-bold)
7. Body line 34: `text-white/85` → `text-ink-blue`

### `components/home/cinematic-hero.tsx`
1. Section line ~55: `bg-ink-blue` → `bg-paper`
2. Text panel line ~87: `bg-ink-blue border-white/10` → `bg-surface border-ink/10`
3. Kicker line 89: `text-brand-primary` → `text-ink-blue`
4. H1 line 92: `text-brand-primary text-shadow-bold` → `heading-gradient-gold-light`
5. Body line 95: `text-white/85` → `text-ink-blue/85`

### `components/watch/watch-hero.tsx`
1. Section line 35: `bg-ink-blue` → `bg-paper`
2. Video card border line ~43: `border-white/10 ring-offset-ink-blue` → `border-ink/10 ring-offset-paper`
3. Kicker line 113: `text-brand-primary` → `text-ink-blue`
4. H1 line 116: `text-brand-primary text-shadow-bold` → `heading-gradient-gold-light`
5. Body line 119: `text-white/85` → `text-ink-blue/85`

### `components/coming-soon/coming-soon-hero.tsx`
1. Section line 13: drop `bg-ink-blue` (or set to default — inherits cyan body)
2. Kicker line 24: `text-brand-primary` → `text-ink-blue`
3. H1 line 27: `text-brand-primary text-shadow-bold` → `heading-gradient-gold-light`
4. Body line 30: `text-white/85` → `text-ink-blue/85`

## Success Criteria

- [ ] 4 heroes have light surface restored
- [ ] 4 heroes have `text-ink-blue` kicker
- [ ] 4 heroes have `heading-gradient-gold-light` h1 (no `text-shadow-bold`, no `text-brand-primary`)
- [ ] 4 heroes have ink-blue body text
- [ ] Mobile cards, glass blobs, image fades restored to light variants in full-bleed-hero
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Grep: `Grep "bg-ink-blue" components/home components/watch components/coming-soon` shows ZERO matches in the 4 hero files

## Risk Assessment

- **Risk:** Original pivot-4-era kicker color was `text-ink-blue` for hero kickers — confirm before swap. **Mitigation:** check `plans/260528-0525-hero-and-block-title-yellow-gold/phase-02-hero-component-swaps.md` for original swap mapping (pivot #4 set them to `text-ink-blue` from `text-brand-gold`).
- **Risk:** `coming-soon-hero.tsx` line 13 may not have an explicit `<section>` wrapper for bg. **Mitigation:** Read the file before edit; if no section wrapper, just remove the `bg-ink-blue` class from wherever it was added.
- **Risk:** Missing one of the inner-element changes (mobile card, glass blob, fade). **Mitigation:** explicit per-file step list above; use full-line `old_string` to catch each transformation.
