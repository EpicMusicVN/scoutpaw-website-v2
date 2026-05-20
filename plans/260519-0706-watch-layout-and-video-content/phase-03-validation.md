---
phase: 3
title: Validation
status: completed
priority: P2
effort: 10m
dependencies:
  - 2
---

# Phase 3: Validation

## Overview

Static checks + dev smoke test confirming new layout order + Cats/Funny filter chips surface the new videos.

## Requirements

- Functional: typecheck/lint/build pass; new content visible via filter chips
- Non-functional: existing 6 mock videos still render; no visual regression

## Implementation Steps

1. **Static checks:**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
   All three pass.

2. **Local smoke test (`pnpm dev`):**
   - Visit `/watch` → confirm `OurChannels` section appears directly below the hero video
   - Confirm `Community Choice` rail comes AFTER OurChannels
   - Confirm `Explore Videos` and `Subscribe` follow in order
   - Confirm cloud dividers sit cleanly between each section (no doubling, no missing)

3. **Filter chip verification (still on `/watch`):**
   - Click "Cats" filter chip in Explore Videos → 7 new entries appear (titles from WebFetch)
   - Click "Funny" filter chip → 9 new entries appear
   - Click "Dogs" (or all) → existing 6 mock videos still appear
   - Confirm thumbnails render (will show `banner/banner.png` fallback when `YOUTUBE_API_KEY` unset, or real YouTube thumbnails when set)

4. **Title sanity check:**
   - Verify no rendered title shows literal `"YouTube"` or empty string
   - Acceptable: real titles OR `"Untitled video <youtubeId>"` fallback (≤2 of 16)

## Success Criteria

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] `/watch` page shows OurChannels directly below WatchHero
- [ ] "Cats" filter chip shows 7 new videos
- [ ] "Funny" filter chip shows 9 new videos
- [ ] No regression: original 6 mock videos still listed appropriately
- [ ] Rendered titles are real (not literal "YouTube") for at least 14 of 16 entries

## Risk Assessment

- **Risk:** Filter chip logic excludes new entries because of schema field mismatch
  - **Mitigation:** Schema is type-checked. If chips don't surface, inspect `components/watch/explore-videos.tsx` filter logic.
- **Risk:** Layout looks weird with OurChannels right under hero
  - **Mitigation:** This is the user's requested change; if visually off, brand decision to revert — not a refactor concern.

## Next Steps (Post-Validation)

- User commits manually
- Optional follow-ups (deferred):
  - Real `viewCount`, `duration`, `uploadDate` per-video (overlaid by YouTube API in production)
  - Assign new videos to a `playlistId` if a "cats" or "funny" playlist exists in `content/playlists.json`
