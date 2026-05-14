---
type: brainstorm
date: 2026-05-11
slug: watch-redesign-and-compact-channels
status: approved
next: ck:plan
references:
  - assets/demo-watch/1.jpg
  - assets/demo-watch/2.jpg
---

# Brainstorm — Watch Redesign + Compact Channels (Project A)

## Problem

Current Watch page (post-260511-0205 polish) reads as a vertical scroll of mixed components. User wants modern streaming/YouTube-platform feel per reference images:
- Cinematic hero with featured video + tagline + character cluster + "Join World" CTA
- "Community Choice to Watch" video thumbnail row
- "Explore Videos" library with category filter sidebar + mixed-size grid
- The Network / Our Channels — compact, 5-6 visible

## Reference Material

- `assets/demo-watch/1.jpg` — hero: tagline left, large video center, characters around, CTA + 5-thumb row below
- `assets/demo-watch/2.jpg` — Explore Videos: left sidebar filter chips (All/Dogs/Cats/Shorts/Funny/Product reviews/Community) + mixed grid (2 large + smaller thumbnails)

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hero video | Static thumb + play overlay (not iframe autoplay) | Lightweight, fast LCP, no cookie/a11y complications |
| OurChannels compact | Horizontal scroll rail w/ chevrons | Scales to N channels; matches existing VideoRail pattern |
| Filter categories | Rename approach — split into VideoContentSchema (new content axis) + PlaylistCategorySchema (renamed existing) | Honors intent without breaking playlist data integrity |
| PlaylistGrid | Drop entirely | Not in reference; ExploreVideos serves browse purpose |

## Schema Coupling Discovered

`VideoCategorySchema` is **used by both** `VideoSchema.category` AND `PlaylistSchema.category` (required field). Pure rename breaks playlist parsing.

Resolution: **Clean split**
1. `VideoCategorySchema` → rename to `PlaylistCategorySchema` (values unchanged: `calm-sounds, naps, adventures, ambient, stories, shorts`)
2. NEW `VideoContentSchema`: `dogs, cats, shorts, funny, product-reviews, community`
3. `VideoSchema.category` → use `VideoContentSchema` (optional)
4. Re-tag `videos.json` category fields (mock data; sensible defaults)
5. `playlists.json` untouched

## File-Level Design

### NEW
- `components/watch/watch-hero.tsx` — Combined hero: tagline (left) + featured video w/ play overlay (center) + character cluster (right + bottom-left) + "Join ScoutPaw World!" CTA (scrolls to `#channels`)
- `components/watch/explore-videos.tsx` — Filter chips (client-state) + mixed grid (2 large featured + 6 small) + "See more on YouTube" external link

### MODIFY
- `app/watch/page.tsx` — new section order: WatchHero → VideoRail "Community Choice" → ExploreVideos → OurChannels → SubscribeCard
- `components/watch/our-channels.tsx` — horizontal scroll rail; smaller cards (avatar + name + sub count + thumb + subscribe button); section gets `id="channels"`
- `lib/content/schemas.ts` — split enums + new VideoContentSchema
- `content/videos.json` — re-tag category fields

### DEPRECATE (file kept, JSDoc)
- `components/watch/featured-video.tsx` — folded into WatchHero
- `components/watch/playlist-grid.tsx` — dropped from page

### Final Watch Page Layout
```
WatchHero
  └ left: tagline + CTA
  └ center: featured video (current FeaturedVideo pattern, enlarged)
  └ right + bottom-left: 3-4 character images
VideoRail "Community Choice to Watch" (top videos by viewCount; featured fallback)
ExploreVideos
  └ filter chips: All / Dogs / Cats / Shorts / Funny / Product Reviews / Community
  └ grid: 2 large featured (2-col md+) + 6 small (3-col md+ / 2-col sm / 1-col mobile)
  └ "See more on YouTube" button → external
OurChannels (compact horizontal rail w/ chevrons)
SubscribeCard
```

## Risks

| Risk | Mitigation |
|------|------------|
| Re-tagging videos.json is judgment-based | Mock data; bulk-update with sensible defaults per title pattern |
| Filter state lost on refresh | Acceptable v1; add URL params later if needed |
| Character cluster overflow on mobile | Hide all but 1 character `<md`; full cluster `md+` |
| FeaturedVideo deprecation breaks if other consumers | Grep first; mark @deprecated, retain file |
| Schema rename breaks imports of `VideoCategorySchema` | Grep all references; update at same time |
| "Community Choice" needs viewCount sort but some videos lack it | Sort by viewCount desc; featured flag as tiebreaker; fall back to latest if neither present |

## Implementation Phases (for /ck:plan)

1. **Schema split + data retagging** — schemas.ts + videos.json. Lowest risk, foundational.
2. **WatchHero component** — new file with tagline + video + characters + CTA.
3. **ExploreVideos component** — new file with filter chips + mixed grid.
4. **OurChannels compact rewrite** — horizontal scroll rail; add `id="channels"` anchor.
5. **Page wiring + cleanup** — update app/watch/page.tsx, deprecate FeaturedVideo + PlaylistGrid.
6. **Verification** — build, lint, typecheck, manual responsive QA at 360/768/1280/1920.

## Success Metrics

- Hero feels cinematic; video + characters + tagline + CTA visible above the fold on 1080p
- "Community Choice" rail surfaces top-N videos with horizontal scroll
- ExploreVideos filter responds in <50ms; "All" default; chip count = 7 (incl. All)
- OurChannels: 5-6 cards visible on 1440 desktop, 3-4 on tablet, scrollable
- All existing data (channels, characters, playlists) intact
- Build / lint / typecheck ✔
- /watch route bundle increase ≤ +2KB after gzip

## Unresolved Questions

- None. All design decisions locked.
