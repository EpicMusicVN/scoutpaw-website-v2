---
phase: 3
title: Large H2 Banner Sweep
status: completed
priority: P1
effort: 45m
dependencies:
  - 1
---

# Phase 3: Large H2 Banner Sweep

## Overview

Swap 14 large section-banner h2 elements from `text-navy` to the new `.heading-gradient-gold-light` utility. Threshold: `text-4xl` or larger at any breakpoint. Two borderline elements (3xl base, scaling to 5xl) are classified LARGE because their lg-and-up rendering crosses the threshold.

## Requirements

- Functional: 14 line edits across 14 files. Each touches exactly one h2 (or equivalent emphasised element).
- Non-functional: visual cohesion with hero h1 (same utility), preserves all other classes (sizing, leading, line-clamp, whitespace, responsive variants).

## Architecture

All affected elements are top-level section banners with `font-display text-Nxl font-bold` patterns. Class substitution is mechanical. Two non-h2 elements included: `top-picks/deal-block.tsx:42` is a `<span>` styled as a large title, `featured-video.tsx:79` is h2 but at the smaller end of "large." Both kept under this phase for visual rhythm consistency.

## Related Code Files

| File | Line | Element | Sizes | Notes |
|---|---|---|---|---|
| `components/home/menu-cards.tsx` | 70 | h2 | 4xl→6xl | "Explore the Pack" or similar |
| `components/home/feature-banner.tsx` | 52 | h2 | 5xl→7xl | Workday hangout banner |
| `components/home/character-showcase.tsx` | 29 | h2 | 4xl→7xl | Meet the pack |
| `components/home/featured-pup-spotlight.tsx` | 36 | h2 | 4xl→7xl | Pup spotlight |
| `components/home/newsletter-cta.tsx` | 76 | h2 | 5xl→7xl | Newsletter |
| `components/home/video-grid.tsx` | 35 | h2 | 4xl→7xl | Switch on ScoutPaw TV |
| `components/watch/explore-videos.tsx` | 80 | h2 | 4xl→6xl | Explore videos |
| `components/watch/playlist-grid.tsx` | 28 | h2 | 4xl→6xl | Playlist grid |
| `components/watch/featured-video.tsx` | 79 | h2 | 3xl→5xl | Borderline LARGE — scales to 5xl |
| `components/shop/explore-products.tsx` | 73 | h2 | 4xl→7xl | Explore products |
| `components/shop/about-shop.tsx` | 64 | h2 | 4xl→7xl | About shop |
| `components/top-picks/top-picks-board.tsx` | 52 | h2 | 4xl→6xl | Top picks |
| `components/top-picks/deal-block.tsx` | 42 | span | 3xl→5xl | Title-styled span, borderline LARGE |
| `components/characters/character-section.tsx` | 144 | h2 | 4xl→6xl | Character section |

## Implementation Steps

1. For each row, open file, jump to line, swap `text-navy` → `heading-gradient-gold-light`. Preserve every other class.
2. Use full-line `Edit` `old_string` to avoid ambiguity (some files may have multiple `text-navy` occurrences).
3. After all 14 edits, sanity-check: `Grep "text-navy" components/` should still show only intentional remaining usages (footer wrapper context, nav, button variants — none of which are h2 section banners).
4. Run `pnpm tsc --noEmit` and `pnpm lint`.

## Success Criteria

- [ ] All 14 line edits applied
- [ ] Grep: `Grep "heading-gradient-gold-light" components/` shows ≥19 matches (5 hero + 14 large banners)
- [ ] No regression in `pnpm tsc --noEmit` or `pnpm lint`
- [ ] No accidental removal of any non-color class on edited lines

## Risk Assessment

- **Risk:** `featured-video.tsx:79` has `line-clamp-3` — must be preserved. **Mitigation:** edit full-line `old_string`, not partial.
- **Risk:** `character-section.tsx:144` h2 sits on `theme.surfaceTint` (per-character pastel) — same theme-clash concern as hero. **Mitigation:** verify in Phase 5; defer to per-theme override only if observed.
- **Risk:** `deal-block.tsx:42` is a `<span>` not h2 — semantic concern about applying heading-style utility to non-heading. **Mitigation:** the file already styles the span as a title via `font-display text-3xl font-bold`; this swap follows existing convention. No semantic regression.
- **Risk:** Future devs may add a new h2 banner and forget the rule. **Mitigation:** Phase 6 updates `code-standards.md` with the new contract.
