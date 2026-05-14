---
phase: 1
title: Hero Center + Mobile Stack
status: completed
priority: P1
effort: 3m
dependencies: []
---

# Phase 1: Hero Center + Mobile Stack

## Overview

Two changes in the glass card className: shift vertical anchor down to upper-third (top-24 / lg:top-32), and switch mobile from -mt-8 overlap to mt-8 true gap.

## Requirements

- Functional: Card sits visually upper-center on md+, true-stacked below banner on mobile.
- Non-functional: No content/styling changes. Only positioning.

## Architecture

Current glass card class includes:
```
relative mx-4 -mt-8 max-w-md ... md:absolute md:left-12 md:top-12 ... lg:left-16 lg:top-16 ...
```

Target:
```
relative mx-4 mt-8 max-w-md ... md:absolute md:left-12 md:top-24 ... lg:left-16 lg:top-32 ...
```

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. In `components/home/full-bleed-hero.tsx`, locate the glass card `<div>` className string.
2. Replace `-mt-8` → `mt-8`, `md:top-12` → `md:top-24`, `lg:top-16` → `lg:top-32`.
3. Save.

## Success Criteria

- [x] Mobile: banner ends, 32px gap, card flows below (no overlap onto banner image).
- [x] md (768px+): card anchored 96px from top of banner area.
- [x] lg (1024px+): card anchored 128px from top of banner area.
- [x] All other classes/content/props unchanged.

## Risk Assessment

- **Risk:** Mobile 32px gap may feel too separated. Mitigation: drop `mt-8` → `mt-4` if QA flags.
- **Risk:** Hero card on md (768x1024) at top-24 with ~450px card height ends at y=546 = 53% of viewport. Verify doesn't extend past viewport on shorter laptop screens.
