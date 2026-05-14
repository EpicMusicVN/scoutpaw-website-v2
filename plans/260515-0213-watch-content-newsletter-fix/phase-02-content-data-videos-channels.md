---
phase: 2
title: Content data (videos + channels)
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 2: Content data (videos + channels)

## Overview

Pure data edits to `content/videos.json` and `content/channels.json`. Wire 6 real YouTube IDs into the top 6 dog mock videos, and append 4 new channels with hardcoded placeholder counts (real counts deferred to the YouTube Data API cycle).

## Requirements

**Functional**
- `videos.json` — mock-001..006 carry real YouTube IDs (instead of `TODO_youtube_id_N`).
- `channels.json` — 6 total channels (2 existing + 4 new).
- New channel entries pass Zod schema validation (`ChannelsFileSchema`).
- `characterSlug` references real character slugs from `characters.json`.

**Non-functional**
- Don't touch the 24 other TODO_youtube_id_N entries (intentional placeholders).
- Hardcoded `subscriberCount: 50000` and `videoCount: 30` for new channels — flagged for cycle 5 (YouTube API) to replace with real values.
- `latestVideoId` omitted (optional field).

## Architecture

### Video ID mapping

| Mock | Old youtubeId | New youtubeId | Source URL |
|------|---------------|---------------|------------|
| mock-001 | `TODO_youtube_id_1` | `4Fgl_dW3vgA` | https://youtu.be/4Fgl_dW3vgA |
| mock-002 | `TODO_youtube_id_2` | `X19MapswOQs` | https://youtu.be/X19MapswOQs |
| mock-003 | `TODO_youtube_id_3` | `PRCac_UMohw` | https://youtu.be/PRCac_UMohw |
| mock-004 | `TODO_youtube_id_4` | `3b3T2Z2CZLA` | https://youtu.be/3b3T2Z2CZLA |
| mock-005 | `TODO_youtube_id_5` | `HPlFCtF_Sxs` | https://youtu.be/HPlFCtF_Sxs |
| mock-006 | `TODO_youtube_id_6` | `D3vSMHj2mrg` | https://youtube.com/live/D3vSMHj2mrg (live) |

Side effects:
- featured-video Link href now navigates to real YouTube URL (e.g., `https://www.youtube.com/watch?v=4Fgl_dW3vgA`).
- Community Choice rail thumbnails resolve via `i.ytimg.com/vi/{youtubeId}/hqdefault.jpg`.
- WatchHero still plays local `intro.mp4` (videoSrc takes precedence in the cycle-1 branch).

### Channel additions

Append to `content/channels.json`'s `channels` array:

```json
{
  "slug": "puppy-lullaby-tv",
  "name": "Puppy Lullaby TV",
  "tagline": "Calming lullabies for restless pups.",
  "subscriberCount": 50000,
  "videoCount": 30,
  "url": "https://www.youtube.com/channel/UCy-QL5kMOtAPoDaq2VFoaRQ",
  "bannerColor": "#A8C7E8",
  "characterSlug": "bella",
  "avatarColor": "#D7E6F4"
},
{
  "slug": "happy-paws-cartoon",
  "name": "Happy Paws Cartoon",
  "tagline": "Playful cartoons that put a wag in every tail.",
  "subscriberCount": 50000,
  "videoCount": 30,
  "url": "https://www.youtube.com/channel/UCaiJ0puSQ9KdqZ7965j1W6w",
  "bannerColor": "#F4B97A",
  "characterSlug": "oscar",
  "avatarColor": "#FFD5A6"
},
{
  "slug": "magic-paw",
  "name": "Magic Paw - Cartoon For Dogs",
  "tagline": "Magical mini-adventures crafted for dogs.",
  "subscriberCount": 50000,
  "videoCount": 30,
  "url": "https://www.youtube.com/channel/UC6Ak0T2v3cuoqXJU9lJ0gkQ",
  "bannerColor": "#C9A6E8",
  "characterSlug": "rocky",
  "avatarColor": "#E1CCF4"
},
{
  "slug": "doggo-dreams-tv",
  "name": "Doggo Dreams TV",
  "tagline": "Slow-cinema journeys for sleepy pups.",
  "subscriberCount": 50000,
  "videoCount": 30,
  "url": "https://www.youtube.com/channel/UCFGix2jR9bfzhOYIBxI3CjQ",
  "bannerColor": "#7DC4E2",
  "characterSlug": "max",
  "avatarColor": "#B6E3F4"
}
```

### Character slug verification

Before appending: grep `content/characters.json` for slugs `bella`, `oscar`, `rocky`, `max`. If any missing, substitute with an existing slug (e.g., `buddy`).

## Related Code Files

- Modify: `content/videos.json`
- Modify: `content/channels.json`
- Read-only: `content/characters.json` (to verify slugs)

## Implementation Steps

1. Read `content/characters.json` — confirm the 4 target slugs exist.
2. Edit `content/videos.json` — 6 Edit calls or a single multi-edit replace per mock-001..006 `youtubeId`.
3. Edit `content/channels.json` — append the 4 channel JSON objects to the `channels` array.
4. Run `pnpm typecheck`. Halt on errors (Zod parse runs at module load in `json-source.ts`).
5. Run `pnpm lint`. Halt on errors.
6. Quick sanity: load `/watch` in dev. Community Choice rail should show real YouTube thumbnails for the top videos. Our Channels rail should show 6 channels.

## Success Criteria

- [ ] mock-001..006 youtubeIds replaced with real IDs
- [ ] 6 total channels in channels.json (2 + 4)
- [ ] All `characterSlug` references valid
- [ ] Zod schemas parse cleanly at module load
- [ ] `pnpm typecheck` + `pnpm lint` clean

## Risk Assessment

- **`characterSlug` value missing** — Zod schema requires `z.string().min(1)`; passes validation but UI may break if it queries the character by slug and gets null. Mitigate via pre-edit verification.
- **`latestVideoId` omitted** — schema marks it optional. UI may show "no recent video" or similar; verify CompactChannelCard handles `null` gracefully (it does per the cycle-1 code review of `our-channels.tsx`).
- **Live YouTube URL (`D3vSMHj2mrg`)** — i.ytimg.com thumbnail still works for live videos.
- **Banner/avatar colors** — picked from a brand-coherent palette but not from existing design tokens. If user wants pure-token colors, can revisit later.
- **JSON formatting drift** — keep consistent 2-space indent; verify file after edit.
