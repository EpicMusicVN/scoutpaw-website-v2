---
phase: 2
title: Character Showcase Ratio
status: completed
priority: P3
effort: 10m
dependencies: []
---

# Phase 2: Character Showcase Ratio

## Overview

Adjust the Character Showcase magazine layout from `1.5fr : 1fr` (featured 60% / grid 40%) to `1fr : 2fr` (featured 33% / grid 67%). Featured becomes the accent; 2×2 grid dominates.

## Requirements

- Functional: featured card occupies ~1/3 of layout width on md+; 2×2 grid takes ~2/3.
- Non-functional: featured card's `aspect-[4/5]` may need to shift to `aspect-square` or `aspect-[5/6]` at narrower width to avoid stretching artifacts.

## Related Code Files

- Modify: `components/home/character-showcase.tsx`
- Modify (potentially): `components/characters/character-card.tsx` (featured variant aspect)

## Implementation Steps

1. In `character-showcase.tsx`, change grid template:
   ```tsx
   // Before
   <div className="mt-14 grid gap-5 md:grid-cols-[1.5fr_1fr] md:gap-6 lg:gap-8">
   // After
   <div className="mt-14 grid gap-5 md:grid-cols-[1fr_2fr] md:gap-6 lg:gap-8">
   ```
2. Visual smoke: check featured card aspect ratio at ~33% width.
3. If featured card looks too narrow/stretched, adjust its variant aspect in `character-card.tsx`:
   - `aspect-[4/5]` → `aspect-square` (cleaner at smaller width)
   - OR `aspect-[5/6]` (slightly taller than square)
4. Verify mobile stacking still works (single column, featured first).
5. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Featured card occupies ~1/3 width on md+
- [ ] 2×2 grid occupies ~2/3 width on md+
- [ ] No layout artifacts (stretched aspect, awkward gaps)
- [ ] Mobile still stacks correctly
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Featured card too small to visually anchor the section. **Mitigation:** keep featured at `aspect-square` so it still has presence; rely on accent color + paw scatter (P5) for visual weight.
- **Risk:** 2x2 grid items now larger than before — image may pixelate. **Mitigation:** sizes attribute on Image already scales per breakpoint; if needed, update `sizes` for the compact variant.
