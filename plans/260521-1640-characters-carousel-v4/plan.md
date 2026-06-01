---
title: "Characters Carousel v4"
description: >-
  4th-iteration polish of the /characters carousel: equal-size fully-themed
  cards with the pose overflowing ~50% out the top, opacity edge-fade, move-by-1.
status: completed
priority: P2
branch: "main"
tags:
  - characters
  - carousel
  - ui
  - polish
blockedBy: []
blocks: []
created: "2026-05-21T09:45:31.713Z"
createdBy: "ck:plan"
source: skill
---

# Characters Carousel v4

## Overview

4th iteration of the `/characters` carousel (follows completed
`260521-0823-characters-page-refinement`). Drops the coverflow scaling for
equal-size cards; redesigns each card with a full per-pup themed gradient and
the pose straddling the card's top edge (~50% above); move-by-1 with a soft
opacity edge-fade. Background already blends — no rework. Design source:
`plans/reports/brainstorm-260521-1640-characters-carousel-v4.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Pose Tuning & Card Redesign](./phase-01-pose-tuning-card-redesign.md) | Completed |
| 2 | [Carousel Layout & Fade Animation](./phase-02-carousel-layout-fade-animation.md) | Completed |
| 3 | [Polish & Docs Sync](./phase-03-polish-docs-sync.md) | Completed |

## Key Decisions

- All cards **equal scale + height** — coverflow scaling dropped.
- Card background = full per-pup `theme.heroGradient` (reverses last round's white cards).
- Pose **straddles the card top edge ~50/50**; Embla viewport gets top padding (real overflow impossible with `overflow:hidden`).
- Next/prev **moves by 1**; soft opacity edge-fade, cinematic glide.
- **NOTE (Dropped Deliverable):** The planned `character-carousel-poses.ts` per-pose tuning map was created, then removed during code review. It was a no-op (all-neutral values: `scale: 1, offsetY: 0`) and introduced a framer-motion `layoutId` morph trap. Per-pose tuning is deferred to a browser-QA pass.

## Key Dependencies

- Builds on the existing carousel components — modify, don't recreate.
- `use-carousel-coverflow.ts` repurposed → `use-carousel-fade.ts` (opacity-only).
- No new npm dependency; no content/schema change. Click→detail transition unchanged.

## Dependencies

No cross-plan blockers — `260521-0823-characters-page-refinement` is `completed`.
This plan supersedes that round's card styling + coverflow scaling.
