---
phase: 3
title: UI copy and JSDoc updates
status: completed
priority: P2
effort: 10m
dependencies:
  - 2
---

# Phase 3: UI copy and JSDoc updates

## Overview

Replace "Buddy" with "Rocky" in component UI copy + JSDoc comments where the reference is to the Husky character (the spotlight/captain). All these refs were originally about the Husky, so they all become Rocky.

## Requirements

- Functional: UI text reads "Rocky" wherever it previously read "Buddy" in the context of the Husky/spotlight character
- Non-functional: no typecheck or lint regressions; comments updated for code-reading clarity

## Related Code Files

- Modify: `app/page.tsx`
- Modify: `components/home/menu-cards.tsx`
- Modify: `components/shop/shop-empty-state.tsx`
- Modify: `components/home/featured-pup-spotlight.tsx`
- Modify: `components/home/hero-character-cluster.tsx`

## Implementation Steps

1. **`app/page.tsx` line 18:**
   - `"Max, Buddy, and their friends..."` → `"Max, Rocky, and their friends..."`

2. **`components/home/menu-cards.tsx` line 26:**
   - `"Learn more about Buddy, Max, and all your favorite furry friends..."` → `"Learn more about Rocky, Max, ..."`

3. **`components/shop/shop-empty-state.tsx`** — 2 refs (lines 10 + 20):
   - `alt="Buddy waiting"` → `alt="Rocky waiting"`
   - `Buddy is sniffing out fresh products. Check back soon!` → `Rocky is sniffing out fresh products...`

4. **`components/home/featured-pup-spotlight.tsx`** — JSDoc lines 7-8:
   - `Meet Buddy` → `Meet Rocky`
   - `behind Buddy` → `behind Rocky`

5. **`components/home/hero-character-cluster.tsx`** — JSDoc line 9:
   - `Buddy front-and-center` → `Rocky front-and-center`

6. Grep `app/` and `components/` for remaining `Buddy` references — should hit zero (the Corgi is named Buddy now, but it's not referenced by UI copy; UI copy only mentions Rocky + Max).

## Success Criteria

- [ ] All UI text reads "Rocky" where it previously read "Buddy"
- [ ] JSDoc comments updated for clarity
- [ ] `grep -rn 'Buddy' app/ components/` returns zero results
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

## Risk Assessment

- **Risk:** SEO metadata or other strings reference "Buddy" outside the files listed
  - **Mitigation:** Grep step at the end catches stragglers
- **Risk:** A test fixture (if any) hardcodes "Buddy"
  - **Mitigation:** This project has no test framework; build is the test surface
