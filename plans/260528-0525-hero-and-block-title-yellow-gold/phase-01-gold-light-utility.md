---
phase: 1
title: Gold Light Utility
status: completed
priority: P1
effort: 15m
dependencies: []
---

# Phase 1: Gold Light Utility

## Overview

Add a single new CSS utility class `.heading-gradient-gold-light` to `app/globals.css`. Symmetric gradient (`#b8862e → #d4a833 → #ffd70c → #d4a833 → #b8862e`) with a 3-stop mobile fallback so narrow viewports render clean gold. No new tokens, no Tailwind config changes.

## Requirements

- Functional: defines `.heading-gradient-gold-light` with proper `background-clip: text` + transparent fill
- Non-functional: zero impact on bundle (CSS only); no JS changes; co-located with existing `.heading-gradient-*` utilities for grepability

## Architecture

Class lives in the `@layer utilities` block after the existing `.heading-gradient-gold` definition (~globals.css:270). Reuses `var(--brand-primary)` for the mid-stop. Dark-gold anchors at 0% and 100% use literal hex `#b8862e` (matches the existing `.heading-gradient-gold` convention — utility already uses literal `#b8862e` rather than `var(--accent-gold-dark)`).

## Related Code Files

- Modify: `app/globals.css` (add ~25 lines after the existing `.heading-gradient-gold` block)

## Implementation Steps

1. Open `app/globals.css`, locate the closing `}` of the `.heading-gradient-gold` mobile media query (~line 270).
2. Insert the new utility block immediately after, before any subsequent utility:

```css
/*
 * Yellow gradient sized for LIGHT hero / section surfaces (cyan paper / white).
 * Symmetric: dark gold anchors both ends so no stop fades into the bg.
 * Pair with `.text-shadow-soft` if extra lift is needed on busy imagery.
 */
.heading-gradient-gold-light {
  background-image: linear-gradient(
    90deg,
    #b8862e 0%,
    #d4a833 25%,
    var(--brand-primary) 50%,
    #d4a833 75%,
    #b8862e 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
@media (max-width: 639px) {
  .heading-gradient-gold-light {
    background-image: linear-gradient(
      90deg,
      #b8862e 0%,
      var(--brand-primary) 50%,
      #b8862e 100%
    );
  }
}
```

3. Save. Do not run `pnpm build` (build-verification-gate memory). Verify by running `pnpm tsc --noEmit` (should be unaffected — CSS only).

## Success Criteria

- [ ] `.heading-gradient-gold-light` exists in `app/globals.css`
- [ ] Class is inside `@layer utilities` block
- [ ] Mobile media query provided
- [ ] `pnpm tsc --noEmit` still passes
- [ ] Class is grep-discoverable: `Grep "heading-gradient-gold-light" app/globals.css` returns matches

## Risk Assessment

- **Risk:** Inserting outside `@layer utilities` would lose Tailwind's layer ordering, allowing user styles to override. **Mitigation:** insert directly after existing `.heading-gradient-gold` block which is already inside the utilities layer.
- **Risk:** `var(--brand-primary)` mid-stop fails if base layer is somehow stripped. **Mitigation:** existing `.heading-gradient-gold` uses the same var — same guarantees.
