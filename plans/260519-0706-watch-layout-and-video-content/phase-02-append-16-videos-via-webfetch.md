---
phase: 2
title: Append 16 videos via WebFetch
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 2: Append 16 videos via WebFetch

## Overview

WebFetch each of the 16 YouTube URLs to scrape its title, then append 16 entries to `content/videos.json` (`mock-007` through `mock-022`). All entries get minimal metadata; runtime YouTube API enrichment overlays real titles/durations/views/thumbnails when `YOUTUBE_API_KEY` is set.

## Requirements

- Functional:
  - 7 cats entries (`category: "cats"`, `tags: ["cats"]`)
  - 9 funny entries (`category: "funny"`, `tags: ["funny"]`)
  - Real titles scraped from YouTube `og:title` or `<title>` meta
  - All entries valid against `lib/content/schemas.ts`
- Non-functional:
  - Preserve existing 6 mock entries (mock-001 through mock-006) unchanged
  - Don't use `"shorts"` category — user explicitly said "funny"

## Architecture

### Video URL → ID extraction

| URL pattern | youtubeId |
|---|---|
| `youtube.com/watch?v=ID` | path's `v` query param |
| `youtube.com/shorts/ID` | last path segment before `?` |

### Title scraping strategy

For each URL:
1. WebFetch `https://www.youtube.com/watch?v=<youtubeId>` (use canonical watch URL even for Shorts; YouTube serves the same metadata)
2. Parse response for `<meta property="og:title" content="...">` (preferred — clean title without `" - YouTube"` suffix)
3. Fall back to `<title>...</title>` if og:title missing
4. Strip trailing `" - YouTube"` if present
5. Validate: length > 5 chars AND not literal `"YouTube"` → accept
6. Otherwise fall back to `"Untitled video <youtubeId>"`

### Append pattern

Insert new entries at the END of `videos[]` array. Increment from `mock-007`.

## Related Code Files

- Modify: `content/videos.json`

## Implementation Steps

1. **Scrape titles** — WebFetch all 16 URLs; collect title-by-youtubeId mapping

   Cats URLs:
   - https://www.youtube.com/watch?v=ayxqPIdYa98
   - https://www.youtube.com/watch?v=N7AvlS0W6Ac
   - https://www.youtube.com/watch?v=eoLL-ZhaVno
   - https://www.youtube.com/watch?v=mthN0n9_mlk
   - https://www.youtube.com/watch?v=UIrDmtVms3g
   - https://www.youtube.com/watch?v=Cvh_-gA1mV8
   - https://www.youtube.com/watch?v=wC6VN7ck4xw

   Funny shorts URLs (use canonical watch URL form for WebFetch):
   - https://www.youtube.com/watch?v=kB36SetVHq8
   - https://www.youtube.com/watch?v=geNEFOmWNPg
   - https://www.youtube.com/watch?v=7jhIqI3G0pw
   - https://www.youtube.com/watch?v=euCeZ6UmyMw
   - https://www.youtube.com/watch?v=ENSFJx_b96Q
   - https://www.youtube.com/watch?v=Lq7PY2Zq97E
   - https://www.youtube.com/watch?v=WJtWjjXau6c
   - https://www.youtube.com/watch?v=JxdmKG2a4pU
   - https://www.youtube.com/watch?v=x3lnO0ZnVcw

2. **Build the 16 entries** with this template:
   ```json
   {
     "id": "mock-NNN",
     "youtubeId": "<id>",
     "title": "<scraped or fallback>",
     "characterSlugs": [],
     "viewCount": 0,
     "duration": "0:00",
     "thumbnail": "banner/banner.png",
     "uploadDate": "2026-05-19",
     "category": "cats" | "funny",
     "tags": ["cats"] or ["funny"],
     "featured": false
   }
   ```
   Omit `playlistId` field entirely (matches existing entries that don't have it).

3. **Append to `content/videos.json`** — insert all 16 entries between the closing `]` of mock-006 and the array closer. Maintain valid JSON (trailing comma rules).

4. **Verify** — `pnpm typecheck` (catches schema violations via `lib/content/schemas.ts`).

## Success Criteria

- [ ] WebFetch produced a non-trivial title for ≥14 of 16 URLs (allow up to 2 fallbacks for age-gated / unavailable videos)
- [ ] `content/videos.json` now has 22 entries total
- [ ] All 7 cats entries have `category: "cats"`
- [ ] All 9 funny entries have `category: "funny"`
- [ ] Zero `category: "shorts"` for funny entries
- [ ] `pnpm typecheck` passes (schema validation)

## Risk Assessment

- **Risk:** WebFetch fails on a URL (rate-limit, geo-block, age-gate)
  - **Mitigation:** Fall back to `"Untitled video <youtubeId>"`; log fallbacks during implementation. User can fix later. ≤2 fallbacks acceptable per success criteria.
- **Risk:** Scraped title contains HTML entities (`&amp;`, `&#39;`)
  - **Mitigation:** Decode common entities (`&amp;` → `&`, `&#39;` → `'`, `&quot;` → `"`) before writing to JSON
- **Risk:** JSON syntax break (trailing comma, missing bracket)
  - **Mitigation:** `pnpm typecheck` catches it; Write the full updated file (not incremental edits) to avoid bracket mismatch
- **Risk:** Duplicate youtubeId with existing mock entries
  - **Mitigation:** Existing entries use IDs like `4Fgl_dW3vgA`, `X19MapswOQs`, etc. New IDs are distinct. Verified visually.

## Security Considerations

- WebFetch on YouTube URLs only — no untrusted endpoints
- Scraped titles inserted into JSON as string values — no code execution path
