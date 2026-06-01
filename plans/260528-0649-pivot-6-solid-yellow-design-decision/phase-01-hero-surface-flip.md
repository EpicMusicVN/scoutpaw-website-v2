---
phase: 1
title: Hero Surface Flip
status: completed
priority: P1
effort: 60m
dependencies: []
---

# Phase 1: Hero Surface Flip

## Overview

Flip all 5 hero components from light surface (paper/white/glass) to dark navy (`bg-ink-blue` `#1a3a5c`). Titles become solid bright yellow (`text-brand-primary` `#ffd70c`), body text becomes light (`text-white/85`).

## Requirements

- Functional: 5 components reshaped — section bg, kicker color, h1 color, body text color, optional text-shadow lift, button variant compatibility on dark.
- Non-functional: WCAG AA passes everywhere (~9:1 yellow on navy). Visual continuity with the body cyan bg between sections preserved.

## Architecture

Each hero component currently composes:
- Outer `<section>` with light bg (`bg-paper`, `bg-surface`, or banner image)
- Inner card/container (glass blob, sticker treatment, etc.)
- Kicker `<p>` (small uppercase eyebrow) — currently `text-ink-blue` (post-pivot #4)
- H1 — currently `heading-gradient-gold-light` (post-pivot #4)
- Body `<p>` — currently `text-ink-blue` / `text-ink-blue/85`
- CTA buttons (variants: `dark`, `primary`, `outline`)

After flip:
- Outer `<section>` bg → `bg-ink-blue` (overrides `bg-paper` / `bg-surface`)
- Glass blob inner container (where it exists) → `bg-ink-blue/85` (instead of `bg-white/55`) OR remove blob entirely since dark section bg already provides surface
- Kicker → `text-brand-primary`
- H1 → `text-brand-primary` (drop `heading-gradient-gold-light`)
- Body → `text-white/85`
- Buttons: `variant="primary"` (yellow CTA) works on dark; `variant="dark"` (navy bg, white text) blends — may need `variant="outline"` swap or keep for emphasis contrast; `variant="outline"` (light border) breaks — defer to Phase 3 audit

Optional: pair h1 with `.text-shadow-bold` (already in globals.css line 290-295) for premium-foil effect on dark.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`
- Modify: `components/home/cinematic-hero.tsx`
- Modify: `components/watch/watch-hero.tsx`
- Modify: `components/coming-soon/coming-soon-hero.tsx`
- Modify: `components/characters/character-detail-hero.tsx` (HOLD on outer section bg — per-character theme decision lives in Phase 4; this phase only flips kicker/h1/body colors)

## Implementation Steps

### `components/home/full-bleed-hero.tsx`
1. Section wrapper line 41 (`bg-paper`) → `bg-ink-blue` (or wrap content in dark surface)
2. Glass blob backdrop line ~83 (`bg-white/55`) → `bg-ink-blue/85` OR remove glass blob (dark bg already provides separation)
3. Kicker line 28 `text-ink-blue` → `text-brand-primary`
4. H1 line 31 `heading-gradient-gold-light` → `text-brand-primary` (optionally add `text-shadow-bold`)
5. Body line 34 `text-ink-blue` → `text-white/85`
6. Image overlays (left/right cyan fades, lines 56-63) — adjust to fade into navy instead of paper: `from-ink-blue` / `to-transparent`
7. Mobile glass card lines 67 (`bg-white/90`, `border-ink/10`) → `bg-ink-blue/95`, `border-white/10`; body inside card → light

### `components/home/cinematic-hero.tsx`
1. Outer section → wrap in `bg-ink-blue` surface
2. Sticker text panel line 87 (`bg-surface`) → `bg-ink-blue` with subtle border `border-white/10`
3. Kicker line 89 `text-ink-blue` → `text-brand-primary`
4. H1 line 92 `heading-gradient-gold-light` → `text-brand-primary` (add `text-shadow-bold`)
5. Body line 95 `text-ink-blue/85` → `text-white/85`

### `components/watch/watch-hero.tsx`
1. Section line 35 `bg-paper` → `bg-ink-blue`
2. Featured video card border line 43 (`border-ink/10`) → `border-white/10`
3. Kicker line 113 `text-ink-blue` → `text-brand-primary`
4. H1 line 116 `heading-gradient-gold-light` → `text-brand-primary` (add `text-shadow-bold`)
5. Body line 119 `text-ink-blue/85` → `text-white/85`
6. Video category pill line 76 (`bg-brand-primary/95 text-ink-blue`) — UNCHANGED (yellow pill on dark bg reads fine)
7. Channel badge line 81 (`bg-surface/90 text-ink-blue`) — UNCHANGED (white pill stays for contrast with video thumb)

### `components/coming-soon/coming-soon-hero.tsx`
1. Outer `<section>` → add `bg-ink-blue` + adjust padding to keep airy
2. Kicker line 24 `text-ink-blue` → `text-brand-primary` (was `text-brand-gold` originally, swapped to ink-blue in pivot #4; now goes yellow)
3. H1 line 27 `heading-gradient-gold-light` → `text-brand-primary` (add `text-shadow-bold`)
4. Body line 30 `text-ink-blue/85` → `text-white/85`

### `components/characters/character-detail-hero.tsx` (PARTIAL — bg deferred to Phase 4)
1. **DO NOT change section bg this phase** — per-character `theme.heroGradient` decision deferred to Phase 4
2. Kicker (breed) line 39 `text-ink-blue` — UNCHANGED for now (will adjust in Phase 4 based on theme decision)
3. H1 line 42 `heading-gradient-gold-light` → `text-brand-primary` IF theme bg is dark enough; ELSE keep for legibility — flag for Phase 4 audit
4. Tagline line 46 — same conditional logic

**Action:** keep this file's bg untouched in Phase 1. Mark a TODO comment at line 42 noting Phase 4 will resolve.

## Success Criteria

- [ ] All 4 full-flip heroes (full-bleed, cinematic, watch, coming-soon) render with navy section bg + yellow kicker + yellow h1 + light body
- [ ] WCAG AA spot-check: `#ffd70c` on `#1a3a5c` measures ≥9:1
- [ ] No light-bg artefacts (glass blobs, white fades) clash with new dark surface
- [ ] CTA buttons inside heroes still render readable (primary yellow stays; outline may regress — flag for Phase 3)
- [ ] `character-detail-hero` has Phase-4 TODO comment, no bg changes yet
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes

## Risk Assessment

- **Risk:** Glass blob backdrop on `full-bleed-hero` was tuned for light surfaces; dark surface may make the blob feel heavy. **Mitigation:** test with blob removed (section bg alone provides surface) — likely cleaner.
- **Risk:** Mobile glass card on `full-bleed-hero:67` has different bg from desktop blob. **Mitigation:** flip mobile card to `bg-ink-blue/95` for consistency.
- **Risk:** `text-shadow-bold` was designed for navy surfaces — re-test it lifts the yellow h1 without overshooting.
- **Risk:** `watch-hero` "Join ScoutPaw World!" button uses `variant="dark"` which is `bg-navy` — same-color-family-on-same-family may blend. **Mitigation:** Phase 3 audit; potentially swap to `variant="primary"` (yellow on dark = high contrast CTA).
- **Risk:** `coming-soon-hero` may not have an explicit `<section>` wrapper for bg. **Mitigation:** add `<section className="bg-ink-blue ...">` wrapping the existing content if needed.
