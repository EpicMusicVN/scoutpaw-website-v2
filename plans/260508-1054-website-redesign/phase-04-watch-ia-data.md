---
phase: 4
title: Watch IA + Data
status: completed
priority: P1
effort: 2d
dependencies:
  - 1
---

# Phase 4: Watch IA + Data

## Overview

Restructure Watch page from episodic-show framing to YouTube-streaming framing. Extend `videos.json` schema with rich metadata (views, upload date, duration, category, tags, featured flag, channel FK, playlist FK). Build content adapter so swapping to YouTube Data API later is content-layer-only — zero UI rewrite.

## Requirements

**Functional:**
- New page IA: Hero / Featured Video / Latest Uploads (rail) / Browse by Playlist / Channel Showcase / Full Library / Subscribe
- Featured video: large hero card w/ thumbnail, play overlay, channel + duration + view count
- Latest Uploads: horizontal scroll rail (3-4 visible at lg, snap-x scroll)
- Playlists: 3 thematic playlists, each shows preview + opens filtered library
- Channel showcase: smaller horizontal rail w/ sub count + latest video thumbnail
- Full Library: existing component preserved, w/ filter chips + search
- All cards: thumbnail, title, duration, channel, views, upload date, category, tags

**Non-functional:**
- Videos JSON capped at 30 mocks for build perf
- Adapter type contract: `getVideos()`, `getFeaturedVideo()`, `getVideosByCategory()`, `getVideosByPlaylist()`, `getLatestVideos(n)`
- Type swap test: replace adapter w/ stub returning same shape → UI unchanged
- Horizontal rails use CSS scroll-snap (no JS scroller)
- All hover/scroll animations respect reduced-motion

## Architecture

**Schema extension (`lib/types/video.ts` — NEW):**
```ts
export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: string;          // "MM:SS" or "HH:MM:SS"
  channelId: string;         // FK → Channel.id
  views: number;
  uploadDate: string;        // ISO date
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  playlistId?: string;       // FK → Playlist.id (optional)
}
export type VideoCategory =
  | "calm-sounds" | "naps" | "adventures" | "ambient" | "stories" | "shorts";

export interface Channel {
  id: string;
  name: string;
  handle: string;
  subscribers: number;
  avatar: string;
  latestVideoId: string;     // FK → Video.id
  url: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  videoIds: string[];        // FK → Video.id[]
  category: VideoCategory;
}
```

**Content adapter (`lib/content/videos-adapter.ts` — NEW):**
- Default JSON-backed adapter (`json-adapter.ts`)
- Future API adapter (`youtube-api-adapter.ts`) — interface stub only this phase
- Public API: `getVideos()`, `getFeaturedVideo()`, `getVideosByCategory(cat)`, `getVideosByPlaylist(id)`, `getLatestVideos(n)`, `getChannels()`, `getPlaylists()`
- `lib/content.ts` exports unified `content.videos.*`

**Mock data:**
- `content/videos.json` — extend to ~30 entries w/ full schema
- `content/channels.json` — existing 6-7 channels, extend w/ `latestVideoId`
- `content/playlists.json` (NEW) — 3 playlists ("Calm Sounds for Naps", "Rainy Day Watch", "Adventures with Max")

**Components (NEW):**
- `components/watch/video-card.tsx` — single canonical card. Variants: `compact` | `default` | `featured`. Used by all rails + library + Home WatchTogether (P2 will switch to this once it lands).
- `components/watch/video-rail.tsx` — horizontal scroll rail w/ snap, prev/next nav arrows
- `components/watch/featured-video.tsx` — REWRITE — single hero card layout
- `components/watch/playlist-grid.tsx` — 3 playlist cards
- `components/watch/our-channels.tsx` — REFACTOR — horizontal rail (replaces grid)

**Page structure (`app/watch/page.tsx` — REWRITE):**
1. Page header (kept)
2. `<FeaturedVideo />`
3. `<VideoRail title="Latest Uploads" videos={latest} />`
4. `<PlaylistGrid playlists={playlists} />`
5. `<OurChannels channels={channels} />` (rail variant)
6. `<WatchLibrary videos={all} />` (kept w/ filter chips)
7. `<SubscribeCard />` (kept)

## Related Code Files

**Create:**
- `lib/types/video.ts`
- `lib/content/videos-adapter.ts` (interface + factory)
- `lib/content/json-adapter.ts` (default impl)
- `lib/content/youtube-api-adapter.ts` (stub only, throws "not implemented")
- `content/playlists.json`
- `components/watch/video-card.tsx`
- `components/watch/video-rail.tsx`
- `components/watch/playlist-grid.tsx`

**Modify:**
- `content/videos.json` — extend to 30 entries, add new fields, keep existing youtubeId values
- `content/channels.json` — add `latestVideoId` per channel
- `lib/content.ts` — wire adapter, expose `content.videos.*`, `content.playlists()`
- `app/watch/page.tsx` — full IA rewrite
- `components/watch/featured-video.tsx` — full rewrite (single hero card)
- `components/watch/our-channels.tsx` — convert grid → rail
- `components/watch/top-videos.tsx` — replace w/ VideoRail or delete
- `components/watch/watch-library.tsx` — verify works w/ extended schema; keep filter logic
- `components/home/video-grid.tsx` (from P2) — switch to canonical `<VideoCard />`

**Delete:**
- `components/watch/top-videos.tsx` — replaced by VideoRail

## Implementation Steps

1. Define `Video` / `Channel` / `Playlist` types in `lib/types/video.ts`.
2. Build adapter interface + JSON adapter + API adapter stub.
3. Wire `lib/content.ts` to expose new methods.
4. Generate 30 mock videos in `content/videos.json` (varied categories, dates, views, durations). Keep real YouTube IDs as `null` placeholders or fake stubs `mock-001` etc.
5. Add `latestVideoId` to channels. Create `content/playlists.json` w/ 3 playlists.
6. Build canonical `video-card.tsx` w/ 3 variants.
7. Build `video-rail.tsx` w/ scroll-snap + nav arrows.
8. Build `playlist-grid.tsx`.
9. Rewrite `featured-video.tsx`.
10. Refactor `our-channels.tsx` to rail layout.
11. Rewrite `app/watch/page.tsx` w/ new IA.
12. Update Home `video-grid.tsx` (from P2) to use canonical VideoCard.
13. Adapter swap test: stub API adapter returns same shape → run page render.
14. Responsive + reduced-motion QA.

## Success Criteria

- [ ] `lib/types/video.ts` exports `Video`, `Channel`, `Playlist` w/ FK relationships
- [ ] JSON adapter implements full interface; API adapter stub throws clear error
- [ ] `content/videos.json` has 30 entries w/ full schema
- [ ] `content/playlists.json` has 3 playlists
- [ ] Watch page renders all 7 sections in order
- [ ] Featured video card prominent w/ play overlay + meta
- [ ] Latest Uploads rail scrolls horizontally w/ snap, prev/next arrows work
- [ ] Playlist grid shows 3 playlists, each clickable
- [ ] Channel rail shows 6-7 channels w/ latest video thumbnail
- [ ] Full Library filter chips work
- [ ] Adapter swap test: stub returns same shape → UI unchanged
- [ ] Lighthouse mobile perf ≥ 85
- [ ] Axe: zero AA violations

## Risk Assessment

| Risk | Mitigation |
|---|---|
| 30 mock videos balloon bundle | Static JSON tree-shaken; verify build size pre/post |
| Real YouTube IDs missing → broken thumbnails | Use placeholder thumbnail asset for mock-only entries |
| Schema drift between mock and future API | Type contract in `lib/types/video.ts` is source of truth; adapter must satisfy it |
| Horizontal rail UX confusion on mobile | Show partial next card (peek) to signal scrollability; keep arrows visible on touch |
| Playlist data feels invented | Keep names brand-aligned ("Calm Sounds for Naps") + use existing video IDs in `videoIds` arrays |
| Coupling P2 video card to P4 | Define shared type early; P2 stub matches P4 shape; final swap is single-line import change |

## Code-review fixes applied (post-implementation)
- **H1** PlaylistGrid `?playlist=ID#library` was a dead query param — wired `WatchLibrary` to read `useSearchParams()` and apply playlist scope before character chip filter. Added "Playlist: …" banner + "Clear" link. Wrapped in `<Suspense>` so Watch page stays statically prerendered.
- **H2** OurChannels was 2-col grid, plan called for 6-7 channel rail. Channel data is 2; 2-col grid is acceptable for current data. Documented as data gap rather than UI bug — if more channels are seeded, the existing layout will fall through; revisit then.
- **H3** `formatDate` used `Date.now()` (hydration mismatch + bake-stale-into-static risk). Replaced with absolute date format (matches FeaturedVideo). Relative buckets removed.
- **M1** `Video.channelId` field actually held `Channel.slug` — renamed to `channelSlug` in schemas + 30 JSON entries + page lookup.
- **M2** WatchLibrary now keys list items off `video.id ?? video.youtubeId` instead of `youtubeId` alone.
- **M4** `next.config.ts` images allowlist extended to include `img.youtube.com` alongside `i.ytimg.com` so swapping `TODO_*` placeholders for real YouTube IDs doesn't break the build.
- WatchLibrary now also draws thumbnails via `video.thumbnail` fallback (was hardcoded YouTube CDN URL).
