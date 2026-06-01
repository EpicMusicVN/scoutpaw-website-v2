# Brainstorm — Characters Carousel v4 (Themed Cards + Pose Overflow)

- **Date:** 2026-05-21
- **Route:** `/characters`
- **Status:** Design approved — ready for `/ck:plan`
- **Branch:** main
- **Follows:** `260521-0823-characters-page-refinement` (completed). 4th iteration of this carousel.

## Problem Statement

Refine the carousel again: cards should be equal-sized (no coverflow emphasis), redesigned so the pose pops ~50% out the top, with full per-pup themed gradient backgrounds; smoother move-by-1 fade transitions. Partly reverses the previous round (calm white cards, focal coverflow) — intentional, user has seen it rendered.

## Requirements

- 3 cards fully visible; **all cards same scale + height** (no coverflow scaling).
- Card: pose image straddles the top edge — ~50% inside, ~50% above the card.
- Card background fully the character theme color (no white/neutral) — gradients, glow, decorative shapes, layered depth, per personality.
- Next/prev moves by 1 (user chose this over the requested move-by-3, since 5 chars don't divide by 3); smooth, soft fades, elegant easing, no snapping.
- Background blends with site (already done — keep).
- Modern/playful/cinematic, responsive, performant, readable.

## Decisions (locked via clarifying questions)

| Decision | Choice |
|---|---|
| bg-blend + 3-visible | Already correct from last round — **keep, no rework** |
| Slide step | **Move by 1** (move-by-3 doesn't divide 5 cards evenly; move-by-1 smoothest) |
| Pose overflow | **~50% above the card** (user's spec) |
| Card scale | **Equal** — coverflow scaling dropped |
| Card background | **Per-pup `heroGradient`** — reverses last round's calm white |

## Recommended Solution

### Carousel layout
Drop the scale tween — all cards equal scale + height. 3 visible desktop / 2 tablet / 1 mobile (basis already set). `use-carousel-coverflow.ts` → repurposed to `use-carousel-fade.ts` (opacity-only).

### Card redesign
- Background = `theme.heroGradient`; `CharacterMotif` (per-personality shapes) + soft accent-color glow + layered depth; ink text (gradients AA-safe for ink).
- Pose straddles the card top edge ~50/50.
- **Overflow technique:** Embla viewport must stay `overflow:hidden` — real overflow is impossible. Solution: viewport gets **top padding**; card sits in the lower zone; pose extends up into the padding strip, still inside the viewport (never clipped). Strip above shows site bg with poses popping up.
- **Consistency:** add `character-carousel-poses.ts` — per-slug `scale`/`offsetY` tuning map so all 5 differently-framed pose PNGs appear at the same size + overlap.
- Whole card stays the click target; pose keeps `layoutId` for the detail morph.

### Animation
- Move by 1; Embla `duration` tuned slightly longer (cinematic glide).
- Soft edge fade: per-frame opacity tween keeps the 3 in-view cards opaque, fades cards across viewport edges — slide+fade, no snap.
- Click→detail transition unchanged (last round's center-first → recede → morph → stagger).

### Background
Unchanged — already blends; faint ambient decor kept.

## Files

- Modify: `character-carousel-card.tsx` (major), `character-carousel-track.tsx` (viewport top-padding, drop scale), `character-carousel.tsx` (section sizing).
- Rename: `use-carousel-coverflow.ts` → `use-carousel-fade.ts` (opacity-only).
- Create: `character-carousel-poses.ts` (per-character pose tuning).
- Unchanged: `character-detail-card.tsx`, `character-carousel-arrows.tsx`, `character-carousel-ambient.tsx`.
- No new dependency, no content/schema change.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Pose PNGs framed inconsistently | Per-slug `scale`/`offsetY` map; flag if art re-export needed for true parity |
| 50% overflow top-heavy on full-body poses | Overlap ratio tunable; user picked 50% knowingly |
| Viewport top-padding vs section/detail height | Retune section min-height so carousel⇄detail don't jump |
| `overflow:hidden` clipping the popped pose | Padding-strip approach keeps pose inside the viewport |
| `layoutId` morph from straddling pose box | Morph element = the pose box; works from any box → detail box |

## Success Criteria

- 3 equal-size cards fully visible desktop; all pups same apparent scale + height.
- Pose pops ~50% above the card; nothing clipped.
- Cards fully themed (gradient + motif + glow + depth); no white/neutral.
- Move-by-1 with smooth slide + soft opacity fade; no snapping.
- Responsive 3 breakpoints; no CLS; build/lint/typecheck green; `/characters` static; `[slug]` untouched.

## Unresolved Questions

- Whether the 5 pose PNGs are consistent enough that the tuning map alone suffices, or art re-export is needed — to be assessed during implementation.
