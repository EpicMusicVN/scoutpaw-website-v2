---
phase: 2
title: Cloud Z-Index Fix
status: completed
priority: P3
effort: 2m
dependencies: []
---

# Phase 2: Cloud Z-Index Fix

## Overview

Drop the explicit `bg-paper` from CharacterShowcase. Section was painting cyan over the fixed SideClouds at z-0 in the gutters, hiding clouds when user scrolled into that section. Body bg is the same cyan, so dropping the explicit bg is visually neutral but lets clouds remain visible.

## Related Code Files

- Modify: `components/home/character-showcase.tsx`

## Implementation Steps

1. Find the section wrapper:
   ```tsx
   <section
     id="meet-the-pack"
     className="relative scroll-mt-24 overflow-hidden bg-paper py-24 md:py-32"
   >
   ```
2. Remove `bg-paper`:
   ```tsx
   <section
     id="meet-the-pack"
     className="relative scroll-mt-24 overflow-hidden py-24 md:py-32"
   >
   ```
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke at ≥1280px: scroll into CharacterShowcase, confirm side clouds remain visible in the gutters.

## Success Criteria

- [ ] CharacterShowcase section has no explicit bg-paper
- [ ] Side clouds remain visible at all scroll positions on widescreen
- [ ] Section content (paw pattern, cloud dividers, character cards) unchanged visually
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Other sections with `bg-paper` also hide clouds. **Mitigation:** Visual smoke + grep `bg-paper` in components/home/ to flag candidates. Address only if recurrence reported.
