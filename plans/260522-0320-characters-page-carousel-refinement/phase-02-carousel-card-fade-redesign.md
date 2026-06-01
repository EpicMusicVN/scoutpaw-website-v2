---
phase: 2
title: Carousel Card & Fade Redesign
status: completed
priority: P1
effort: 3h
dependencies:
  - 1
---

# Phase 2: Carousel Card & Fade Redesign

## Overview

Redesign the carousel card to "soft glow only" — drop the gradient-rectangle pad; the
normalized character (Phase 1) becomes ~85% of the visual weight on a feathered glow.
Retune the over-aggressive edge fade. Tune layout so ≥4 cards show, ≥3 fully crisp.

## Requirements

- Functional: card = character + soft elliptical ground shadow + faint themed bloom;
  no rectangle, no border, no shadow box; page background shows straight through.
- Functional: edge-fade softens edge cards without making them vanish (floor ~0.4).
- Functional: ≥4 cards visible on desktop, ≥3 fully crisp & uncropped; consistent sizes.
- Non-functional: fade stays direct-DOM (no React re-render); no layout shift.

## Architecture

**Card (`character-carousel-card.tsx`) — replace the pad system:**
- Remove the themed-gradient pad div (`top-[58%]` + `PAD_MASK` radial mask + `theme.heroGradient`).
- Remove `CharacterMotif` from the card (it lived inside the pad; section ambient decor
  already carries playful life).
- Keep + soften the accent bloom — a single faint `blur-3xl` radial of `accentColor`
  behind the character (the "faint themed bloom").
- Add a soft **ground shadow** — a blurred dark ellipse at the character's feet,
  low-opacity, grounding it in the page.
- Character `<Image>` — normalized PNG (3:4), `object-contain object-bottom`, fills most
  of the card height; small top overflow OK. Remove `getPoseTuning` import/usage
  (file deleted in Phase 3).
- Title block (breed + "Say hi to {name}") stays — now over page bg; verify `ink` text
  contrast on the sky background; centered.
- Card stays a `<button>` with `rounded` focus ring but no visible background.

**Fade (`use-carousel-fade.ts`):**
- Current `FADE_START 0.26 / FADE_FACTOR 2.8` fades edge cards to near-zero (verified in
  render). Retune so the 3 inner cards = opacity 1 and edge cards floor at ~0.35-0.45.
- Opacity-only — uniform scale preserved (spec: consistent sizes). Final numbers tuned
  in Phase 5 browser QA.

**Layout (`character-carousel-track.tsx`):**
- Slide basis currently `basis-[72%] sm:basis-[40%] lg:basis-[25%]`. Target desktop
  `lg:basis-[26%]` ish — ≥4 visible, 3 inner crisp, edges peek+fade. Exact value tuned
  in QA. Mobile/tablet basis unchanged (1 / ~2-3 cards — see Phase 5).
- `VIEWPORT_H` may need a small bump for taller normalized characters — tune in QA.

## Related Code Files

- Modify: `components/characters/character-carousel-card.tsx` (card redesign)
- Modify: `components/characters/use-carousel-fade.ts` (fade curve)
- Modify: `components/characters/character-carousel-track.tsx` (slide basis, viewport h)
- Read: `lib/content/character-themes.ts` (`accentColor`, theme decor)

## Implementation Steps

1. Rewrite `character-carousel-card.tsx`: remove pad + radial mask + motif; keep faint
   bloom; add ground-shadow ellipse; character `object-contain object-bottom` filling
   the card; remove `getPoseTuning`.
2. Retune `use-carousel-fade.ts` — raise the floor so edge cards stay visible (~0.4).
3. Adjust slide basis in `character-carousel-track.tsx` for ≥4 visible / ≥3 crisp.
4. `pnpm typecheck` + `pnpm lint` — green.
5. Render `/characters` (local-mode) — characters big/equal/centered, cards read as
   immersive (no box), edges soft not invisible. Iterate values.

## Success Criteria

- [ ] No gradient rectangle / border / box — card is character + glow + ground shadow
- [ ] Characters render large, equal-sized, centered across all 5 cards
- [ ] ≥4 cards visible desktop, ≥3 fully crisp and uncropped
- [ ] Edge cards softened but visible (not faded to invisible)
- [ ] Title text legible on the page background
- [ ] `typecheck` + `lint` green; no new console errors

## Risk Assessment

- **Title contrast** over the sky-blue page bg (no pad behind it). Mitigation: verify
  `ink/70` contrast in QA; add a faint text-only soft halo if needed.
- **File overlap with Phase 3** (both touch `character-carousel-card.tsx`). Mitigation:
  phases are sequential — Phase 3 edits after Phase 2 lands.
- **Ground shadow looking heavy** — defeats "lighter cards". Mitigation: keep opacity low
  (~0.12-0.18), large blur; tune in QA.
