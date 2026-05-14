---
phase: 4
title: SideClouds Z-Index Fix
status: completed
priority: P2
effort: 2m
dependencies: []
---

# Phase 4: SideClouds Z-Index Fix

## Overview

Move `<SideClouds>` from `z-0` to `-z-10`. With `fixed z-0`, SideClouds paints AFTER in-flow content in CSS painting order (positioned z-0 > positioned z-auto/relative sections). At `-z-10` it sits behind in-flow content but above body bg.

## Requirements

- Functional: clouds visible in gutters at ≥1280px, never overlapping content
- Non-functional: typecheck + lint clean

## Related Code Files

- Modify: `components/ui/side-clouds.tsx`

## Implementation Steps

1. Find the wrapper div:
   ```tsx
   <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden xl:block">
   ```
2. Change z-index:
   ```tsx
   <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden xl:block">
   ```
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke at widescreen (≥1280px): scroll through home page, confirm clouds remain visible at all section positions without overlapping content.

## Success Criteria

- [ ] SideClouds wrapper has `-z-10` not `z-0`
- [ ] Clouds visible behind content across all sections
- [ ] No clouds covering character cards, hero text, or any other content
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** A parent element (body, html) creates a stacking context that clips `-z-10`. **Mitigation:** Verified — `body` only has `font-body` class + `suppressHydrationWarning` attr. No transform, opacity, or isolation. `-z-10` paints behind in-flow but above body bg.
- **Risk:** Body bg is `--bg-base` (cyan); clouds at `-z-10` might be hidden by body bg paint. **Mitigation:** Body bg is painted as part of canvas root (step 1 of stacking), BEFORE any descendant painting. Clouds at -z-10 paint after body bg, so visible.
