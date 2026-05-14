---
phase: 2
title: Footer Edits
status: completed
priority: P1
effort: 10m
dependencies: []
---

# Phase 2: Footer Edits

## Overview

Fix footer text-logo aspect ratio (4.44:1 intrinsic, was declared 2.92:1), downsize to 32/40/48 px, and scale the glow filter to match the smaller logo dimensions.

## Requirements

- Functional: Wordmark renders true 4.44:1 aspect.
- Non-functional: Glow remains visible on navy bg without bloom-bombing the column.

## Architecture

**Current `components/nav/footer.tsx`:**
- `<Image width={280} height={96}>` declares 2.92:1, intrinsic is 4.44:1 → vertically distorted
- `h-16 md:h-20 lg:h-24` = 64/80/96 px
- Glow: `drop-shadow(0_0_20px_rgba(255,212,73,0.45))_drop-shadow(0_4px_12px_rgba(255,212,73,0.35))` — sized for 64-96 px logo

**Target:**
- `<Image width={222} height={50}>` matches intrinsic 4.44:1 (proportional to 812×183)
- `h-8 md:h-10 lg:h-12` = 32/40/48 px
- Glow scaled: blur 20px → 12px, offset 4px → 2px, blur 12px → 6px; first opacity bumped 0.45 → 0.5 to compensate for smaller blur radius

## Related Code Files

- Modify: `components/nav/footer.tsx`

## Implementation Steps

1. Update text-logo `<Image>` element:
   ```tsx
   // BEFORE
   <Image
     src={config.brand.logoText}
     alt={config.brand.fullName}
     width={280}
     height={96}
     className="h-16 w-auto [filter:drop-shadow(0_0_20px_rgba(255,212,73,0.45))_drop-shadow(0_4px_12px_rgba(255,212,73,0.35))] md:h-20 lg:h-24"
   />

   // AFTER
   <Image
     src={config.brand.logoText}
     alt={config.brand.fullName}
     width={222}
     height={50}
     className="h-8 w-auto [filter:drop-shadow(0_0_12px_rgba(255,212,73,0.5))_drop-shadow(0_2px_6px_rgba(255,212,73,0.35))] md:h-10 lg:h-12"
   />
   ```

2. Description text below (`<p className="mt-4 max-w-xs text-sm ...">`) and column structure untouched.

## Success Criteria

- [x] Footer wordmark renders unstretched at intrinsic 4.44:1 aspect.
- [x] Logo heights: 32 px (mobile), 40 px (md), 48 px (lg).
- [x] Glow still visible on navy without overwhelming the column.
- [x] Description paragraph below logo unchanged.
- [x] Footer column layout (3-col on md+, 2-col sm, 1-col mobile) unchanged.

## Risk Assessment

- **Risk:** Glow at 32 px logo feels flat.
  - **Mitigation:** Bump first-shadow blur 12px → 16px or opacity 0.5 → 0.55. One-line tune.
- **Risk:** Wordmark too small to read at 32 px mobile.
  - **Mitigation:** Bump mobile to `h-9` (36 px) or `h-10` (40 px). One-line tune.
