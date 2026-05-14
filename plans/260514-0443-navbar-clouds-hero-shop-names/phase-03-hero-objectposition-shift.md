---
phase: 3
title: Hero ObjectPosition Shift
status: completed
priority: P3
effort: 2m
dependencies: []
---

# Phase 3: Hero ObjectPosition Shift

## Overview

Shift banner image objectPosition from `55% 50%` to `70% 50%`. Pushes characters further right; text card on left gets more clear space.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Find:
   ```tsx
   style={{ objectPosition: "55% 50%" }}
   ```
2. Change to:
   ```tsx
   style={{ objectPosition: "70% 50%" }}
   ```
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke at 768/1024/1440/1920: confirm characters readable, no right-edge crop.

## Success Criteria

- [ ] objectPosition is `70% 50%`
- [ ] Characters fully visible, not cropped
- [ ] Text card left side has clear space
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** 70% crops right-side characters on narrow viewports. **Mitigation:** banner image is 2754×1536 with distributed character art; verify visually. Fall back to 65% if crop is visible.
