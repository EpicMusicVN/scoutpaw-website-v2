---
phase: 3
title: Watch Library Removal
status: completed
priority: P2
effort: 1.5h
dependencies: []
---

# Phase 3: Watch Library Removal

## Overview

Remove the redundant "All Episodes" header + flat `WatchLibrary` from `/watch`. Extend `Playlist` schema with optional `youtubeUrl`; `PlaylistGrid` cards become non-interactive when no URL is set (no broken `?playlist=` deep-links).

## Requirements

**Functional**
- `/watch` ends cleanly at Subscribe CTA (after OurChannels)
- `PlaylistGrid` cards link to `playlist.youtubeUrl` when present
- `PlaylistGrid` cards render non-interactive (no `<Link>`, cursor-default, muted affordance) when `youtubeUrl` is absent
- No dead `?playlist=ID#library` navigations

**Non-functional**
- Schema change is backward compatible (`youtubeUrl` optional)
- Existing `playlists.json` continues to parse
- Page layout rebalances after section removal — no awkward empty stretches

## Architecture

- `app/watch/page.tsx` strips: "All Episodes" header section, `libraryVideos` filter, `WatchLibrary` import + Suspense wrapper, `LibraryFallback` skeleton, empty-state branch.
- `lib/content/schemas.ts` adds `youtubeUrl: z.string().url().optional()` to `PlaylistSchema`.
- `content/playlists.json` left as-is (no URLs added → cards render disabled until populated).
- `components/watch/playlist-grid.tsx` branches on `playlist.youtubeUrl`:
  - URL present → external `<Link href={url} target="_blank" rel="noopener noreferrer">`
  - URL absent → `<div role="link" aria-disabled="true">` with cursor-default + small "Coming Soon" badge

## Related Code Files

**Modify**
- `app/watch/page.tsx`
- `components/watch/playlist-grid.tsx`
- `lib/content/schemas.ts`

**Delete (or leave dormant — confirm no other consumers)**
- `components/watch/watch-library.tsx` — only consumer is `/watch`. After removal, this file is dead. **Decision: leave the file in place** (no immediate cost, avoids breaking imports if any test/storybook references it). Mark with a `@deprecated` JSDoc tag.

## Implementation Steps

1. **`lib/content/schemas.ts`** — extend `PlaylistSchema`
   - Add field: `youtubeUrl: z.string().url().optional()` after `accentColor`
   - Type `Playlist` re-derives automatically

2. **`app/watch/page.tsx`** — surgical removal
   - Remove imports: `WatchLibrary`, `Suspense`, `Link`, `content` references that become unused
   - Remove `Promise.all` entries no longer needed (audit: `getVideos`, `getCharacters`, `getSiteConfig`, `getFeaturedVideo`, `getLatestVideos(8)`, `getPlaylists`, `getChannels` — keep what's still used by FeaturedVideo, VideoRail, OurChannels, PlaylistGrid)
   - Remove `libraryVideos` filter
   - Remove `<section id="library">` "All Episodes" header (lines 87-103)
   - Remove the `libraryVideos.length === 0` ternary (empty-state branch + Suspense+WatchLibrary branch)
   - Remove `LibraryFallback` function entirely
   - Re-verify final JSX renders only: page header, FeaturedVideo, VideoRail, PlaylistGrid, OurChannels, SubscribeCard

3. **`components/watch/playlist-grid.tsx`** — gate by `youtubeUrl`
   - In `PlaylistCard` (find the existing `<Link>` wrapper), check `playlist.youtubeUrl`:
     ```tsx
     const url = playlist.youtubeUrl;
     const wrapperClass = `... ${url ? '' : 'cursor-default opacity-90'}`;
     if (!url) {
       return <div role="link" aria-disabled="true" className={wrapperClass}>{inner}</div>;
     }
     return <Link href={url} target="_blank" rel="noopener noreferrer" className={wrapperClass}>{inner}</Link>;
     ```
   - Add small "Coming Soon" badge (top-right) when `!url` — mirror `MenuCards.comingSoon` styling
   - Remove the `?playlist=ID#library` href construction from existing code

4. **`components/watch/watch-library.tsx`** — mark deprecated
   - Add JSDoc comment at top: `/** @deprecated Removed from /watch in 260511 polish pass. Kept temporarily; safe to delete after verification. */`
   - Do not delete the file in this pass — separate cleanup later

5. **Verify build** — `pnpm run build`. Confirm no TypeScript errors from removed imports.

6. **Visual QA**
   - `/watch` ends at SubscribeCard with no awkward gap
   - PlaylistGrid cards: 3 disabled tiles render cleanly (no broken pointer cursor, no "loading" hint)
   - `?playlist=...` URL no longer scrolls anywhere — confirm acceptable (no dead anchor)

## Todo List

- [ ] PlaylistSchema: add `youtubeUrl` optional field
- [ ] watch/page.tsx: remove WatchLibrary + header + LibraryFallback + empty-state
- [ ] watch/page.tsx: trim Promise.all of unused queries
- [ ] playlist-grid.tsx: gate Link by `playlist.youtubeUrl`
- [ ] playlist-grid.tsx: add "Coming Soon" badge for URL-less cards
- [ ] watch-library.tsx: add `@deprecated` JSDoc
- [ ] Build passes (`pnpm run build`)
- [ ] Manual QA — page ends cleanly, disabled cards render correctly

## Success Criteria

- [ ] `/watch` no longer renders "All Episodes" header or video grid
- [ ] PlaylistGrid cards link to external YouTube when `youtubeUrl` set
- [ ] PlaylistGrid cards render disabled (with "Coming Soon" badge) when not set
- [ ] `pnpm run build` passes with zero TypeScript errors
- [ ] Page layout doesn't have a gaping empty section after removal
- [ ] Existing `playlists.json` continues to parse via Zod (backward compat verified)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Other consumers of `WatchLibrary` (tests, storybook) break | Grep for `WatchLibrary` imports outside `/watch`; if any, address before removal |
| Removed Promise.all entries break unrelated logic | Audit each removed query — only drop ones whose consumer is also removed |
| `?playlist=ID#library` deep-links exist in user bookmarks / external sites | Acceptable — silent failure (user lands on /watch top). No 404. |
| Disabled cards look broken / confusing | Apply muted styling + explicit "Coming Soon" badge; mirror `MenuCards.comingSoon` UX |
| Schema change breaks existing data | Field is `.optional()` — backward compatible; verify by running existing parse path |

## Security Considerations

- `<Link target="_blank">` uses `rel="noopener noreferrer"` to prevent reverse-tabnabbing — already standard in this codebase, retain.

## Next Steps

After Phase 3 ships:
1. Populate `youtubeUrl` field in `playlists.json` once real URLs are known
2. Delete `components/watch/watch-library.tsx` once confirmed no remaining references
3. (Optional) Clean up `getVideosByPlaylist` adapter method if no longer used by anything
