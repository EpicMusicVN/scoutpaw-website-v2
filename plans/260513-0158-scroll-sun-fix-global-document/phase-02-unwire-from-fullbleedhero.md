---
phase: 2
title: Unwire from FullBleedHero
status: completed
priority: P1
effort: 2m
dependencies: []
---

# Phase 2: Unwire from FullBleedHero

## Overview

Remove ScrollSun import and JSX from `components/home/full-bleed-hero.tsx`. Hero stays a Server Component with banner + glass card only.

## Requirements

- Functional: Hero renders without ScrollSun child.
- Non-functional: No dead imports.

## Architecture

Current:
```tsx
import { ScrollSun } from "@/components/home/scroll-sun";
...
<section>
  <div className="banner..."><Image .../></div>
  <ScrollSun />
  <div className="glass card...">...</div>
</section>
```

Target: drop both lines.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Remove import line:
   ```diff
   - import { ScrollSun } from "@/components/home/scroll-sun";
   ```

2. Remove JSX line:
   ```diff
   - <ScrollSun />
   ```

3. Save.

## Success Criteria

- [x] No `ScrollSun` reference in `full-bleed-hero.tsx`.
- [x] Hero still renders banner image + glass card.

## Risk Assessment

- **Risk:** None — clean removal.
