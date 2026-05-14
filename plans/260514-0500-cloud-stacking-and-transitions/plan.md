---
title: Cloud Stacking Fix + Section Transition System
description: >-
  Fix cloud overlap diagnosed properly this time. Refactor CloudDivider from
  absolute-inside-section → block-between-sections. Add 5 dividers between home
  sections. Move SideClouds to z-[-10] so they sit behind in-flow content.
status: completed
priority: P2
branch: ''
tags:
  - design-system
  - decoratives
  - homepage
  - bugfix
blockedBy: []
blocks: []
created: '2026-05-13T22:03:35.962Z'
createdBy: 'ck:plan'
source: skill
---

# Cloud Stacking Fix + Section Transition System

## Overview

Resolves a cloud z-index bug reported twice. Root cause: SideClouds `fixed z-0` paints AFTER sections in CSS painting order, and inside-section CloudDividers span full viewport width covering SideClouds in the gutters.

Architecture fix:
- CloudDivider becomes a between-section block element
- SideClouds moves to `-z-10` (paints behind in-flow content but above body bg)
- 5 dividers placed in `app/page.tsx` per user-specified transition points

**Source brainstorm:** `plans/reports/brainstorm-260514-0500-cloud-stacking-fix-and-section-transitions.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [CloudDivider Refactor to Block](./phase-01-clouddivider-refactor-to-block.md) | Completed |
| 2 | [Remove Inside-Section CloudDividers](./phase-02-remove-inside-section-clouddividers.md) | Completed |
| 3 | [Page-Level Section Transitions](./phase-03-page-level-section-transitions.md) | Completed |
| 4 | [SideClouds Z-Index Fix](./phase-04-sideclouds-z-index-fix.md) | Completed |
| 5 | [Final Validation](./phase-05-final-validation.md) | Completed |

## Execution Order

Sequential: P1 → P5. P1 prerequisite for P2/P3 (consumers use new API).

## Validation After Each Phase

- `pnpm typecheck` clean
- `pnpm lint` clean
- Visual smoke after P3 + P4 (cloud visibility at ≥1280px)

## Out of Scope

- Hero changes
- Banner artwork
- Newsletter / footer / Pack Leader card adjustments
- New cloud shape variants
- Mobile-only divider variants

## Dependencies

Builds on completed plans `260514-0213`, `260514-0315`, `260514-0333`, `260514-0407`, `260514-0431`, `260514-0443`. No blockers.
