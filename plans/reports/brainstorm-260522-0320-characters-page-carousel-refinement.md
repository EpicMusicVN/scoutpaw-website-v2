# Brainstorm — Characters Page & Carousel Refinement (v6)

**Date:** 2026-05-22 03:20
**Component:** `/characters` page, carousel, in-page detail card
**Status:** Design approved — proceed to plan

## Problem Statement

User requested a full UI/UX review + refinement of the Characters page and carousel:
premium/cinematic feel, character-dominant carousel, lighter de-boxed cards, smooth
animations, immersive page integration, responsive, performant.

This is the **6th cycle** on this carousel. Journals record 5 prior rebuilds in ~12h,
**all shipped with zero browser renders**. Each rebuilt card CSS; none diagnosed the
real cause.

## What Was Done This Session (the missing step)

Rendered the live page (`localhost:3000`) at desktop 1440 + mobile 390 + `?pup=` detail.
Screenshots → `.claude/chrome-devtools/screenshots/`. Then measured the pose assets.

### Rendered findings
- Carousel = row of pale washed-out gradient rectangles; side cards faded near-invisible.
- Character art renders **tiny**, lost in the upper third of each pad.
- `100svh` flex-center = cavernous empty whitespace above/below the carousel.
- Live JS error: `<path> attribute d: ... "undefined"` + Framer `animate opacity from
  "undefined"` warning. Shipping now.
- Detail card layout OK but art again small, floating low-right.
- Mobile: 1 card ~72% width, character tiny, empty gradient below.

### Root cause (measured, not guessed)
All 13 pose PNGs are **1280×720 landscape canvases**; opaque character content:

| Pose | Content box | % canvas W | Offset |
|------|-------------|-----------|--------|
| golden1 | 485×584 | ~38% | +424,+78 |
| husky1 | 389×594 | ~30% | +454,+66 |
| collie1 | 519×619 | ~41% | +399,+52 |
| corgi2 | 483×580 | ~38% | +420,+62 |
| poodle1 | 536×574 | ~42% | +418,+80 |

Every PNG is 60-70% empty transparent air, character off-center, content size varies
~1.4×. Through `<Image object-contain>` into a portrait card box, the character
**cannot** render large or consistent. No card CSS fixes this. **This single
unaddressed fact is why 5 CSS-only rebuilds failed.**

## Approaches Evaluated

| Approach | Verdict |
|----------|---------|
| **A. Normalize pose assets** (trim + re-pad to uniform portrait) | **CHOSEN.** One-time real fix. Removes the tuning-file problem class permanently. |
| B. CSS-only per-pose tuning (`character-carousel-poses.ts`) | Rejected. The exact approach that failed 5×. Fragile, never reaches consistency. |
| C. Drop carousel for a grid (Bluey-ref style) | Rejected. User spec explicitly + repeatedly says carousel; Bluey screenshot taken as aesthetic reference only. |

## Decisions (user-confirmed)

1. **Normalize the 13 pose PNGs** — trim to opaque box, re-pad to uniform `900×1200`
   portrait, character ~92% canvas height, bottom-aligned, centered.
2. **Delivery:** output normalized PNGs locally to `public/assets/characters-position/`;
   user uploads to R2 afterward. Build-time QA renders against local assets
   (temp-unset `NEXT_PUBLIC_R2_BASE_URL`), then restores.
3. **Drop the `layoutId` shared-element morph** (the #1 recurring journal bug) — replace
   with the existing `AnimatePresence` crossfade + gentle scale.
4. **Card stage = soft glow only** — feathered elliptical ground shadow + faint themed
   bloom; page background shows straight through; no rectangle, no box.

## Recommended Solution

1. **Asset normalization** — ImageMagick script, all 13 poses → uniform portrait.
   `character-carousel-poses.ts` deleted (kept only if QA finds 1-2 sit/stand outliers).
2. **Carousel card** — replace gradient-rectangle pad with soft glow + ground shadow;
   character dominant (~85% visual weight); keep de-boxed; title block centered.
3. **Carousel layout** — keep Embla 4-up equal-size (spec: 4 visible, 3 crisp, consistent
   sizes); tune basis ~26-28%.
4. **Fade retune** — inner cards opacity 1, edge cards floor ~0.4 (recede, not vanish);
   opacity-only, uniform scale.
5. **Detail card** — remove `layoutId`; crossfade transition; normalized art renders big.
6. **Page rhythm** — collapse double height source into one; cut cavernous whitespace;
   keep CloudDividers.
7. **Bug fixes** — JS `<path> d="undefined"` error + Framer opacity-undefined warning.
8. **Responsive** — 4-up = desktop only; tablet ~2-3; mobile 1+peek (4 cards on 390px
   is unreadable by design).

## Risks

- **R2 sync gap:** normalized PNGs render in dev only after local-asset mode or R2 upload.
  Mitigated: build-time QA uses local-asset render.
- **Sit vs stand poses:** uniform height-normalization may over-scale a compact pose.
  Mitigated: browser QA checkpoint; small per-pose nudge only if proven needed.
- **Cookie banner** (fixed, global) overlaps section bottom until dismissed — keep no
  critical control in bottom strip.

## Success Criteria

- Characters render large, equal-sized, centered across all 5 cards.
- ≥4 cards visible desktop, ≥3 fully crisp, no cropping/overflow.
- Cards read as immersive (glow only, no box); page bg shows through.
- Smooth crossfade carousel↔detail; no morph jump; no abrupt motion.
- Zero console errors/warnings on `/characters`.
- Clean desktop/tablet/mobile layouts — **browser-verified before done** (the gate).

## Scope

**In:** `/characters` page, carousel, in-page detail card.
**Out (flagged):** `/characters/[slug]` route duplicates the in-page detail —
consolidate later. Home `featured-pup-spotlight` — separate change.

## Plan Phases

1. Asset normalization pipeline (script + 13 PNGs).
2. Carousel card redesign (soft-glow stage) + fade retune + layout tune.
3. Detail card — remove morph, crossfade, art sizing.
4. Page rhythm/whitespace + bug fixes (JS error, Framer warning).
5. Browser QA gate — desktop/tablet/mobile verified before completion.

## Unresolved Questions

- R2 upload: overwrite existing keys vs new keys? (User uploads — their call.)
- Keep or retire `/characters/[slug]` route? (Deferred — out of scope.)
