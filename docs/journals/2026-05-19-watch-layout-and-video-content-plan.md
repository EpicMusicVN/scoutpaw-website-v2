# Watch Page Layout Reorder + 16 New Videos

**Date**: 2026-05-19 07:06
**Severity**: Medium
**Component**: Watch page layout, video content library
**Status**: Planned

## What Happened

User bundled two independent Watch-page improvements into one session:
1. Move `OurChannels` section from mid-page (between `ExploreVideos` and `SubscribeCard`) directly under `WatchHero`
2. Ingest 16 new YouTube videos: 7 in `cats` category, 9 in `funny` category (YouTube Shorts format)

## The Brutal Truth

The requests are straightforward on their face — one is a five-line reorder in JSX, the other is JSON append. But the video content step exposes a structural gap: we're shipping mock metadata (title, upload date, duration, views) without a runtime enrichment story. The plan backfills this by scraping YouTube `og:title` at prep time and allowing YouTube API enrichment later, but it means the JSON we commit will have placeholder `uploadDate: "2026-05-19"` and generic `thumbnail: "banner/banner.png"`. This is fine for dev/QA filters, awkward in production without the API key running.

## Technical Details

**Layout swap:** `app/watch/page.tsx` moves three JSX lines:
- `<OurChannels />` block (itself ~3-4 lines including wrapper)
- From: between `ExploreVideos` and `SubscribeCard`
- To: immediately after `WatchHero`

**Video content:** 16 new entries for `content/videos.json`:
- **URLs provided by user** (no metadata, raw YouTube links):
  - 7 cats videos: YouTube watch links
  - 9 funny videos: YouTube Shorts links (format: `youtube.com/shorts/...`)
- **Metadata strategy:**
  - Title: WebFetch each URL → parse `og:title` meta tag (fallback: `<title>`, final fallback: `"Untitled video <youtubeId>"`)
  - `uploadDate`: hardcoded `"2026-05-19"` (today) for all entries
  - `characterSlugs`: empty array `[]` (no cat characters in `characters.json`; funny shorts don't map to specific characters)
  - `featured`: `false`
  - `playlistId`: omitted (defaults to null in schema)
  - `thumbnail`: `"banner/banner.png"`
  - `category`: explicitly `"cats"` or `"funny"` (NOT using `"shorts"` enum value; "shorts" and "funny" are orthogonal axes)

**Acceptance criteria:** ≥14 of 16 titles must be successfully scraped (allows up to 2 failures for age-gated/unavailable videos).

**Entry naming:** Mock videos numbered `mock-007` through `mock-022` (appended to existing mock-001..mock-006).

## What We Tried

No implementation attempted this session. Planning only.

## Root Cause Analysis

N/A — this is planned work, not a failure recovery.

## Lessons Learned

1. **Mock-to-production gap:** Committing placeholder metadata (generic dates, thumbnail paths) in JSON requires runtime enrichment to be viable for real users. The YouTube API enrichment pattern in `lib/youtube/enrich.ts` exists for a reason — document this explicitly so future maintainers don't ship mock data thinking it's production-ready.

2. **Category schema clarity:** The enum values `{dogs, cats, shorts, funny, product-reviews, community}` conflate format (shorts) with content (funny). User instinct to use `"funny"` for YouTube Shorts was correct; future schema work should separate "format" from "genre."

3. **WebFetch fallback tolerance:** Accepting 2 failures (≥14 of 16 scraped) is pragmatic. Document *which* videos failed scraping in the commit message so QA/PM know which entries are guaranteed unfresh.

## Next Steps

1. **Phase 1 (5 min):** Reorder `OurChannels` block in `app/watch/page.tsx`
2. **Phase 2 (15 min):** WebFetch 16 titles, append to `content/videos.json` as mock-007..mock-022
3. **Phase 3 (15 min):** Typecheck, lint, build, dev smoke test (filter chips, layout visual confirm)

All phases delegable as single implementation task. No blocking dependencies.
