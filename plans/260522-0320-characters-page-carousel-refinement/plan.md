---
title: Characters Page & Carousel Refinement v6
description: >-
  6th-cycle /characters refinement. Fixes the real root cause behind 5 failed
  rebuilds: pose PNGs are 1280x720 landscape canvases ~65% empty air. Normalizes
  the 13 pose assets, then a focused CSS pass — soft-glow cards, retuned fade,
  de-morphed detail card, page rhythm + bug fixes. Browser QA is a blocking
  gate.
status: completed
priority: P1
branch: main
tags:
  - characters
  - carousel
  - ui
  - assets
  - polish
blockedBy: []
blocks: []
---

# Characters Page & Carousel Refinement v6

## Overview

The `/characters` carousel has been rebuilt 5 times in ~12h, all shipped with zero
browser renders. This cycle rendered the page and **measured the root cause**: all 13
pose PNGs are `1280x720` landscape canvases where the character fills only ~38%×82%,
off-center, content size varying ~1.4×. No card CSS can make a character "dominant"
when the asset is 60-70% empty air.

This plan fixes the asset first (one-time normalization), then a **focused CSS pass** on
the existing components — not a 6th rebuild. The component structure is sound; it was
starved of usable art.

**Brainstorm report:** `plans/reports/brainstorm-260522-0320-characters-page-carousel-refinement.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Asset Normalization Pipeline](./phase-01-asset-normalization-pipeline.md) | Completed |
| 2 | [Carousel Card & Fade Redesign](./phase-02-carousel-card-fade-redesign.md) | Completed |
| 3 | [Detail Card De-Morph](./phase-03-detail-card-de-morph.md) | Completed |
| 4 | [Page Rhythm & Bug Fixes](./phase-04-page-rhythm-bug-fixes.md) | Completed |
| 5 | [Browser QA Gate](./phase-05-browser-qa-gate.md) | Completed |

## Approved Decisions

1. **Normalize 13 pose PNGs** — ImageMagick: trim to opaque bbox → re-pad to uniform
   `900x1200` portrait, character ~92% canvas height, bottom-aligned, centered.
2. **Delivery** — normalized PNGs to `public/assets/characters-position/`; user uploads
   to R2 after. Build-time QA renders against local assets.
3. **Drop the `layoutId` morph** — the #1 recurring journal bug. Keep the existing
   `AnimatePresence` crossfade + scale 0.97→1.
4. **Card stage = soft glow only** — feathered elliptical ground shadow + faint themed
   bloom; page bg shows through; no rectangle pad, no box.
5. **Delete `character-carousel-poses.ts`** — redundant post-normalization (keep only if
   QA finds 1-2 sit/stand outliers).

## Sequencing

Phases run **strictly sequentially**: 1 → 2 → 3 → 4 → 5. Phase 1 must complete (assets
normalized + verifiable in dev) before any CSS phase, or the CSS work is again designed
blind. Phase 5 is a **blocking gate** — the plan is not done until browser QA passes.

## Dependencies

Supersedes the completed `plans/260521-1753-characters-carousel-v5/`. No active blocking
plans. Out of scope: `/characters/[slug]` route, home `featured-pup-spotlight`.
