---
phase: 2
title: Large Banner Surface Flip
status: completed
priority: P1
effort: 90m
dependencies: []
---

# Phase 2: Large Banner Surface Flip

## Overview

Flip all 14 large h2 banner sections from default light surface (inheriting `bg-paper` cyan) to dark navy (`bg-ink-blue`). H2 titles become solid bright yellow. Kickers above h2 become yellow. Body text becomes light. Cards INSIDE these sections stay light (cozy floating cards on dark sections).

## Requirements

- Functional: 14 components — section bg added/changed, kicker color, h2 color, body color. Internal cards unchanged.
- Non-functional: Visual rhythm between dark section bands and light body bg `bg-paper` between them. AA ≥9:1 on titles.

## Architecture

Each banner currently renders inside a `<section>` that inherits the body cyan bg. Add explicit `bg-ink-blue` to each section. Inside the section:
- Kicker `<p>` (small uppercase eyebrow above h2) — `text-brand-gold` → `text-brand-primary`
- H2 — `heading-gradient-gold-light` → `text-brand-primary` (drop gradient, solid yellow + optional `text-shadow-bold`)
- Body / description `<p>` — `text-ink-blue` / `text-ink-blue/85` → `text-white/85`
- Sub-content (cards, lists, grids) inside section — UNCHANGED (cards keep their own surfaces)

Parallel-safe with Phase 1: zero file overlap.

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
- `components/characters/character-section.tsx`

## Implementation Steps

For each file:

1. Locate the outermost `<section>` tag in the component
2. Add or replace bg class: `bg-ink-blue` (preserve all other section classes — padding, max-width container, etc.)
3. Find the kicker `<p>` (small uppercase text above h2). Swap `text-brand-gold` → `text-brand-primary`
4. Find the h2 element. Swap `heading-gradient-gold-light` → `text-brand-primary` (optionally add `text-shadow-bold`)
5. Find descriptive body `<p>` underneath h2 (if exists). Swap `text-ink-blue` / `text-ink-blue/85` → `text-white/85`
6. **DO NOT touch cards/grids inside the section.** Internal `<article>`, `<ul>`, `<div>` repeating elements keep their own surface treatment.

**Specific special cases:**

- `feature-banner.tsx` — likely full-bleed style; verify content doesn't already have its own surface treatment that conflicts.
- `newsletter-cta.tsx` — already has character pose decorations; verify pose silhouettes read on navy bg (defer to Phase 4 if issues).
- `about-shop.tsx` — h2 line 64 swaps to yellow on navy section bg. Pillar cards INSIDE the section keep their themed bgs (cream/warm-tan/peach). h3 line 82 already reverted to `text-ink-blue` in pivot #5 — UNCHANGED.
- `featured-pup-spotlight.tsx` — preserves `leading-[0.95]` and `md:whitespace-nowrap` on h2; full-line edit to preserve.
- `featured-video.tsx` — h2 line 79 has `line-clamp-3`; preserve.
- `deal-block.tsx` — line 42 element is a `<span>` styled as title; swap colors but preserve `font-display text-3xl font-bold` etc.
- `character-section.tsx` — h2 sits on `theme.surfaceTint` per-character; this conflicts with site-wide navy. **Phase 4 will resolve** per-character override. Phase 2 still flips kicker + h2 colors; section bg decision deferred.

**For `character-section.tsx`:** Apply kicker + h2 color swaps in Phase 2, but DO NOT add `bg-ink-blue` to its section. Phase 4 audits whether to override `theme.surfaceTint`.

## Success Criteria

- [ ] 13 of 14 banner sections have `bg-ink-blue` applied (character-section deferred to Phase 4)
- [ ] All 14 h2 elements show solid `text-brand-primary` (no gradient remaining)
- [ ] All 14 kicker `<p>` elements above h2s show `text-brand-primary`
- [ ] All body `<p>` elements inside sections show `text-white/85`
- [ ] Internal cards/grids UNCHANGED (light surfaces preserved)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Grep: `Grep "heading-gradient-gold-light" components/home components/watch components/shop components/top-picks components/characters` → only Phase-4-pending `character-detail-hero` or `character-section` matches remain

## Risk Assessment

- **Risk:** Some sections currently rely on inheriting body cyan bg; adding explicit `bg-ink-blue` may break expected visual rhythm. **Mitigation:** maintain alternating dark/light rhythm — sections become dark bands; body bg between sections stays cyan.
- **Risk:** `about-shop.tsx` pillar cards on tinted bgs may look weird floating on navy section bg (vs cyan body). **Mitigation:** Phase 5 render verify; adjust pillar bg saturations only if visually broken.
- **Risk:** `feature-banner.tsx` and `newsletter-cta.tsx` may have full-bleed character pose decorations designed for light surfaces. **Mitigation:** Phase 4 audits decoratives; Phase 5 render confirms.
- **Risk:** 14 simultaneous parallel edits if delegated to a subagent — race conditions on shared files. **Mitigation:** no shared files in Phase 2; each file is independent. Safe to parallelize.
- **Risk:** `top-picks-board.tsx` has internal `deal-block.tsx` children — both flip independently. Verify the nested render looks right (yellow h2 + yellow deal-block span on shared navy bg).
- **Risk:** `character-section.tsx` h2 on themed surfaceTint stays mixed (yellow h2 on pastel bg) — `#ffd70c` on cream `#fff8e1` = ~1.05:1, catastrophic AA fail. **Mitigation:** Phase 4 MUST resolve either by overriding theme bg OR keeping h2 dark for that one component. Don't ship Phase 2 alone.
