---
phase: 2
title: Banner Surface Revert
status: completed
priority: P1
effort: 60m
dependencies: []
---

# Phase 2: Banner Surface Revert

## Overview

Revert 14 banner sections from pivot #6 dark-surface state back to pivot #4 light-surface state. Drop `bg-ink-blue` from sections, restore kicker / h2 / body colors per each file's pivot-4 state.

## Requirements

- Functional: 14 components reshaped — section bg removed (back to inheriting cyan body), kicker color restored per file, h2 back to gradient, body back to ink-blue.
- Non-functional: visual match to pivot #4 final state.

## Architecture

Each banner currently (post pivot #6):
- Section `bg-ink-blue`
- Kicker `text-brand-primary` (or in feature-banner/featured-pup-spotlight which had `text-ink-blue/70` originally then `text-brand-primary` in pivot #6)
- H2 `text-brand-primary`
- Body `text-white/85`

Revert to pivot #4 state:
- Section: drop `bg-ink-blue` (inherits body cyan)
- Kicker: most files → `text-brand-gold`; `feature-banner` + `featured-pup-spotlight` → `text-ink-blue/70` (their pre-pivot-6 state per Phase 2 code-reviewer report)
- H2 → `heading-gradient-gold-light` (drop `text-brand-primary`)
- Body → `text-ink-blue/85` (or `text-ink-blue` depending on original)

**Inner-card AA fixes from end of pivot #6** in `feature-banner.tsx:52,55`, `featured-pup-spotlight.tsx:36,42`, `deal-block.tsx:42,45` already match pivot #4 state (`text-ink-blue` / `text-ink-blue/85`). **KEEP, don't double-revert.**

`character-section.tsx` was partially touched by pivot #6 (kicker + h2 colors, no `bg-ink-blue` added). Revert kicker + h2 here. H2 back-to-gradient deferred to Phase 4 since it ties into the per-character theme decision.

## Related Code Files

Modify (14 files):
- `components/home/menu-cards.tsx`
- `components/home/feature-banner.tsx`
- `components/home/character-showcase.tsx`
- `components/home/featured-pup-spotlight.tsx`
- `components/home/newsletter-cta.tsx`
- `components/home/video-grid.tsx`
- `components/watch/explore-videos.tsx`
- `components/watch/playlist-grid.tsx`
- `components/watch/featured-video.tsx`
- `components/shop/explore-products.tsx`
- `components/shop/about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`
- `components/top-picks/deal-block.tsx`
- `components/characters/character-section.tsx` (kicker + h2 colors only — h2 back-to-gradient deferred to Phase 4)

## Implementation Steps

For each file:

1. Find the outermost `<section>` tag. Remove `bg-ink-blue` from its className (preserve all other classes — padding, max-width, etc.).
2. Find the kicker `<p>` above h2. Swap `text-brand-primary` → original kicker color:
   - Default: `text-brand-gold`
   - Exceptions: `feature-banner.tsx`, `featured-pup-spotlight.tsx` → `text-ink-blue/70` (per their pre-pivot-6 state)
3. Find the h2 element. Swap `text-brand-primary` → `heading-gradient-gold-light` (preserve all other classes).
4. Find body `<p>` below h2 (where exists). Swap `text-white/85` → `text-ink-blue/85`.
5. DO NOT touch internal cards/grids inside the section.
6. DO NOT touch the inner-card text in `feature-banner` lines 52/55, `featured-pup-spotlight` lines 36/42, `deal-block` lines 42/45 — they were AA-fix-reverted in pivot #6 end-of-cook to `text-ink-blue`/`text-ink-blue/85` already matching pivot-4 state.

**Special cases:**

- `featured-pup-spotlight.tsx` line 36 — preserve `leading-[0.95] md:whitespace-nowrap`. Full-line `old_string`. The h2 is currently `text-ink-blue` (set by pivot #6 mid-cook AA fix). PIVOT-4 state was `text-navy` (per `plans/260528-0525-hero-and-block-title-yellow-gold/phase-03-large-h2-banner-sweep.md` which swapped `text-navy` → `heading-gradient-gold-light` originally). So target = `heading-gradient-gold-light`. Need to flip from current `text-ink-blue` → `heading-gradient-gold-light`.
- `feature-banner.tsx` line 52 — same. Currently `text-ink-blue` post AA fix; target = `heading-gradient-gold-light`.
- `deal-block.tsx` line 42 — same. Currently `text-ink-blue`; target = `heading-gradient-gold-light`.
- `featured-video.tsx` line 79 — preserve `line-clamp-3`. Full-line `old_string`.
- `about-shop.tsx` line 64 — h2 swap to gradient. Line 82 h3 stays `text-ink-blue` (pivot #4 final state).
- `character-section.tsx` — kicker line ~140 swap to pivot-4 color (likely `text-brand-gold`); h2 line 144 swap to `heading-gradient-gold-light` — BUT section bg stays whatever it currently is (no `bg-ink-blue` was added). Phase 4 may revisit if conflict with theme.

## Success Criteria

- [ ] 13 of 14 banners have `bg-ink-blue` removed from section className (character-section never had it)
- [ ] All 14 banner h2 elements show `heading-gradient-gold-light` (no `text-brand-primary` remaining on h2s)
- [ ] All 14 banner kickers show their pivot-4-era color (mostly `text-brand-gold`; feature-banner + featured-pup-spotlight → `text-ink-blue/70`)
- [ ] Body `<p>` elements show `text-ink-blue/85`
- [ ] Inner-card text in feature-banner / featured-pup-spotlight / deal-block — UNCHANGED (already pivot-4 state)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Grep: `Grep "bg-ink-blue" components/home components/watch components/shop components/top-picks components/characters` shows ZERO matches in banner files
- [ ] Grep: `Grep "heading-gradient-gold-light" components/home components/watch components/shop components/top-picks` shows ≥14 matches (1 per banner)

## Risk Assessment

- **Risk:** `feature-banner` and `featured-pup-spotlight` had `text-ink-blue/70` kickers in pivot-4 state — easy to mistakenly revert to `text-brand-gold`. **Mitigation:** explicit per-file mapping above.
- **Risk:** `featured-pup-spotlight.tsx:36` and `feature-banner.tsx:52` h2 currently `text-ink-blue` post AA fix — confusing because Phase 2 of pivot 6 had set them to `text-brand-primary`, then the inner-card AA fix in pivot 6 end-of-cook reverted to `text-ink-blue`. So target = `heading-gradient-gold-light` (pivot #4 state), not `text-ink-blue`. **Mitigation:** Read each file first to confirm current state, then apply the gradient swap.
- **Risk:** `deal-block.tsx:42` is a `<span>` not an h2 element. Same color rule applies. **Mitigation:** explicit per-file note.
- **Risk:** Mid-tier kicker colors above h2 in subscribe-card / watch-library / our-channels / video-rail / shop-empty-state — these aren't in this phase (they're Phase 3). **Mitigation:** strict file-list ownership.
- **Risk:** `character-section.tsx` h2 was set to `text-brand-primary` in pivot #6 Phase 2, then Phase 4 reverted to theme-aware. Need to figure out current state. **Mitigation:** Read the file; revert to `heading-gradient-gold-light` regardless of intermediate state.
- **Risk:** `about-shop.tsx` h2 line 64 — gradient on the `bg-ink-blue` section (now dropped). Section becomes light cyan. Gradient title on cyan = readable. Pillar cards inside stay tinted.
