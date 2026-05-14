---
phase: 1
title: Schema Split & Retag
status: completed
priority: P1
effort: 30min
dependencies: []
---

# Phase 1: Schema Split & Retag

## Overview

Split `VideoCategorySchema` (currently dual-purpose) into two distinct enums: `PlaylistCategorySchema` (mood axis, renamed from current) and `VideoContentSchema` (new content-type axis). Re-tag `videos.json` `category` values to use the new content categories. Foundation for ExploreVideos filter chips in Phase 3.

## Requirements

**Functional**
- `VideoSchema.category` accepts: `dogs | cats | shorts | funny | product-reviews | community`
- `PlaylistSchema.category` accepts: existing values unchanged (`calm-sounds | naps | adventures | ambient | stories | shorts`)
- All 30 video entries in `videos.json` retain a valid `category` value
- `playlists.json` continues to parse without modification

**Non-functional**
- Zod parsing for both schemas passes on existing JSON
- All TypeScript references to `VideoCategory` type updated to `VideoContent` (or `PlaylistCategory` where appropriate)

## Architecture

Two enums replace one. Adapter + implementations updated accordingly:
- `VideoContentSchema` (NEW) — content axis, used by videos
- `PlaylistCategorySchema` (renamed from `VideoCategorySchema`) — mood axis, used by playlists
- `VideoCategory` type → renamed `VideoContent`
- `getVideosByCategory(c: VideoCategory)` → `getVideosByCategory(c: VideoContent)` (semantic stays correct)

## Related Code Files

**Modify**
- `lib/content/schemas.ts` — split enums
- `lib/content/adapter.ts` — update imports + signatures
- `lib/content/index.ts` — re-export new types
- `lib/content/sources/json-source.ts` — update impl
- `lib/content/sources/sanity-source.ts` — update stub
- `content/videos.json` — retag 30 entries

## Implementation Steps

1. **`lib/content/schemas.ts`**:
   ```ts
   // Rename existing → playlist mood axis
   export const PLAYLIST_CATEGORIES = [
     "calm-sounds", "naps", "adventures", "ambient", "stories", "shorts",
   ] as const;
   export const PlaylistCategorySchema = z.enum(PLAYLIST_CATEGORIES);
   export type PlaylistCategory = z.infer<typeof PlaylistCategorySchema>;

   // NEW — content axis for videos
   export const VIDEO_CONTENTS = [
     "dogs", "cats", "shorts", "funny", "product-reviews", "community",
   ] as const;
   export const VideoContentSchema = z.enum(VIDEO_CONTENTS);
   export type VideoContent = z.infer<typeof VideoContentSchema>;
   ```
   - Update `VideoSchema.category` → `VideoContentSchema.optional()`
   - Update `PlaylistSchema.category` → `PlaylistCategorySchema`

2. **`lib/content/adapter.ts`**:
   - Replace `VideoCategory` import → `VideoContent`
   - Update `getVideosByCategory(category: VideoContent)`

3. **`lib/content/index.ts`**:
   - Replace `VideoCategory` re-export with `VideoContent` and `PlaylistCategory`

4. **`lib/content/sources/json-source.ts`**:
   - Update import + impl signature

5. **`lib/content/sources/sanity-source.ts`**:
   - Update stub method type if signature is typed

6. **`content/videos.json`** — retag each `category` value:
   - Mapping (best-effort based on title patterns):
     - `calm-sounds`, `naps`, `ambient` → likely `dogs` (default) or `cats` (if title mentions cats)
     - `stories`, `adventures` → `funny` or `community`
     - `shorts` → `shorts`
   - Use Read + targeted Edit per video, OR rewrite the file via Write
   - Apply: read videos.json, transform each `"category"` value with the mapping, write back

7. **Verify**: `pnpm run typecheck && pnpm run lint` — both must pass.

## Todo List

- [ ] schemas.ts: add `VideoContentSchema`, rename `VideoCategorySchema → PlaylistCategorySchema`
- [ ] schemas.ts: update VideoSchema.category, PlaylistSchema.category types
- [ ] adapter.ts: rename imports/types
- [ ] index.ts: update re-exports
- [ ] json-source.ts: update impl
- [ ] sanity-source.ts: update stub
- [ ] videos.json: retag all 30 entries
- [ ] typecheck passes
- [ ] lint passes

## Success Criteria

- [ ] `pnpm run typecheck` exits 0
- [ ] `pnpm run lint` exits 0
- [ ] `pnpm run build` succeeds
- [ ] All videos in `videos.json` have valid `VideoContent` value
- [ ] All playlists in `playlists.json` parse without changes (untouched)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Hidden consumer of old `VideoCategory` name | Grep before/after; covered (only 4 lib files use it) |
| Re-tagging videos.json with wrong content type | Mock data only; sensible defaults acceptable |
| TypeScript-only rename without runtime change | Zod ensures runtime + compile-time agreement |
