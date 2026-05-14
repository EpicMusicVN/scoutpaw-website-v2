---
phase: 3
title: Page enrichment + components + empty states
status: completed
priority: P2
effort: 1.5h
dependencies:
  - 1
  - 2
---

# Phase 3: Page enrichment + components + empty states

## Overview

Wire the enrichment helpers into `app/watch/page.tsx` (the primary consumer). Update `our-channels.tsx` to render `channel.avatarUrl` when present. Align empty-state messaging across `explore-videos.tsx` + `video-rail.tsx` to "No videos yet". Spot-check Home page for video/channel consumers needing enrichment.

## Requirements

**Functional**
- `app/watch/page.tsx` calls `enrichChannels` + `enrichVideos` server-side before passing data to components.
- `enrichVideos` also called on the featured video.
- `our-channels.tsx` CompactChannelCard renders `channel.avatarUrl` when set; falls back to `assetUrl(character.image)` otherwise.
- `explore-videos.tsx` empty state copy → "No videos yet".
- `video-rail.tsx` shows a "No videos yet" placeholder card when `videos.length === 0`.
- Other consumers (Home VideoGrid if present, etc.) — applied or left untouched per scope.

**Non-functional**
- Components remain transparent — read the same fields they read today (`channel.name`, `video.title`, etc.).
- Type safety preserved (Channel + Video types unchanged externally).

## Architecture

### `app/watch/page.tsx`

```diff
+ import { enrichChannels, enrichVideos } from "@/lib/youtube/enrich";
  ...
  const [videos, channels, characters, config, featured] = await Promise.all([
    content.getVideos(),
    content.getChannels(),
    content.getCharacters(),
    content.getSiteConfig(),
    content.getFeaturedVideo(),
  ]);
+ const [enrichedVideos, enrichedChannels, enrichedFeatured] = await Promise.all([
+   enrichVideos(videos),
+   enrichChannels(channels),
+   featured ? enrichVideos([featured]).then((arr) => arr[0]) : Promise.resolve(null),
+ ]);
- // pass `videos`/`channels`/`featured` to components
+ // pass `enrichedVideos`/`enrichedChannels`/`enrichedFeatured` to components
```

The `communityChoice` derivation runs on `enrichedVideos` so view counts (if API returns) influence ordering.

### `components/watch/our-channels.tsx`

In `CompactChannelCard` (~line 166):

```diff
- <Image
-   src={assetUrl(character.image)}
+ <Image
+   src={channel.avatarUrl ?? assetUrl(character.image)}
    alt={channel.name}
    ...
  />
```

If the avatar comes from YouTube (yt3.googleusercontent.com), Next Image optimizes via the remotePatterns entry added in phase 1.

**Note about character fallback:** `character` may be null if the channel has no characterSlug or if the character doesn't exist. The existing component already handles this nullishly. After enrichment, `avatarUrl` is the primary source.

### `components/watch/explore-videos.tsx`

Around line 79-81:

```diff
- <p className="mt-12 text-center text-base text-ink/65 md:text-lg">
-   No videos in this category yet — try &ldquo;All&rdquo;.
- </p>
+ <p className="mt-12 text-center text-base text-ink/65 md:text-lg">
+   No videos yet
+ </p>
```

### `components/watch/video-rail.tsx`

Inspect first. If it renders an empty list without placeholder, add:

```jsx
{videos.length === 0 ? (
  <div className="mx-auto mt-8 max-w-md rounded-3xl border border-ink/10 bg-surface/70 p-10 text-center shadow-cozy">
    <p className="font-display text-base font-semibold text-warm-text md:text-lg">
      No videos yet
    </p>
  </div>
) : (
  // existing rail render
)}
```

### Home page check

Grep `app/page.tsx` + `components/home/video-grid.tsx` for video/channel consumers. If VideoGrid reads `videos` from content adapter, decide:
- Enrich there too → consistent live-data experience
- Leave hardcoded → fewer API calls

Recommend: enrich Home VideoGrid too if it surfaces real videos (not just placeholders). Verify during impl.

## Related Code Files

- Modify: `app/watch/page.tsx`
- Modify: `components/watch/our-channels.tsx`
- Modify: `components/watch/explore-videos.tsx`
- Modify: `components/watch/video-rail.tsx`
- Inspect: `app/page.tsx`, `components/home/video-grid.tsx` (may need enrichment)

## Implementation Steps

1. Edit `app/watch/page.tsx` per the diff. Verify TypeScript still accepts the type of `enrichedVideos` (Promise.all+filter returns mixed types).
2. Edit `our-channels.tsx` CompactChannelCard — use `channel.avatarUrl ?? assetUrl(character.image)`.
3. Edit `explore-videos.tsx` empty-state copy.
4. Inspect + edit `video-rail.tsx` if empty handling missing.
5. Grep + inspect Home VideoGrid consumers; apply enrichment if appropriate.
6. Run `pnpm typecheck` + `pnpm lint`. Halt on errors.

## Success Criteria

- [ ] Watch page enriches videos + channels + featured before passing to components
- [ ] Channel cards render YouTube avatar when available; fallback to character image
- [ ] Both empty-state messages read "No videos yet"
- [ ] Video Rail shows placeholder when empty
- [ ] Home page consumers consistent (enriched or intentionally untouched)
- [ ] `pnpm typecheck` + `pnpm lint` clean

## Risk Assessment

- **`enrichedFeatured` typing** — `Promise.all` with a conditional promise may type as `Video | null`. Use a type guard or non-null assertion at the consumer.
- **Avatar URL on yt3 hostname** — already allowlisted in next.config (phase 1). If missing, Next throws.
- **Empty-state padding** — "No videos yet" is shorter than the current text; verify visual balance.
- **VideoGrid on Home** — if surfaced via the same `content.getVideos()` and `featured` is shown, enrich there too. If only character-based content with no video IDs, leave alone.
- **Server-component cost** — enrichment adds ~50-200ms to first SSR (cached for 1hr after). Acceptable for Watch page where freshness matters.
- **Avatar size/aspect** — YouTube channel thumbnails are typically square 800x800. Existing CompactChannelCard layout assumes square avatar; no aspect change.
