---
phase: 3
title: ExploreVideos Component
status: completed
priority: P2
effort: 1.5h
dependencies:
  - 1
---

# Phase 3: ExploreVideos Component

## Overview

Build a curated video library section with category filter chips + mixed-size grid (2 large featured + 6 small) + "See more on YouTube" external link. Replaces the previously removed flat `WatchLibrary` with a more designed, streaming-platform feel.

Reference: `assets/demo-watch/2.jpg`

Depends on Phase 1 (VideoContentSchema must exist before chips can filter).

## Requirements

**Functional**
- Props: `{ videos: Video[], youtubeChannelUrl: string }`
- Filter chips at top: `All / Dogs / Cats / Shorts / Funny / Product Reviews / Community`
- Client-side filter via `useState<VideoContent | "all">("all")`
- Active chip visually distinct
- Grid: 2 large featured (top viewed in current filter) + 6 small thumbnails below
- Each tile links externally to `https://www.youtube.com/watch?v={youtubeId}` (new tab, rel noopener)
- "See more on YouTube" button at bottom links to `youtubeChannelUrl`
- Empty state when no videos match filter

**Non-functional**
- Client component (`"use client"`) — needs useState
- Filter response < 50ms (in-memory array filter)
- Responsive grid: 1-col mobile, 2-col tablet (small), 3-col desktop (small); 2 large always 2-col md+, stacked mobile

## Architecture

Single-file client component. State held locally (no URL params for v1 — matches reference UX). Empty state matches existing pattern. Friendly category labels via `VIDEO_CONTENT_LABELS` map.

## Related Code Files

**Create**
- `components/watch/explore-videos.tsx`

**Read for reference**
- `components/watch/video-rail.tsx` — card style + thumbnail pattern
- `components/shop/product-grid.tsx` — filter chip pattern (if relevant)
- `lib/content/schemas.ts` — Video type + new VideoContent enum

## Implementation Steps

1. Create `components/watch/explore-videos.tsx`. Add `"use client"` directive.

2. Define labels map:
   ```ts
   const VIDEO_CONTENT_LABELS: Record<VideoContent, string> = {
     dogs: "Dogs",
     cats: "Cats",
     shorts: "Shorts",
     funny: "Funny",
     "product-reviews": "Product Reviews",
     community: "Community",
   };
   ```

3. Filter chip row: render `"All"` + each `VIDEO_CONTENTS` entry as chip. Active state styled with `bg-ink text-surface`; inactive `bg-surface text-ink/85 hover:bg-honey/30`.

4. Compute filtered videos:
   ```ts
   const filtered = useMemo(() => {
     if (active === "all") return videos;
     return videos.filter((v) => v.category === active);
   }, [active, videos]);
   ```

5. Sort by `viewCount` desc (featured tiebreaker, then upload date):
   ```ts
   const sorted = [...filtered].sort((a, b) => {
     const va = a.viewCount ?? 0;
     const vb = b.viewCount ?? 0;
     if (vb !== va) return vb - va;
     if (b.featured !== a.featured) return Number(b.featured) - Number(a.featured);
     return (b.uploadDate ?? "").localeCompare(a.uploadDate ?? "");
   });
   ```

6. Split: `large = sorted.slice(0, 2)`, `small = sorted.slice(2, 8)`.

7. Grid layout:
   ```tsx
   <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
     {large.map(v => <LargeVideoCard key={v.youtubeId} video={v} />)}
   </ul>
   <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-8 lg:grid-cols-3">
     {small.map(v => <SmallVideoCard key={v.youtubeId} video={v} />)}
   </ul>
   ```

8. `LargeVideoCard`: aspect-video thumb + play overlay + title + channel name + view count + duration badge.

9. `SmallVideoCard`: compact aspect-video thumb + title (line-clamp-2) + view count.

10. Empty state when `sorted.length === 0`:
    ```tsx
    <p className="text-center text-ink/65">No videos in this category yet — try "All".</p>
    ```

11. "See more" button at section bottom:
    ```tsx
    <div className="mt-10 flex justify-center">
      <Link href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="...rounded-full bg-ink text-surface...">
        See more on YouTube →
      </Link>
    </div>
    ```

12. Verify `pnpm run build && pnpm run typecheck && pnpm run lint` pass.

## Todo List

- [ ] Component scaffold w/ "use client"
- [ ] VIDEO_CONTENT_LABELS map
- [ ] Filter chip row with active state
- [ ] useState + useMemo filter logic
- [ ] Sort by viewCount → featured → uploadDate
- [ ] LargeVideoCard (2-up)
- [ ] SmallVideoCard (3-up md+)
- [ ] Empty state
- [ ] "See more on YouTube" CTA
- [ ] Responsive: mobile / tablet / desktop tested

## Success Criteria

- [ ] All 7 chips render
- [ ] Clicking chip filters grid; "All" returns all videos
- [ ] Top 2 videos appear in large grid; next 6 in small grid
- [ ] All thumbnail links open external YouTube in new tab
- [ ] Empty-state message shown when filter has no matches
- [ ] Build / typecheck / lint pass

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Many videos lack `category` post-Phase 1 retag | Show only categorized ones in filter; "All" still shows all videos |
| Filter state lost on refresh | Acceptable v1; can add `?cat=` later |
| Videos with `viewCount` undefined sort to bottom | Use `?? 0` fallback in sort comparator |
| Small grid (3-up) breaks rhythm if `sorted.length < 8` | Just render what we have; CSS grid handles gracefully |
