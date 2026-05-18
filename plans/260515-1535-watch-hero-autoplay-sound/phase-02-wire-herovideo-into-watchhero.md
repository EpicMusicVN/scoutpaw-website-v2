---
phase: 2
title: Wire HeroVideo into WatchHero
status: completed
priority: P2
effort: 15m
dependencies:
  - 1
---

# Phase 2: Wire HeroVideo into WatchHero

## Overview

Replace the inline `<video>` JSX in `WatchHero` with the new `<HeroVideo>` Client Component. Keep `WatchHero` as a Server Component. Preserve `<Link>` wrapper, badges, hover transforms, and image fallback path.

## Requirements

### Functional
- `WatchHero` renders `<HeroVideo>` instead of inline `<video>` when `featured.videoSrc` exists
- Image fallback path unchanged
- Link-to-YouTube click behavior unchanged for the rest of the video surface
- Category and channel badges still render on top

### Non-functional
- `WatchHero` stays a Server Component (no `"use client"` added at file level)
- No new props on `WatchHero`'s public API
- Diff <15 lines

## Architecture

Before (`watch-hero.tsx:46-57`):
```tsx
{featured.videoSrc ? (
  <video
    src={assetUrl(featured.videoSrc)}
    poster={featured.videoPoster ? assetUrl(featured.videoPoster) : undefined}
    autoPlay muted loop playsInline preload="metadata"
    aria-label={`Watch ${featured.title} on YouTube`}
    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
) : (
  <Image ... />
)}
```

After:
```tsx
{featured.videoSrc ? (
  <HeroVideo
    src={assetUrl(featured.videoSrc)}
    poster={featured.videoPoster ? assetUrl(featured.videoPoster) : undefined}
    title={featured.title}
    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
) : (
  <Image ... />
)}
```

## Related Code Files

- **Modify:** `components/watch/watch-hero.tsx`
- **Imports from:** `components/watch/hero-video.tsx` (created in Phase 1)

## Implementation Steps

1. Open `components/watch/watch-hero.tsx`.
2. Add import: `import { HeroVideo } from "./hero-video";`
3. Replace the `<video>` block (lines ~47-57) with `<HeroVideo ... />` using the props mapping above.
4. Verify the surrounding `<Link>`, hover classes, badge positioning, play-button overlay (only shown when `!featured.videoSrc`) all remain intact.
5. Run `pnpm tsc --noEmit` (or `pnpm build`) to confirm no TS errors.
6. Run `pnpm dev`, visit `/watch`, confirm video element still renders inside the hero card.

## Todo List

- [ ] Add `HeroVideo` import to `watch-hero.tsx`
- [ ] Swap inline `<video>` JSX for `<HeroVideo>` component
- [ ] Confirm Link wrapper, badges, hover classes preserved
- [ ] Confirm Image fallback path unchanged
- [ ] TypeScript compiles clean
- [ ] Dev server renders `/watch` without console errors

## Success Criteria

- [ ] `watch-hero.tsx` still has no `"use client"` directive
- [ ] Diff is <15 lines changed
- [ ] `/watch` route renders identically to before in terms of layout
- [ ] No new TS or ESLint errors
- [ ] No hydration warnings in browser console

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Hydration mismatch from server/client video state | Phase 1 chose `state='muted'` as initial render to match what SSR produces |
| Class string mismatch breaks hover scale | Pass classes through `className` prop; Phase 1 applies them verbatim to `<video>` |
| Future props on `WatchHero` mis-routed | Keep prop surface minimal — only forward what `HeroVideo` needs |
