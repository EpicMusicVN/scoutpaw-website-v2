---
phase: 2
title: Character Featured Aspect 3-4
status: completed
priority: P3
effort: 5m
dependencies: []
---

# Phase 2: Character Featured Aspect 3-4

## Overview

Restore the featured character card's tall rectangle aspect ratio (`aspect-[3/4]`). Last cook flipped it to `aspect-square` defensively after the ratio change to 1fr:2fr. User now explicitly wants vertical rectangle.

## Related Code Files

- Modify: `components/characters/character-card.tsx`

## Implementation Steps

1. Find the aspect class logic:
   ```tsx
   const aspectClass =
     variant === "featured"
       ? "aspect-square"
       : "aspect-square";
   ```
2. Change featured back to `aspect-[3/4]`:
   ```tsx
   const aspectClass =
     variant === "featured"
       ? "aspect-[3/4]"
       : "aspect-square";
   ```
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke: confirm featured card is taller than wide, next to the 2×2 square grid.

## Success Criteria

- [ ] Featured character card renders at aspect 3:4 (taller than wide)
- [ ] 2×2 grid stays at aspect-square
- [ ] No layout regressions on mobile (stacked)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** At 1fr (~33% width), aspect-[3/4] makes the card taller than the 2×2 grid total height. **Mitigation:** acceptable asymmetry; visual hierarchy emphasizes featured. If too tall, fall back to `aspect-[4/5]`.
