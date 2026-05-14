---
phase: 5
title: Newsletter Gradient
status: completed
priority: P3
effort: 15m
dependencies:
  - 1
---

# Phase 5: Newsletter Gradient

## Overview

Replace the newsletter section's honey→gold vertical gradient with a yellow→light-yellow gradient using the new accent color. Keeps the "CTA energy" moment intact while aligning with the new palette.

## Requirements

- Functional: gradient updated; section still pops against the cyan page bg; CTA button (now yellow) doesn't fight with the section bg.
- Non-functional: typecheck/lint clean.

## Architecture

`components/home/newsletter-cta.tsx` defines a wrapper bg using `linear-gradient(180deg, var(--brand-honey) 0%, var(--brand-primary) 100%)`. After P1, `--brand-honey` is gone and `--brand-primary` is now `#ffd70c`. The gradient must be redefined.

## Related Code Files

- Modify: `components/home/newsletter-cta.tsx`

## Implementation Steps

1. Find the wrapper gradient definition (inline `style` or class).
2. Replace with: `linear-gradient(180deg, #ffd70c 0%, #ffe968 100%)` (saturated → lighter yellow).
3. If a button sits on the gradient, verify its text contrast is still readable (yellow on yellow needs `text-ink` = dark brown for legibility).
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: scroll to newsletter section on `/`, confirm gradient + button readability.

## Success Criteria

- [ ] Gradient now `#ffd70c → #ffe968` top-to-bottom
- [ ] CTA button text legible against gradient
- [ ] Section visually distinct from page bg
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Yellow gradient feels monotonous compared to honey→gold richness. **Mitigation:** tunable — adjust top stop saturation or extend stop count (e.g., `0%, 50%, 100%`) if visually flat.
- **Risk:** Button color same as gradient blends in. **Mitigation:** button has shadow/border via `cta-shimmer` utility; if insufficient, dial up shadow.
