---
title: Watch Redesign + Compact Channels
description: >-
  Redesign Watch page to streaming-platform feel per reference images. New
  WatchHero + ExploreVideos library + compact OurChannels rail. Schema split
  (VideoContentSchema for videos, PlaylistCategorySchema for playlists).
status: completed
priority: P2
branch: ''
tags:
  - ui
  - redesign
  - watch
  - schema-migration
blockedBy: []
blocks: []
created: '2026-05-11T10:32:56.017Z'
createdBy: 'ck:plan'
source: skill
---

# Watch Redesign + Compact Channels

## Overview

Modernize the Watch page based on `assets/demo-watch/{1,2}.jpg` references. Build a cinematic hero combining featured video + tagline + character cluster + "Join ScoutPaw World!" CTA. Replace flat library with curated `ExploreVideos` (filter chips + mixed grid). Compact `OurChannels` into a horizontal scroll rail (5-6 visible). Split video/playlist category axes cleanly.

Source: [`brainstorm-260511-1719-watch-redesign-and-compact-channels.md`](../reports/brainstorm-260511-1719-watch-redesign-and-compact-channels.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Schema Split & Retag](./phase-01-schema-split-retag.md) | Completed |
| 2 | [WatchHero](./phase-02-watchhero.md) | Completed |
| 3 | [ExploreVideos](./phase-03-explorevideos.md) | Completed |
| 4 | [Compact Channels Rail](./phase-04-compact-channels-rail.md) | Completed |
| 5 | [Page Wiring & Cleanup](./phase-05-page-wiring-cleanup.md) | Completed |

## Key Dependencies

- Reference images: `assets/demo-watch/1.jpg`, `assets/demo-watch/2.jpg`
- Phase 1 must complete before Phase 3 (ExploreVideos consumes `VideoContentSchema`)
- Phases 2 + 4 can run in parallel with 3 (independent components)
- Phase 5 must run last (orchestration + deprecation)

## Dependencies

None (cross-plan).
