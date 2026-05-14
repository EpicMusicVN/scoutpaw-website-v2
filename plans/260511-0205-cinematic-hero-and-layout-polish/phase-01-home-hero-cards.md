---
phase: 1
title: Home Hero & Cards
status: completed
priority: P2
effort: 1.5h
dependencies: []
---

# Phase 1: Home Hero & Cards

## Overview

Make the home hero fill the viewport (`min-h-[100svh]`), uniform-size all menu cards while preserving sticker rotations, and close the gap between the newsletter CTA and footer.

## Requirements

**Functional**
- Home hero fills viewport on desktop + mobile (no scroll-bar jump on mobile chrome show/hide)
- All 3 menu cards share identical bounding-box dimensions
- Newsletter section visually flush against the footer

**Non-functional**
- Preserve existing brand vocabulary (honey gradient mask, rotation tilts, hover lift)
- No regression at 360 / 768 / 1280 / 1920+
- Image positioning still keeps the dogs uncovered by text

## Architecture

- `FullBleedHero` swaps fixed pixel `min-h` ladder for single `min-h-[100svh]`. Inner content wrapper matches that height and vertically centers the text panel.
- `MenuCards` drops the `size: 'lg'|'md'|'wide'` discriminator + `heightClass` switch in favor of one fixed height. Grid gets `auto-rows-fr` so cards equal regardless of copy length.
- `NewsletterCTA` reduces bottom padding to ~zero. Curve at top stays (it's the section-entry visual). Footer audited for any offsetting `mt-*`.

## Related Code Files

**Modify**
- `components/home/full-bleed-hero.tsx`
- `components/home/menu-cards.tsx`
- `components/home/newsletter-cta.tsx`
- `components/nav/footer.tsx` (audit only — modify if it adds top margin)

## Implementation Steps

1. **`full-bleed-hero.tsx`**
   - Replace `min-h-[520px] w-full md:min-h-[600px] lg:min-h-[680px]` (line 29) with `min-h-[100svh] w-full`
   - Update inner content container (line 54): replace `md:min-h-[600px] lg:min-h-[680px]` with `md:min-h-[100svh]`
   - Confirm `objectPosition: '50% 60%'` still keeps characters visible at very tall viewports (4K). If text crowds at extreme heights, add a `max-h-[1080px]` cap.

2. **`menu-cards.tsx`**
   - Remove `size: 'lg'|'md'|'wide'` field from `Card` type
   - Remove the corresponding `size` value from each card object in `allCards`
   - Delete `heightClass` switch (lines 87-92)
   - In `MenuCard` inner div (line 98), use a single class: `min-h-[320px] md:min-h-[360px]`
   - Update grid (line 75) to add `auto-rows-fr` for guaranteed equal heights regardless of inner content variation
   - Keep all `rotate` values intact

3. **`newsletter-cta.tsx`**
   - Replace `py-24 md:py-32` (line 65) with `pt-24 md:pt-32 pb-12 md:pb-16`
   - Inspect Footer root for any top margin that re-introduces a gap; if present, remove or reduce

4. **Footer audit**
   - Read `components/nav/footer.tsx` root element classes
   - If `mt-*` is set, evaluate impact and remove only if it visibly causes the gap

5. **Verify build** — `pnpm run build` (or `pnpm dev` + visual check)

## Todo List

- [ ] Hero `min-h-[100svh]` swap
- [ ] Hero inner content wrapper height update
- [ ] Menu cards: remove `size` field + heightClass
- [ ] Menu cards: fixed `min-h-[320px] md:min-h-[360px]`
- [ ] Menu cards: grid `auto-rows-fr`
- [ ] Newsletter `pb-*` reduction
- [ ] Footer top-margin audit
- [ ] Build passes (`pnpm run build`)
- [ ] Manual responsive QA on 360 / 768 / 1280 / 1920

## Success Criteria

- [ ] Home hero fills viewport on iPhone SE (375×667), iPad (768×1024), 1440 desktop, 4K
- [ ] No mobile scroll-bar-induced jump on initial load
- [ ] Menu cards: identical box dimensions across all 3
- [ ] Tilts (-2°, -1°, 2°) still present at rest; settle to 0° on hover
- [ ] No visible gap between newsletter gradient bottom and footer top
- [ ] No console errors / Tailwind warnings

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `100svh` taller than text panel content → vertical white space | Center-align panel within hero container; don't stretch |
| Uniform height makes "Meet the Pack" copy cramped (was `lg`) | Use `min-h-[360px]` (taller) so the longest copy fits |
| Footer `mt-*` ripple — removing breaks other pages | Audit other pages' first sections; if any rely on footer's gap, add the margin to the section instead |

## Security Considerations

None — visual changes only.

## Next Steps

Phase 2 (Shop Hero & Tiles) — independent, can run in parallel if helpful.
