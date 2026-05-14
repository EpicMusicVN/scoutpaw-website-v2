---
title: Responsive Audit (Full Website)
description: >-
  Comprehensive responsive QA pass across all 8 routes + 44 components at 7
  viewports. Hybrid methodology (code-static + browser screenshots). Produces a
  single audit report with severity-tagged findings and grouped fix
  recommendations. NO code changes in this plan — fixes happen in follow-up
  plans created post-audit.
status: completed
priority: P2
branch: ''
tags:
  - audit
  - responsive
  - qa
  - accessibility
blockedBy: []
blocks: []
created: '2026-05-11T11:21:00.053Z'
createdBy: 'ck:plan'
source: skill
---

# Responsive Audit (Full Website)

## Overview

Phase 1 of Project C. Produces a comprehensive responsive audit of every page + component at 7 viewports, with severity-tagged findings and grouped fix recommendations to seed follow-up fix plans.

**Read-only.** No source code changes in this plan. The audit consumes pages via dev server + reads component code; outputs are markdown + PNG screenshots.

Source: [`brainstorm-260511-1806-responsive-audit-and-fixes.md`](../reports/brainstorm-260511-1806-responsive-audit-and-fixes.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Code-Static Audit](./phase-01-code-static-audit.md) | Completed |
| 2 | [Browser Screenshot Pass](./phase-02-browser-screenshot-pass.md) | Completed |
| 3 | [Synthesis & Audit Report](./phase-03-synthesis-audit-report.md) | Completed |

## Pages Audited

1. `/` — Home
2. `/shop` — Shop
3. `/watch` — Watch (post-redesign double-check)
4. `/coming-soon/games` — representative of all coming-soon slugs
5. `/characters/buddy` — representative of all character slugs
6. `/privacy` — low stakes
7. `/terms` — low stakes

## Viewports

`360×640 / 390×844 / 768×1024 / 1280×800 / 1440×900 / 1920×1080 / 2560×1080`

## Out of Scope

Color contrast, ARIA semantics, focus indicators, Core Web Vitals, mobile gestures. Each handled in separate initiatives.

## Dependencies

None (cross-plan).
