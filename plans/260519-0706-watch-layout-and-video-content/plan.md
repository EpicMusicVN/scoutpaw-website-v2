---
title: 'Watch Page: Layout Swap + 16 New Videos'
description: >-
  Move OurChannels below WatchHero on Watch page + append 16 new videos (7 cats
  + 9 funny shorts) with WebFetch-sourced titles.
status: completed
priority: P2
branch: main
tags:
  - watch
  - content
  - layout
  - videos
blockedBy: []
blocks: []
created: '2026-05-19T00:10:33.770Z'
createdBy: 'ck:plan'
source: skill
---

# Watch Page: Layout Swap + 16 New Videos

## Overview

Two independent Watch-page changes bundled into one plan:

1. **Layout swap** — move the `OurChannels` (The Network) rail from its current low-prominence position to directly under `WatchHero`. Single block move in `app/watch/page.tsx`.
2. **Content addition** — append 16 new videos to `content/videos.json` (7 cats, 9 funny shorts). Titles scraped from YouTube via WebFetch; rest of metadata stays minimal because runtime YouTube API enrichment overlays real titles/durations/views/thumbnails when `YOUTUBE_API_KEY` is set.

**Brainstorm:** [brainstorm-260519-0706-watch-layout-and-video-content.md](../reports/brainstorm-260519-0706-watch-layout-and-video-content.md)

## Key Decisions

- New order: `Hero → OurChannels → CommunityChoice → ExploreVideos → SubscribeCard`
- Title source: WebFetch each YouTube URL, prefer `og:title` over `<title>`; fallback to `"Untitled video <youtubeId>"` if scrape fails
- `characterSlugs: []` for all 16 (no dog character maps to cat/funny content)
- `uploadDate: "2026-05-19"` for all 16
- `featured: false`, no `playlistId`, `thumbnail: "banner/banner.png"` (defaults match existing mock entries)
- Categories: `"cats"` (7) and `"funny"` (9). Do NOT use `"shorts"` category — user specified "funny" explicitly.

## Dependencies

None. Standalone iteration on the Watch page (sits on top of unstaged Resend + anti-spam + character-unscramble work).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Watch page layout reorder](./phase-01-watch-page-layout-reorder.md) | Completed |
| 2 | [Append 16 videos via WebFetch](./phase-02-append-16-videos-via-webfetch.md) | Completed |
| 3 | [Validation](./phase-03-validation.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
