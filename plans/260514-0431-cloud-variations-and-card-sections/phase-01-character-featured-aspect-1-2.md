---
phase: 1
title: Character Featured Aspect 1-2
status: completed
priority: P3
effort: 2m
dependencies: []
---

# Phase 1: Character Featured Aspect 1-2

## Overview

Change featured character card aspect ratio from `aspect-[3/4]` to `aspect-[1/2]` so it equals the height of 2 stacked square rows (math: featured width = 1fr, square width = 1fr each in 2fr column → square height = 1fr → 2 rows = 2fr → featured 1fr × 2fr = 1:2).

## Related Code Files

- Modify: `components/characters/character-card.tsx`

## Implementation Steps

1. Find the aspect class logic:
   ```tsx
   const aspectClass =
     variant === "featured"
       ? "aspect-[3/4]"
       : "aspect-square";
   ```
2. Change to:
   ```tsx
   const aspectClass =
     variant === "featured"
       ? "aspect-[1/2]"
       : "aspect-square";
   ```
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke: featured card should have height ≈ 2× the 2x2 grid's per-square height.

## Success Criteria

- [ ] Featured card renders at 1:2 aspect (tall narrow column)
- [ ] Total featured height ≈ 2x2 stacked grid height (within gap tolerance)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Character image looks lost in vertical whitespace inside 1:2 card. **Mitigation:** padding stays generous (`p-8 md:p-10`); object-contain centers the image. If image feels sparse, fallback to aspect-[2/3].
