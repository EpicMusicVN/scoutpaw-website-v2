---
phase: 5
title: Page Wiring & Cleanup
status: completed
priority: P2
effort: 30min
dependencies:
  - 2
  - 3
  - 4
---

# Phase 5: Page Wiring & Cleanup

## Overview

Wire the new `WatchHero`, `ExploreVideos`, and compact `OurChannels` into `app/watch/page.tsx`. Update section order. Deprecate `FeaturedVideo` and `PlaylistGrid` (kept dormant, marked `@deprecated`).

## Requirements

**Functional**
- Final section order: `WatchHero → VideoRail "Community Choice" → ExploreVideos → OurChannels → SubscribeCard`
- Page header section (existing "Watch the Whole Pack." block) — removed (folded into WatchHero)
- VideoRail data sourced from top viewCount videos (not just `getLatestVideos`)
- `PlaylistGrid` import + render removed; `playlists` query removed from Promise.all if no other consumer

**Non-functional**
- Build / lint / typecheck pass
- Bundle size delta ≤ +5 KB on `/watch`
- No console errors at runtime
- All sections render with realistic mock data

## Architecture

`app/watch/page.tsx` becomes a thin orchestrator: fetch data, hand off to components. Drop the `Suspense` wrapper (no client-state-driven sections require it anymore — ExploreVideos is self-contained client component).

## Related Code Files

**Modify**
- `app/watch/page.tsx` — section orchestration
- `components/watch/featured-video.tsx` — add `@deprecated` JSDoc
- `components/watch/playlist-grid.tsx` — add `@deprecated` JSDoc

## Implementation Steps

1. **Edit `app/watch/page.tsx`**:
   - Remove imports: `FeaturedVideo`, `PlaylistGrid`, `Link`
   - Add imports: `WatchHero`, `ExploreVideos`
   - Update `Promise.all`: drop `getPlaylists()` if no other consumer; if needed for ExploreVideos? No — ExploreVideos only needs `videos`. Drop playlists.
   - Replace the page header section + `FeaturedVideo` block with `<WatchHero featured={featured!} channel={featuredChannel} characters={characters} youtubeChannelUrl={youtubeUrl} />`
   - VideoRail: change kicker/title to `Community Choice to Watch` (or pass new props). Use top-viewed videos: sort fetched `videos` by viewCount desc, take 8.
   - Replace previous `PlaylistGrid` section with `<ExploreVideos videos={videos} youtubeChannelUrl={youtubeUrl} />`
   - Keep `OurChannels` (now compact) and `SubscribeCard`
   - Wrap each section in `<ScrollReveal>` as before

2. **Mark deprecated**:
   - `components/watch/featured-video.tsx` — add `/** @deprecated Folded into WatchHero in 260511-1719 plan. Kept dormant; safe to delete later. */`
   - `components/watch/playlist-grid.tsx` — extend the existing `@deprecated` JSDoc to note the page no longer renders it

3. **Verify**:
   - `pnpm run typecheck` (must pass)
   - `pnpm run lint` (must pass)
   - `pnpm run build` (must succeed)
   - Manual: `pnpm run dev`, hit `/watch`, click "Join ScoutPaw World!" — should smooth-scroll to compact channels rail

4. **Smoke test responsive**: 360, 768, 1280, 1920 viewports.

5. **Final report**: code-reviewer subagent for review pass; project-manager for plan/docs sync.

## Todo List

- [ ] Remove FeaturedVideo + PlaylistGrid imports + usage
- [ ] Add WatchHero + ExploreVideos imports + usage
- [ ] Trim Promise.all of unused queries (playlists)
- [ ] VideoRail title → "Community Choice to Watch"; data → top viewed
- [ ] Section order matches design
- [ ] @deprecated JSDoc on FeaturedVideo + PlaylistGrid
- [ ] Build / lint / typecheck pass
- [ ] Manual smoke test
- [ ] code-reviewer subagent dispatched
- [ ] project-manager subagent dispatched (plan sync + docs)

## Success Criteria

- [ ] `/watch` renders WatchHero → VideoRail → ExploreVideos → OurChannels → SubscribeCard
- [ ] CTA "Join ScoutPaw World!" smoothly scrolls to `#channels`
- [ ] Featured-video play overlay opens correct YouTube URL
- [ ] Filter chips work; "All" returns full set
- [ ] Channels rail shows 5-6 visible cards on desktop, scroll/swipe to see more
- [ ] No console / build / type errors
- [ ] code-reviewer status DONE or DONE_WITH_CONCERNS (concerns addressed)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Removing PlaylistGrid import breaks if other pages import it | Grep before removal — only /watch uses it |
| WatchHero LCP regression | Featured-video image still uses `priority`; verify in build output |
| ScrollReveal wrapping interferes with hero anchor smooth scroll | ScrollReveal uses opacity/translate — doesn't affect scroll target. Keep wrapped. |
| Bundle size grows beyond expectations | Re-run build size diff; investigate if `+5 KB` exceeded |
