---
phase: 4
title: Compact Channels Rail
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 4: Compact Channels Rail

## Overview

Rewrite `OurChannels` from full-width 2-column big-card grid to a horizontal scroll rail with smaller cards. Goal: 5-6 channels visible on desktop without dominating the page. Add `id="channels"` anchor so the Hero CTA "Join ScoutPaw World!" can scroll-target it.

## Requirements

**Functional**
- Section gets `id="channels"` for anchor target
- Horizontal scrollable rail with chevron buttons (left/right) on desktop
- Cards smaller than current (~220-260px wide)
- Each card: small thumbnail/banner-color block + avatar circle + name + sub count + small latest-video thumb peek + subscribe link
- 5-6 cards visible at 1440 viewport; user scrolls/swipes for more

**Non-functional**
- Touch-swipe on mobile (native scroll-snap)
- Chevron buttons hidden when at scroll edges
- Maintains current props: `{ channels, characters, videos }`
- Preserve "The Network" kicker + "Our Channels." h2

## Architecture

Reuse the chevron + scroll-snap pattern from existing `VideoRail`. Reduce per-card chrome:
- Drop the giant subscribe button — replace with small "Subscribe" pill + YouTube mark
- Drop tagline (or line-clamp to 1 line)
- Drop video count text (keep only sub count for density)

## Related Code Files

**Modify**
- `components/watch/our-channels.tsx`

**Read for reference**
- `components/watch/video-rail.tsx` — scroll-snap + NavArrow + canScrollLeft/Right state pattern

## Implementation Steps

1. Convert `OurChannels` to client component (`"use client"`) since the rail needs scroll state for chevron visibility.

2. Add `id="channels"` to the outer `<section>` and `scroll-mt-24` for the navbar offset.

3. Rebuild the rail:
   ```tsx
   <div className="relative">
     <NavArrow direction="left" visible={canScrollLeft} onClick={() => scrollByCard(-1)} />
     <NavArrow direction="right" visible={canScrollRight} onClick={() => scrollByCard(1)} />
     <ul ref={railRef} onScroll={updateScrollState}
         className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 md:gap-6">
       {channels.map((c) => (
         <li key={c.slug} className="snap-start shrink-0 w-[220px] md:w-[260px]">
           <CompactChannelCard ... />
         </li>
       ))}
     </ul>
   </div>
   ```

4. `CompactChannelCard`:
   - 220-260px wide
   - Top: banner-color block (h-24) with avatar circle overlapping bottom edge + character peek (small)
   - Middle: name (text-base font-bold), `formatSubs(subs) + " subs"` (text-xs)
   - Optional: small latest-video thumb (h-20, aspect-video)
   - Bottom: "Subscribe" pill with YouTube mark (small, rounded-full bg-ink text-surface)
   - Whole card is a `<Link>` to `channel.url` (external)

5. Port the NavArrow + scrollByCard helpers from `VideoRail` (extract to a small helper, or inline). YAGNI: inline duplicate is OK for now.

6. Visibility logic: `canScrollLeft` true when `scrollLeft > 0`; `canScrollRight` true when `scrollLeft + clientWidth < scrollWidth - 8`.

7. Remove the previous wide 2-col grid layout entirely.

8. Build + lint + typecheck.

## Todo List

- [ ] Add `"use client"`
- [ ] Add `id="channels"` + `scroll-mt-24`
- [ ] Rail with snap-mandatory + scroll-smooth
- [ ] CompactChannelCard (220-260px)
- [ ] NavArrow chevrons + scrollByCard
- [ ] canScrollLeft/Right state
- [ ] Subscribe pill
- [ ] Verify build / typecheck / lint
- [ ] Manual test: chevrons hide at edges; swipe works on mobile

## Success Criteria

- [ ] 5-6 cards visible at 1440 desktop without scrolling
- [ ] Smooth scroll snap on chevron click
- [ ] Touch-swipe works on mobile (native)
- [ ] `#channels` anchor target works
- [ ] No console errors

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Rail logic duplicated with VideoRail | Acceptable v1; extract shared hook later if 3rd rail appears |
| Subscribe pill collides with thumb on small width | Test at 220px; fallback to stack inside card |
| Anchor scroll offset wrong due to sticky nav | `scroll-mt-24` matches site convention |
| Refs/state hydration mismatch | Use refs + onScroll; no SSR-only logic |
