---
phase: 5
title: Menu Cards View All
status: completed
priority: P3
effort: 15m
dependencies: []
---

# Phase 5: Menu Cards View All

## Overview

Change the "Explore →" link text inside each menu card to "View All →". Ensure all card "View All" links sit at the bottom of each card on the same horizontal row (consistent card heights, button anchored to bottom via `mt-auto`).

## Requirements

- Functional:
  - Each non-disabled menu card shows "View All →" instead of "Explore →"
  - All "View All" links bottom-align across the row regardless of copy length
- Non-functional: typecheck/lint clean; no layout regressions on coming-soon cards.

## Architecture

The card body is a flex column (`flex flex-1 flex-col` at line 132). The h3 + p + link sit in flow. To bottom-anchor the link, add `mt-auto` to the link span so it pushes against the bottom edge of the flex container.

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Line 137: change label `Explore` → `View All`.
2. Line 136: add `mt-auto` to the link span:
   ```tsx
   <span className="mt-auto inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink md:text-base pt-3">
   ```
   Replaces `mt-3` with `mt-auto` (push to bottom) + `pt-3` (preserve top padding for breathing room).
3. Ensure parent flex column has consistent baseline. If h3/p use different fonts/sizes, `mt-auto` on the link handles the rest.
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: scroll to "Step into the Pack's World" section, verify all 3 visible cards have View All links on the same horizontal row.

## Success Criteria

- [ ] "Explore →" replaced with "View All →" in all non-disabled menu cards
- [ ] All View All links bottom-align across the row
- [ ] Coming-soon cards unaffected (no link, no regression)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Cards have varying copy lengths; without `mt-auto` the link would float. **Mitigation:** `mt-auto` solves this.
- **Risk:** If parent isn't a flex column, `mt-auto` is a no-op. **Mitigation:** verified at line 132 — `flex flex-1 flex-col` confirmed.
