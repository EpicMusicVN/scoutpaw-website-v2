---
phase: 2
title: WatchHero Component
status: completed
priority: P2
effort: 1.5h
dependencies: []
---

# Phase 2: WatchHero Component

## Overview

Create new `WatchHero` component combining the page tagline, featured video (with play overlay), character cluster, and "Join ScoutPaw World!" CTA. Replaces the current page header + FeaturedVideo split with a single cinematic above-the-fold block.

Reference: `assets/demo-watch/1.jpg`

## Requirements

**Functional**
- Props: `{ featured: Video, channel?: Channel, characters: Character[], youtubeChannelUrl: string }`
- Layout: tagline + CTA on left, large featured-video thumb with centered play overlay in middle, 3-4 character images positioned around (right side primarily, optional bottom-left)
- CTA "Join ScoutPaw World!" — anchor link to `#channels` (smooth scroll via existing `html { scroll-behavior: smooth }`)
- Play overlay opens `https://www.youtube.com/watch?v={youtubeId}` in new tab; falls back to `youtubeChannelUrl` for placeholder videos

**Non-functional**
- LCP-critical: featured-video Image uses `priority` + `sizes="100vw"`
- Mobile: hide character cluster (or show only 1 character), stack tagline above video
- Desktop md+: side-by-side layout with characters revealed

## Architecture

Single-file component. Mirrors existing `FullBleedHero` (home) layout philosophy but tuned for a video focal point:
- Outer `<section>` w/ `relative isolate overflow-hidden bg-paper`
- Inner content `min-h-[80svh]` (not 100svh — hero should leave a peek of "Community Choice" below to encourage scroll)
- Grid: tagline+CTA left col / video center col / character cluster right col (md+)
- Character images positioned via absolute placement, hidden < md via `hidden md:block`

## Related Code Files

**Create**
- `components/watch/watch-hero.tsx`

**Read for reference (don't modify)**
- `components/watch/featured-video.tsx` — current pattern for video thumb + play overlay
- `components/home/full-bleed-hero.tsx` — layout philosophy
- `lib/content/schemas.ts` — Video, Channel, Character types

## Implementation Steps

1. Create `components/watch/watch-hero.tsx`. Props as defined above.

2. Build outer section:
   ```tsx
   <section className="relative isolate overflow-hidden bg-paper">
     <div className="relative mx-auto grid min-h-[80svh] max-w-hero gap-8 px-4 py-12 md:grid-cols-[1fr_minmax(0,7fr)_1fr] md:gap-6 md:px-8 md:py-16 lg:px-12">
   ```
   - 3-col grid: text (1fr) | video (7fr, dominant) | character cluster (1fr)
   - On mobile: stack — text → video → (characters hidden)

3. Left col (text):
   - Kicker: `ScoutPaw TV`
   - H1: `Watch the Whole Pack.` (existing copy)
   - Description: short tagline
   - CTA buttons: primary "Join ScoutPaw World!" → `#channels` (anchor), secondary "Watch on YouTube" → channel URL

4. Center col (featured video):
   - Reuse the thumbnail-with-play-overlay pattern from existing `FeaturedVideo`
   - Aspect-video, rounded-[2rem], border, shadow-cozy-md
   - Play button: 80-112px coral circle with triangle play icon, hover scale
   - Bottom-right duration badge if `video.duration` present
   - Top-left content-type badge if `video.category` present (uses new VideoContent labels)
   - Wraps in `<Link target="_blank" rel="noopener noreferrer">`

5. Right col (character cluster) — md+ only:
   - Position 2-3 character images via absolute placement within a relative container
   - Use `characters[0..2]` (sliced); fallback to gracefully omit if fewer characters available
   - Heights: ~200-280px each, drop-shadow, slight rotations

6. Mobile breakpoint behavior:
   - Single column stack
   - Characters hidden via `hidden md:block` on right col
   - Tagline shrunk: `text-4xl` instead of `text-5xl`

7. CTA anchor wiring: ensure the page's `OurChannels` section gets `id="channels"` in Phase 4. If Phase 4 hasn't run yet, the anchor is a no-op (acceptable v1).

8. Manual visual check at 360 / 768 / 1280 / 1920.

## Todo List

- [ ] Component scaffold with props
- [ ] 3-col grid (text | video | characters)
- [ ] Left col: kicker + h1 + description + 2 CTAs
- [ ] Center col: featured video w/ play overlay (reuse pattern)
- [ ] Right col: character cluster (positioned, md+ only)
- [ ] Mobile responsive (stack, hide characters)
- [ ] Smooth-scroll anchor to `#channels`
- [ ] Build + lint pass

## Success Criteria

- [ ] WatchHero renders without TypeScript errors
- [ ] Featured video click opens YouTube in new tab
- [ ] "Join ScoutPaw World!" smoothly scrolls to `#channels` (after Phase 4)
- [ ] Character cluster visible md+, hidden on mobile, no overflow
- [ ] No console / build warnings
- [ ] LCP element identified as the featured-video thumbnail

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Character cluster overflows column on narrow desktop | Use absolute positioning with `pointer-events-none`; let video center hold its width |
| Mobile stack too tall | `min-h-[80svh]` allows hero to be shorter than viewport on mobile; remove `min-h` below md if needed |
| Featured-video thumbnail not present in mock data | Use existing fallback (`/assets/banner/banner.png`) |
| Multiple characters not loaded if data sparse | Optional chaining; skip cluster if `<3` characters |
