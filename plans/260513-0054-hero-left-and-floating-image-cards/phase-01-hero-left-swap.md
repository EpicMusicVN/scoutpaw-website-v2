---
phase: 1
title: Hero Left Swap
status: completed
priority: P1
effort: 2m
dependencies: []
---

# Phase 1: Hero Left Swap

## Overview

Change the glass card's absolute positioning classes from upper-right to upper-left. ~3-character diff.

## Requirements

- Functional: Card sits upper-left on md+ instead of upper-right. Mobile unchanged.
- Non-functional: No new styles. No content changes.

## Architecture

Current glass card classes (line ~32 of full-bleed-hero.tsx):
```
md:absolute md:right-12 md:top-12 md:mx-0 ... lg:right-16 lg:top-16 lg:max-w-lg ...
```

Target:
```
md:absolute md:left-12 md:top-12 md:mx-0 ... lg:left-16 lg:top-16 lg:max-w-lg ...
```

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. In `components/home/full-bleed-hero.tsx`, locate the glass card `<div>` (single class string).
2. Replace `md:right-12` → `md:left-12` and `lg:right-16` → `lg:left-16`.
3. Save.

## Success Criteria

- [x] Glass card pinned `md:left-12 md:top-12 lg:left-16 lg:top-16` on md+.
- [x] Mobile (-mt-8 mx-4 flow) unchanged.
- [x] All other classes, content, props unchanged.

## Risk Assessment

- **Risk:** Card overlaps corgi (~28% from left) at lg widths. Glass blur softens; trade-off pattern accepted per brainstorm.
- **Risk:** Accidentally also swap mobile `mx-4` direction — mobile uses `mx-4` (equal margins), no swap needed.
