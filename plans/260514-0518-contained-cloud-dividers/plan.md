---
title: Contained Cloud Dividers (Cluster Style)
description: >-
  Replace the (removed) full-width wave CloudDivider with a contained
  3-mini-cloud cluster centered in a max-w-md container. Re-add at the same 5
  home-page transitions.
status: completed
priority: P3
branch: ''
tags:
  - design-system
  - decoratives
  - homepage
blockedBy: []
blocks: []
created: '2026-05-13T22:20:37.381Z'
createdBy: 'ck:plan'
source: skill
---

# Contained Cloud Dividers (Cluster Style)

## Overview

Direct iteration on the cloud divider system. Previous approach (full-width wave) felt too heavy; previous reversal (no dividers) felt too bare. This iteration adds them back as small contained cloud clusters — 3 mini cloud SVGs in a centered `max-w-md` row, low opacity.

**Source brainstorm:** `plans/reports/brainstorm-260514-0518-contained-cloud-dividers.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [CloudDivider Cluster Redesign](./phase-01-clouddivider-cluster-redesign.md) | Completed |
| 2 | [Re-add Page Placements](./phase-02-re-add-page-placements.md) | Completed |

## Execution Order

P1 → P2.

## Validation

- `pnpm typecheck` + `pnpm lint` clean
- Visual smoke after P2 (5 cluster dividers between sections)

## Out of Scope

- Hero / banner / card changes
- Other-page reuse (shop, watch, etc. — defer)
- New cloud shapes beyond MiniCloud
- SideClouds / paw decoratives

## Dependencies

None.
