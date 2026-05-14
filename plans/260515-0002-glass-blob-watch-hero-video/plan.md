---
title: Glass Blob Hero + Watch Hero Video
description: >-
  Cycle 1 of 5. Refactor FullBleedHero glass card into a mask-faded blob (Home +
  Shop). Replace Watch hero YouTube thumbnail with a local autoplay-muted-loop
  video (compressed from 90MB → ≤12MB). Schema/content/component changes wired
  through lib/content.
status: completed
priority: P2
branch: ''
tags:
  - ui
  - polish
  - hero
  - glass
  - watch
  - video
  - cycle-1
blockedBy: []
blocks: []
created: '2026-05-14T17:15:00.576Z'
createdBy: 'ck:plan'
source: skill
---

# Glass Blob Hero + Watch Hero Video

## Overview

Cycle 1 of a 5-cycle decomposition (cycles 2-5 = responsive audit, SEO audit, audit-driven fixes, YouTube API). This cycle delivers two polish items:

1. **Hero glass blob** — Restructure `FullBleedHero` desktop overlay from a rounded rectangle (border + shadow + bg-white/55) into a layered approach: outer container holds text, absolute-positioned glass blob behind with a radial mask that fades transparent at edges. Shared component → Home + Shop both benefit.
2. **Watch hero video** — Compress `assets/watch/intro.mp4` (90MB) via ffmpeg, extract poster, add optional `videoSrc`/`videoPoster` fields to the Video schema, update featured-video JSON entry, refactor `WatchHero` to conditionally render `<video autoPlay muted loop playsInline>` with poster.

Source brainstorm: `plans/reports/brainstorm-260515-0002-glass-blob-watch-hero-video.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [FullBleedHero glass blob refactor](./phase-01-fullbleedhero-glass-blob-refactor.md) | Completed |
| 2 | [Watch hero video (asset compress + schema + WatchHero)](./phase-02-watch-hero-video-asset-compress-schema-watchhero.md) | Completed |
| 3 | [Validation + visual QA](./phase-03-validation-visual-qa.md) | Completed |

## Dependencies

None. Iter-1/2/3 completed earlier this session and need no carry-over. Phases 1 and 2 are independent (different files / different concerns). Phase 3 runs last.

## Key Files

- `components/home/full-bleed-hero.tsx` — Hero overlay refactor (cycle-1, phase 1).
- `lib/content/schemas.ts` — add `videoSrc`/`videoPoster` to Video schema (phase 2).
- Featured-video JSON entry (location TBD via grep during impl, likely `content/videos.json` or similar) — add new fields.
- `components/watch/watch-hero.tsx` — conditional `<video>` render (phase 2).
- `public/assets/watch/intro.mp4` — NEW compressed asset (≤12 MB).
- `public/assets/watch/intro-poster.jpg` — NEW poster frame.

## Out of Scope

Watch page sections beyond hero, mobile hero card path, responsive/SEO audits, YouTube API integration (all later cycles).
