---
phase: 3
title: FeatureBanner CTA
status: completed
priority: P3
effort: 5m
dependencies: []
---

# Phase 3: FeatureBanner CTA

## Overview

Switch the FeatureBanner ("UNBOX THE MAGIC") CTA from default yellow (which now sits on a yellow gradient with no contrast) to dark ink variant for max legibility.

## Requirements

- Functional: CTA renders as dark button on yellow gradient (ink bg + white text).
- Non-functional: typecheck/lint clean; same hover behavior.

## Related Code Files

- Modify: `components/home/feature-banner.tsx`

## Implementation Steps

1. Locate the CTA `<Button>` in `components/home/feature-banner.tsx`.
2. Add or change to `variant="dark"`:
   ```tsx
   <Button href={href} size="lg" variant="dark">
     {cta}
   </Button>
   ```
3. If `variant` was passed as a prop, set the default in the component to `"dark"`.
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: scroll to "UNBOX THE MAGIC" section, confirm dark button stands out.

## Success Criteria

- [ ] "Shop the Pack" button in FeatureBanner renders as dark ink button
- [ ] Contrast against yellow gradient ≥ 10:1
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** If the dark button has a yellow text-shadow or glow, it may look off on yellow. **Mitigation:** check `button.tsx` dark variant — should be ink bg + white text + standard shadow. Adjust if needed.
