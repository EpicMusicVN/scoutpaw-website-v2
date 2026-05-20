# Brainstorm — Watch Page: Layout Swap + 16 New Videos

**Date:** 2026-05-19 07:06 (Asia/Saigon)
**Branch:** main
**Scope:** Two-part Watch-page change. (1) Reorder sections — move OurChannels below WatchHero. (2) Add 16 videos (7 cats + 9 funny shorts) to `content/videos.json` with WebFetch-sourced real titles.

---

## Problem Statement

Two independent changes, both straightforward:

1. **Layout:** Current Watch page puts the "Our Channels" rail near the bottom (between Explore Videos and Subscribe). User wants it directly under the Hero — higher prominence for channel discovery.

2. **Content:** 16 new videos to add — 7 standard YouTube videos to the "cats" category, 9 YouTube Shorts to the "funny" category. User provided URLs only; need to derive metadata.

---

## Decisions Locked (User-Confirmed)

| Decision | Value |
|---|---|
| New section order | `Hero → OurChannels → CommunityChoice → ExploreVideos → SubscribeCard` |
| Title source | WebFetch each YouTube URL → scrape `<title>` / `og:title` |
| `characterSlugs[]` | `[]` for all 16 (no dog character associated with cat/funny categories) |
| `uploadDate` | `"2026-05-19"` for all 16 |
| `featured` | `false` (assumed default — matches existing mock convention) |
| `playlistId` | undefined (no playlist assignment) |
| `thumbnail` | `"banner/banner.png"` fallback (matches existing) |
| `duration` | placeholder `"0:00"` — YouTube API overlays at runtime |
| `viewCount` | `0` — YouTube API overlays at runtime |

---

## Final Solution Design

### Part 1 — Layout Swap (1 file)

**File:** `app/watch/page.tsx`

Move the OurChannels `<ScrollReveal>` block (currently between ExploreVideos and SubscribeCard) to immediately after WatchHero + CloudDivider. Adjust the CloudDivider placement so dividers still sit between sections cleanly.

**Before:**
```
WatchHero → CD → VideoRail → CD → ExploreVideos → CD → OurChannels → CD → SubscribeCard
```

**After:**
```
WatchHero → CD → OurChannels → CD → VideoRail → CD → ExploreVideos → CD → SubscribeCard
```

No prop changes, no new imports. Just block reordering. ~5 lines moved.

### Part 2 — Video Additions (1 file)

**File:** `content/videos.json`

Add 16 new entries appended to the `videos[]` array. IDs `mock-007` through `mock-022`.

**Cats category (7 entries):**

| URL | youtubeId | id |
|---|---|---|
| youtube.com/watch?v=ayxqPIdYa98 | `ayxqPIdYa98` | mock-007 |
| youtube.com/watch?v=N7AvlS0W6Ac | `N7AvlS0W6Ac` | mock-008 |
| youtube.com/watch?v=eoLL-ZhaVno | `eoLL-ZhaVno` | mock-009 |
| youtube.com/watch?v=mthN0n9_mlk | `mthN0n9_mlk` | mock-010 |
| youtube.com/watch?v=UIrDmtVms3g | `UIrDmtVms3g` | mock-011 |
| youtube.com/watch?v=Cvh_-gA1mV8 | `Cvh_-gA1mV8` | mock-012 |
| youtube.com/watch?v=wC6VN7ck4xw | `wC6VN7ck4xw` | mock-013 |

**Funny category (9 entries, all Shorts):**

| URL | youtubeId | id |
|---|---|---|
| youtube.com/shorts/kB36SetVHq8 | `kB36SetVHq8` | mock-014 |
| youtube.com/shorts/geNEFOmWNPg | `geNEFOmWNPg` | mock-015 |
| youtube.com/shorts/7jhIqI3G0pw | `7jhIqI3G0pw` | mock-016 |
| youtube.com/shorts/euCeZ6UmyMw | `euCeZ6UmyMw` | mock-017 |
| youtube.com/shorts/ENSFJx_b96Q | `ENSFJx_b96Q` | mock-018 |
| youtube.com/shorts/Lq7PY2Zq97E | `Lq7PY2Zq97E` | mock-019 |
| youtube.com/shorts/WJtWjjXau6c | `WJtWjjXau6c` | mock-020 |
| youtube.com/shorts/JxdmKG2a4pU | `JxdmKG2a4pU` | mock-021 |
| youtube.com/shorts/x3lnO0ZnVcw | `x3lnO0ZnVcw` | mock-022 |

**Per-entry schema:**
```json
{
  "id": "mock-NNN",
  "youtubeId": "<id>",
  "title": "<scraped from YouTube page>",
  "characterSlugs": [],
  "viewCount": 0,
  "duration": "0:00",
  "thumbnail": "banner/banner.png",
  "uploadDate": "2026-05-19",
  "category": "cats" | "funny",
  "tags": ["cats"] or ["funny", "shorts"],
  "featured": false
}
```

Funny shorts get `tags: ["funny", "shorts"]` so the existing `category: "shorts"` filter chip can ALSO surface them if logic allows — note this is enum-based per the file header, so verify the chip behavior before committing to dual-tagging. If category enum is strict (one value per video), Funny videos stay `category: "funny"` only.

**Funny vs Shorts category clarification needed:** `videos.json:_note` says category ∈ `{dogs, cats, shorts, funny, product-reviews, community}`. So "shorts" and "funny" are mutually exclusive category values. The user explicitly said "Funny" category — use `"funny"`. If they ALSO appear under a "Shorts" filter chip, that's a UI feature for a different field (likely `tags`).

---

## Implementation Considerations & Risks

| Risk | Mitigation |
|---|---|
| WebFetch fails on a YouTube URL (rate limit, geo block, age-gated) | Fall back to placeholder title `"YouTube Video <youtubeId>"`; flag in implementation log. User can manually fix later. |
| Scraped title is YouTube's noise (e.g., `"YouTube"` if metadata missing) | Validate scraped title is >5 chars and doesn't equal literal `"YouTube"`; fallback to placeholder if invalid. |
| Adding 16 entries to videos.json bloats it — JSON becomes ~22 entries, still small | Acceptable. No pagination concerns at this size. |
| Block-reorder breaks ScrollReveal animations or CloudDivider stacking | Visually inspect via `pnpm dev` in validation phase. No prop changes minimize risk. |
| `category: "shorts"` filter chip in ExploreVideos doesn't surface "funny" videos | Confirmed: user wants "funny" category specifically, not "shorts". Don't conflate. |
| Tag `"shorts"` could mislead the existing shorts category logic | Skip the `"shorts"` tag for funny entries to avoid ambiguity. Use only `["funny"]`. |

---

## Success Metrics

- ✅ Watch page renders with OurChannels directly below WatchHero (visual check)
- ✅ `content/videos.json` parses; total entries = 22 (6 existing + 16 new)
- ✅ All 16 new entries have valid `youtubeId`, `category` of `"cats"` or `"funny"`, and a non-placeholder title
- ✅ ExploreVideos "Cats" filter chip shows 7 new entries
- ✅ ExploreVideos "Funny" filter chip shows 9 new entries
- ✅ `pnpm typecheck` + `pnpm lint` + `pnpm build` pass
- ✅ No regression: existing 6 mock videos still render correctly

---

## Next Steps

1. User approves plan creation
2. Plan creates 3 phases:
   - Phase 1: Watch page layout reorder
   - Phase 2: WebFetch titles + append 16 entries to videos.json
   - Phase 3: Validation (typecheck, lint, build, smoke test filter chips)
3. `/ck:cook --auto` to execute

---

## Unresolved Questions

- If WebFetch hits an age-gated video, what title to use? (Recommend: `"Untitled cat video <youtubeId>"` as a flagged placeholder)
- Should real `duration` and `viewCount` be scraped too, or trust YouTube API to overlay? (Recommend: leave placeholders; YouTube API handles)
- Should `playlistId` be auto-assigned (e.g., funny → existing `pl-shorts` if it exists)? Plan says no, but worth confirming if there's a playlist file with relevant IDs.
