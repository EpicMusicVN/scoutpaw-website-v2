---
phase: 4
title: Validation (with + without API key)
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Validation (with + without API key)

## Overview

Two-mode validation: with `YOUTUBE_API_KEY` set (verify live data renders) and without (verify graceful fallback to JSON). Plus standard typecheck + lint + visual walkthrough.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0.
- **API-on mode** (`YOUTUBE_API_KEY` set in `.env`):
  - `/watch` Our Channels rail shows real channel logos (yt3.googleusercontent.com URLs in Network panel).
  - Channel names match YouTube ground truth.
  - Subscriber counts render (where available).
  - Featured video + Community Choice rail thumbnails come from i.ytimg.com.
  - Featured video title shows real YouTube title.
- **API-off mode** (`YOUTUBE_API_KEY` empty):
  - Site renders without crashing.
  - Channel cards fall back to character images.
  - Video thumbnails fall back to JSON `thumbnail` values.
  - No console errors.
- Empty-state messages read "No videos yet" in both Community Choice + ExploreVideos.

## Architecture

Pre-flight: confirm user has pasted `YOUTUBE_API_KEY` into `.env`. If still empty, run only API-off path; flag pending in final report.

Standard 2-pass validation: change env → restart dev → walkthrough → repeat.

## Implementation Steps

1. Run `pnpm typecheck`. Halt on errors.
2. Run `pnpm lint`. Halt on errors.
3. **API-on path:**
   - Verify `.env` has `YOUTUBE_API_KEY=<real-key>`. If not, halt + ask user to paste.
   - `pnpm dev`.
   - Open `/watch`. Check Network panel for `googleapis.com/youtube/v3/channels?...` and `.../videos?...` requests (only on cold revalidate; cached otherwise).
   - Visual check at 1024 + 1440 viewports:
     - Our Channels rail: 4 channel cards with real YouTube logos (yt3.* URLs), real channel names ("Puppy Lullaby TV" etc.), sub counts (if returned).
     - Featured video card: real title, real thumbnail.
     - Community Choice rail: real thumbnails for mock-001..006 (the 6 with real youtubeIds from cycle-prior).
     - Empty category filter (Cats / Product Reviews) → "No videos yet" placeholder.
4. **API-off path:**
   - Comment out `YOUTUBE_API_KEY` in `.env`. Restart dev server.
   - Reload `/watch`. Confirm:
     - Channel cards fall back to character images (`/assets/characters/...` via assetUrl helper → R2 or local).
     - Video thumbnails fall back to JSON `thumbnail` values.
     - No client errors, no SSR crash.
   - Re-enable env var, restart. Confirm live data restored.
5. Devtools console: no errors in either mode.
6. Quota check: each cold revalidate calls 2 endpoints (channels.list + videos.list). 1hr revalidate × 24h = 48 units/day. Free tier 10,000/day → ample headroom.

## Success Criteria

- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0
- [ ] API-on: yt3 + ytimg URLs in Network panel; real channel names + avatars; real video titles + thumbnails
- [ ] API-off: site renders with JSON fallback; no broken images, no console errors
- [ ] "No videos yet" empty-state in ExploreVideos + VideoRail
- [ ] Quota usage acceptable (<100 calls/day estimated)

## Risk Assessment

- **API key not pasted yet** — phase 4 partially completes (only API-off path). Flag in final report; user runs API-on smoke test after pasting.
- **Cold revalidate latency** — first SSR after cache expiry takes 200-800ms extra for the YouTube fetch. Acceptable.
- **Cache TTL drift** — if user wants faster updates, lower revalidate; if quota issues, raise revalidate. Current 3600s is balanced.
- **API call from server vs edge** — Next.js App Router defaults to Node runtime for server components. yt3 thumbnails should load fine via Next Image optimization with remotePatterns entry.
- **YouTube API quota recovery on 403** — if quota exhausted (very unlikely at our volume), API returns 403. Our client returns `[]` → fallback to JSON. Self-healing on next quota refresh (daily reset).
- **Channel description / tagline mismatch** — we keep JSON `tagline` (brand-coherent copy). API `description` not displayed. No mismatch risk in UI.
