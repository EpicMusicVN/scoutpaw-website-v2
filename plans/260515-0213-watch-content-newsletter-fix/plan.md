---
title: Watch Content + Newsletter + Channels Fix
description: >-
  Scaffold missing /api/newsletter route (stub-mode logger). Wire 6 real YouTube
  IDs into mock dog videos. Add 4 channel entries with placeholder counts.
  Remove duration badge from Watch Hero. Verify ExploreVideos empty-state
  handling. Plus user-side reminder to upload paw-tile.svg to R2.
status: completed
priority: P2
branch: ''
tags:
  - content
  - newsletter
  - watch
  - channels
  - fix
blockedBy: []
blocks: []
created: '2026-05-14T19:24:32.608Z'
createdBy: 'ck:plan'
source: skill
---

# Watch Content + Newsletter + Channels Fix

## Overview

Mixed fix-cycle. 4 phases:
1. Scaffold the missing `/api/newsletter` route (form currently 404s).
2. Wire 6 real YouTube IDs into the top 6 dog mock videos + append 4 new channels.
3. Remove the Hero video's duration badge + verify empty-category UI is graceful.
4. Validation, including smoke-testing the newsletter POST and reminding user to upload `paw-tile.svg` to R2.

Source brainstorm: `plans/reports/brainstorm-260515-0213-watch-content-newsletter-fix.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Newsletter API scaffold](./phase-01-newsletter-api-scaffold.md) | Completed |
| 2 | [Content data (videos + channels)](./phase-02-content-data-videos-channels.md) | Completed |
| 3 | [UI tweaks (Watch hero + empty state)](./phase-03-ui-tweaks-watch-hero-empty-state.md) | Completed |
| 4 | [Validation + paw upload check](./phase-04-validation-paw-upload-check.md) | Completed |

## Dependencies

None. Phases 1–3 are independent (different files / concerns). Phase 4 runs after.

## Key Files

- NEW: `app/api/newsletter/route.ts`
- Modify: `content/videos.json`, `content/channels.json`, `components/watch/watch-hero.tsx`, `components/watch/explore-videos.tsx` (maybe).

## Out of Scope

Real ConvertKit, YouTube Data API (cycle 5), more videos beyond 6, real subscriber counts. R2 upload of `paw-tile.svg` is a user-side action — validation only verifies.
