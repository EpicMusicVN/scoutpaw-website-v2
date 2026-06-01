---
title: "Characters Carousel v5"
description: >-
  5th-iteration of the /characters carousel: immersive 100svh section, 4 cards
  visible, ~2x dominant in-column characters, de-boxed soft-pad cards, de-boxed
  detail card.
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
created: "2026-05-21T10:58:56.536Z"
createdBy: "ck:plan"
source: skill
---

# Characters Carousel v5

## Overview

5th iteration of the `/characters` carousel (follows completed
`260521-1640-characters-carousel-v4`). Makes the carousel immersive: section at
`100svh`, 4 cards visible, characters ~2x larger and dominant (in-column), cards
de-boxed into soft themed pads that blend into the page, detail card de-boxed
too. Design source: `plans/reports/brainstorm-260521-1753-characters-carousel-v5.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Soft-Pad Card & Pose Tuning](./phase-01-soft-pad-card-pose-tuning.md) | Completed |
| 2 | [Carousel Layout & 100vh Section](./phase-02-carousel-layout-100vh-section.md) | Completed |
| 3 | [Detail Card De-box & Polish](./phase-03-detail-card-de-box-polish.md) | Completed |

## Key Decisions

- 4 cards visible (basis ~25% desktop); move-by-1; section `min-h-[100svh]`.
- Characters ~2x the pad, **in-column** (no sideways overlap / edge clipping).
- Card → **soft themed gradient pad, radial-masked edges** — no border/shadow/rectangle.
- Detail card **de-boxed** too — no border/shadow, edge-masked gradient.
- `character-carousel-poses.ts` re-created — per-pose `{scale,offsetY}` tuning, applied on an **ancestor** of the `layoutId` element (morph-safe).

## Key Dependencies

- Builds on the existing carousel components — modify, don't recreate.
- No new npm dependency; no content/schema change.
- Per-pose tuning values, pad mask params, and the morph need a **browser tuning pass** — the build sets them up tunable but cannot finalize them blind.

## Follow-up Notes

Visual tuning (per-pose scale/offsetY values, pad/detail mask parameters, and carousel↔detail morph polish) remains a browser-QA follow-up task once deployed.

## Dependencies

No cross-plan blockers — `260521-1640-characters-carousel-v4` is `completed`.
This plan supersedes v4's card styling, sizing, and section height.
