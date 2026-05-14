---
title: YouTube Data API Integration
description: >-
  Cycle 5 of 5. Dynamic YouTube Data API v3 integration for channel
  logos/names/sub counts + video titles/thumbnails/durations. Server-side fetch
  with 1hr revalidate. JSON fallback when API key empty or call fails.
  Component-transparent via enrichment helpers.
status: completed
priority: P2
branch: ''
tags:
  - youtube
  - api
  - integration
  - watch
  - dynamic-data
  - cycle-5
blockedBy: []
blocks: []
created: '2026-05-14T19:52:10.112Z'
createdBy: 'ck:plan'
source: skill
---

# YouTube Data API Integration

## Overview

Final cycle of the 5-cycle decomposition. Replaces hardcoded JSON titles/thumbnails/durations/avatars with live YouTube Data API v3 fetches. Server-side, cached 1hr, with JSON fallback so the site never breaks when API key is missing or call fails.

Source brainstorm: `plans/reports/brainstorm-260515-0243-youtube-data-api-integration.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [API client + helpers + env + next.config](./phase-01-api-client-helpers-env-next-config.md) | Completed |
| 2 | [Schema + channels.json + videos.json data](./phase-02-schema-channels-json-videos-json-data.md) | Completed |
| 3 | [Page enrichment + components + empty states](./phase-03-page-enrichment-components-empty-states.md) | Completed |
| 4 | [Validation (with + without API key)](./phase-04-validation-with-without-api-key.md) | Completed |

## Dependencies

None. Phase 1 lays the API layer foundation; phase 2 sets up data shape; phase 3 wires it through. Phase 4 verifies both API-on and API-off paths.

## Key Files

**NEW:**
- `lib/youtube/{client,types,duration,enrich}.ts`

**Modify:**
- `.env` + `.env.local.example` (YOUTUBE_API_KEY)
- `next.config.ts` (yt3 hostnames)
- `lib/content/schemas.ts` (ChannelSchema: avatarUrl + youtubeChannelId, relax bannerColor)
- `content/channels.json` (drop 2 mocks, add 4 youtubeChannelIds)
- `content/videos.json` (drop dangling channelSlug refs)
- `app/watch/page.tsx` (enrichment wiring)
- `components/watch/our-channels.tsx` (use avatarUrl)
- `components/watch/explore-videos.tsx` (empty-state copy)
- `components/watch/video-rail.tsx` (empty-state placeholder)

## Out of Scope

Deferred cycles 2-4 (responsive audit, SEO audit, fixes). Live ConvertKit. OAuth for owned channels.
