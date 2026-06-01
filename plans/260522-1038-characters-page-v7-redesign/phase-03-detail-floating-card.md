---
phase: 3
title: "Detail Floating Card"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 3: Detail Floating Card

## Overview

Rework the detail view from the v6 de-boxed treatment into a premium floating
card — rounded corners, soft shadow, layered depth — sitting over a soft themed
wash with drifting decor. The character artwork overflows the card frame.

## Requirements

- Functional: detail content sits inside a contained floating card; a themed
  wash + atmosphere/motif/decor render behind it; artwork breaks the card's
  top edge; Back button + Escape + `?pup=` + staggered story all still work.
- Non-functional: file < 200 lines; responsive (card fills width + internal
  split stacks on mobile); reduced-motion honored; artwork `priority`-loaded.

## Architecture

`character-detail-card.tsx` currently renders a de-boxed, edge-masked themed
gradient that melts into the page (`PANEL_MASK`). v7 replaces that with two
layers:

1. **Backdrop** — a soft themed wash filling the section, with
   `CharacterAtmosphere` + `CharacterMotif` + drifting `Cloud/Sparkle/MusicNote`
   decor. (These already exist; they move from "behind a melting gradient" to
   "behind a floating card".)
2. **Floating card** — a contained element: `rounded-[2.5rem]`, `shadow-cozy-xl`,
   themed surface (`theme.heroGradient` — light, `ink`-readable),
   `overflow-visible` so the artwork can break the frame. Generous padding for
   cinematic spacing. The v6 internal art-dominant split (artwork right ~58%,
   story left) is kept inside the card.

The artwork column is positioned so the pose overflows the card's top edge
(`-translate-y` / negative top inset) — layered depth + echoes the carousel
card's character-on-top motif. The card keeps `overflow-hidden` only where the
gradient surface needs clipping; the artwork lives in an `overflow-visible`
layer above it.

## Related Code Files

- Modify: `components/characters/character-detail-card.tsx`
- Read for context: `components/characters/character-atmosphere.tsx`,
  `character-motif.tsx`, `character-scene-decor.tsx`, `character-themes.ts`

## Implementation Steps

1. **`character-detail-card.tsx`** — remove the `PANEL_MASK` constant + the
   edge-masked gradient `<div>`.
2. Outer container — keep `min-h-[calc(100svh-5rem)]`, `flex flex-col`,
   `md:justify-center` (the v6 short-viewport fix). This is the section that
   holds the backdrop + the floating card.
3. **Backdrop layer** — an `absolute inset-0` `<div aria-hidden>` with a soft
   themed wash (a gentle tint from `theme.surfaceTint` or a low-opacity
   `theme.heroGradient`). Render `CharacterAtmosphere`, `CharacterMotif`, and
   the drifting `Cloud`/`Sparkle`/`MusicNote` inside / over this layer, behind
   the card.
4. **Floating card** — a `relative` (above the backdrop) `<div>`:
   `mx-auto max-w-[...]`, `rounded-[2.5rem]`, `shadow-cozy-xl`, themed surface
   (`style={{ background: theme.heroGradient }}`), generous padding
   (`p-8 md:p-12 lg:p-16`). The card is the elegant premium container.
5. **Internal split** — keep the v6 art-dominant grid:
   `md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]`, artwork `md:order-2` (right),
   story panel left (breed kicker · name · tagline · full `bio` · `CharacterQuote`
   full). Keep the `STORY_CONTAINER`/`STORY_ITEM` stagger.
6. **Artwork overflow** — position the artwork box so the pose breaks the card's
   top edge: give the artwork a negative top offset / `-mt-` so its upper
   portion sits above the card's rounded top. Ensure the card (or the artwork's
   wrapper) does not `overflow-hidden`-clip the pose.
7. Keep: "Back to the pack" button (top-left), `closeRef` focus-on-mount,
   Escape-to-close + double-close guard.
8. Responsive — on `<md`, the card fills most of the width (smaller margins),
   the internal split stacks (artwork top, story below); the artwork overflow
   is reduced/disabled on mobile if it causes horizontal issues.
9. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Detail view is a floating card — rounded corners, soft shadow, layered
      depth, cinematic spacing
- [ ] A themed wash + drifting atmosphere/motif decor render behind the card
- [ ] Character artwork overflows the card's top edge (not clipped)
- [ ] Internal art-dominant split + staggered story preserved
- [ ] Back button + Escape + `?pup=` deep-link still work
- [ ] Responsive: card + split adapt on tablet/mobile
- [ ] File < 200 lines; `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Overflow vs clipping** → the artwork must live in an `overflow-visible`
  layer; the themed gradient surface clips with `rounded` + `overflow-hidden` on
  a separate inner layer. Keep the two concerns on separate elements.
- **Mobile overflow** → an overflowing pose can cause horizontal scroll on
  small screens; clamp/disable the overflow on `<md`.
- **Re-boxing reverses v6 de-box** → intended; the themed wash backdrop keeps it
  from reading as a hard UI box.
