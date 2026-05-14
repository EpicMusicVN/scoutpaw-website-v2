# Brainstorm — ExploreVideos Carousel Refactor

**Date:** 2026-05-15 03:45 (Asia/Saigon)
**Scope:** Convert `ExploreVideos` from grid (2 large + 6 small) to a horizontal scroll-snap rail matching `VideoRail`. Native swipe + arrow nav. Full replacement.
**Status:** Design agreed — awaiting implementation.

The rest of the user's prompt (dynamic API, channel logos, sub counts, NO VIDEOS pill, mock cleanup) is already shipped across cycles 5 + the recent polish/cleanup passes. This is the ONLY actionable item.

---

## 1. Problem Statement

`ExploreVideos` currently renders filter chips + a static two-tier grid (2 large cards on top, up to 6 small below). User wants a horizontal slider/carousel with streaming-platform vibes — matching the `VideoRail` (Community Choice) pattern already in the codebase.

---

## 2. Decisions Locked

| Question | Choice |
|----------|--------|
| Carousel approach | Reuse VideoRail's native scroll-snap + nav arrows. No new deps. |
| Navigation | Arrows only (hide at scroll ends). Native swipe on mobile. |
| Grid fate | Full replacement. Drop large/small distinction. |

---

## 3. Final Design

### 3.1 Markup change

`components/watch/explore-videos.tsx` — replace the existing grid block (currently around lines 80-110 with `<ul>` containing LargeVideoCard + SmallVideoCard) with a scroll-snap rail inline-equivalent to VideoRail.

**Pseudo:**

```jsx
{sorted.length === 0 ? (
  /* Existing "No Videos" pill — keep */
  <div className="mt-12 flex justify-center">
    <span className="inline-flex items-center rounded-full border border-ink/10 bg-surface px-5 py-2 font-display text-sm font-bold uppercase tracking-wider text-ink/65">
      No Videos
    </span>
  </div>
) : (
  <div className="relative mt-10 md:mt-12">
    <NavArrow direction="left" visible={canScrollLeft} onClick={...} />
    <NavArrow direction="right" visible={canScrollRight} onClick={...} />
    <ul
      ref={trackRef}
      className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8"
      aria-label="Explore videos rail"
    >
      {sorted.map((v) => (
        <li
          key={v.id ?? v.youtubeId}
          className="w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[32%] lg:w-[26%]"
        >
          <VideoCard video={v} variant="default" />
        </li>
      ))}
    </ul>
  </div>
)}
```

Plus the scroll state hooks (canScrollLeft/canScrollRight) + `scrollByCard()` from VideoRail.

### 3.2 Drop LargeVideoCard / SmallVideoCard

If `LargeVideoCard` and `SmallVideoCard` are defined inside `explore-videos.tsx` and used only here, they can be deleted (or kept dormant for re-enabling later — YAGNI says delete).

Verify during implementation:
- If they're used elsewhere → keep.
- If unique to ExploreVideos → delete.

### 3.3 Reuse VideoCard

Use the shared `VideoCard` component (already used by VideoRail). Consistent card render across rails. Pass `variant="default"` for the standard card size.

### 3.4 Scroll state hooks

Inline the same `useRef` + scroll listeners + `useEffect` that VideoRail uses. The hooks are tiny (~15 LOC); inlining avoids premature abstraction. If a third consumer appears later, extract a shared `useScrollRail` hook then.

### 3.5 NavArrow

VideoRail's `NavArrow` function component is defined locally in that file (lines ~120-155). Two options:
- **Duplicate** the function in explore-videos.tsx (KISS, simple)
- **Export** from video-rail.tsx + import here (slight coupling)
- **Extract** to a shared file (over-engineered for two usages)

Going with **duplicate** for now. It's ~15 LOC and stable.

### 3.6 Header unchanged

The kicker + h1 + description + filter chips at the top of ExploreVideos stay as-is. Only the result rendering switches from grid to rail.

---

## 4. Files Touched

- Modify: `components/watch/explore-videos.tsx` (replace grid with rail + scroll state + NavArrow duplicate)

That's it. Single file.

---

## 5. Risks / Concerns

1. **Lost prominence for "featured" videos** — the large card used to highlight the top 2 by `featured` + viewCount. Rail treats all videos uniformly. Acceptable per user's "modern/streaming-platform" goal — Netflix-style rails don't elevate single tiles.
2. **Filter chip switch re-renders rail** — `useMemo` already sorts by `active`. Trigger should be smooth; scroll position resets to 0 on category change (expected UX).
3. **Mobile swipe vs vertical scroll conflict** — native scroll-snap handles this; swiping horizontally on the rail doesn't trigger page vertical scroll. Verified in VideoRail.
4. **Rail width on small viewports** — `w-[78%]` on mobile means 1 card visible at a time with peek. Matches VideoRail. Acceptable.
5. **`use client` already declared** — `ExploreVideos` is already `"use client"` for the filter state, so useRef + useEffect work without changes.

---

## 6. Success Criteria

- `ExploreVideos` renders a horizontal scroll-snap rail below the filter chips.
- Native swipe works on mobile.
- Arrow buttons appear/hide based on scroll position.
- Filter chip click switches the rail's video list smoothly.
- Empty category still shows the "No Videos" pill.
- `pnpm typecheck` + `pnpm lint` clean.
- LargeVideoCard/SmallVideoCard deleted if previously local-only.

---

## 7. Out of Scope

Everything from the user's prompt EXCEPT the carousel conversion is already shipped:
- Mockup video removal — done (kept only 6 real ID videos).
- API-fetched titles/thumbnails — done (enrichVideos).
- Channel logos/names/sub counts — done (enrichChannels).
- "NO VIDEOS" pill — done.
- Service layer + env + types — done (cycle 5).

---

## 8. Open Questions

_None — all locked._
