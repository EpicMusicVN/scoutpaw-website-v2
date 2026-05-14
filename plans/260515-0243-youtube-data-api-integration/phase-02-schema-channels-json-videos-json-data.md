---
phase: 2
title: Schema + channels.json + videos.json data
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
---

# Phase 2: Schema + channels.json + videos.json data

## Overview

Schema relaxations + content data cleanup. ChannelSchema gains optional `avatarUrl` and `youtubeChannelId`; relaxes `bannerColor` to optional. channels.json drops the 2 mock entries and adds `youtubeChannelId` to the 4 real ones. videos.json drops dangling `channelSlug` references.

## Requirements

**Functional**
- ChannelSchema validates JSON entries WITH and WITHOUT `bannerColor`.
- ChannelSchema accepts new `avatarUrl?: string` field.
- ChannelSchema accepts new `youtubeChannelId?: string` field.
- channels.json: 4 channels total (was 6); each real channel has `youtubeChannelId`.
- videos.json: no video references `scoutpaw-tv` or `scoutpaw-music` via `channelSlug`.
- Zod parse at module load passes.

**Non-functional**
- Schema changes are forward-compatible (`.optional()` only).
- JSON edits preserve 2-space indent + trailing newline.

## Architecture

### Schema diff

```diff
  export const ChannelSchema = z.object({
    slug: z.string().min(1),
    name: z.string(),
    tagline: z.string(),
    subscriberCount: z.number().int().nonnegative(),
    videoCount: z.number().int().nonnegative(),
    url: z.string().min(1),
-   bannerColor: HexColorSchema,
+   bannerColor: HexColorSchema.optional(),
    characterSlug: z.string().min(1),
    avatarColor: HexColorSchema.optional(),
+   avatarUrl: z.string().optional(),
+   youtubeChannelId: z.string().optional(),
    latestVideoId: z.string().optional(),
  });
```

### channels.json target state

After phase 2, channels.json contains 4 entries (in order):

```json
{
  "channels": [
    {
      "slug": "puppy-lullaby-tv",
      "name": "Puppy Lullaby TV",
      "tagline": "Calming lullabies for restless pups.",
      "subscriberCount": 50000,
      "videoCount": 30,
      "url": "https://www.youtube.com/channel/UCy-QL5kMOtAPoDaq2VFoaRQ",
      "bannerColor": "#A8C7E8",
      "characterSlug": "bella",
      "avatarColor": "#D7E6F4",
      "youtubeChannelId": "UCy-QL5kMOtAPoDaq2VFoaRQ"
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
      "avatarColor": "#FFD5A6",
      "youtubeChannelId": "UCaiJ0puSQ9KdqZ7965j1W6w"
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
      "avatarColor": "#E1CCF4",
      "youtubeChannelId": "UC6Ak0T2v3cuoqXJU9lJ0gkQ"
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
      "avatarColor": "#B6E3F4",
      "youtubeChannelId": "UCFGix2jR9bfzhOYIBxI3CjQ"
    }
  ]
}
```

### videos.json cleanup

Use a Node script to walk all videos. For any video where `channelSlug === "scoutpaw-tv"` or `channelSlug === "scoutpaw-music"`, DELETE that field. The Video schema marks `channelSlug` as optional, so removal is safe.

```js
const fs = require('fs');
const file = 'D:/works/emvn/scoutpaw-v2/content/videos.json';
const v = JSON.parse(fs.readFileSync(file, 'utf8'));
const dropped = ['scoutpaw-tv', 'scoutpaw-music'];
let count = 0;
v.videos.forEach(x => {
  if (dropped.includes(x.channelSlug)) {
    delete x.channelSlug;
    count++;
  }
});
fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
console.log('Dropped channelSlug from', count, 'videos');
```

## Related Code Files

- Modify: `lib/content/schemas.ts`
- Modify: `content/channels.json`
- Modify: `content/videos.json`

## Implementation Steps

1. Edit `lib/content/schemas.ts` per the diff.
2. Rewrite `content/channels.json` with the 4-entry target state.
3. Run Node script to drop `channelSlug` references to removed channels in `content/videos.json`.
4. Run `pnpm typecheck`. Halt on errors (Zod parse fires at module load via `json-source.ts`).
5. Run `pnpm lint`. Halt on errors.

## Success Criteria

- [ ] ChannelSchema includes `avatarUrl` + `youtubeChannelId` (both optional)
- [ ] ChannelSchema's `bannerColor` is optional
- [ ] channels.json contains exactly 4 channels with `youtubeChannelId` populated
- [ ] No video has `channelSlug: "scoutpaw-tv"` or `"scoutpaw-music"`
- [ ] Zod schemas parse at module load
- [ ] `pnpm typecheck` + `pnpm lint` clean

## Risk Assessment

- **Other channel consumers of `bannerColor`** — grep for `.bannerColor` in components. If any access it without optional-chain guard, may break. Most uses are inline JSX with optional values; verify.
- **`channelSlug` FK dangling** — videos referencing dropped channels now have no `channelSlug`. UI handles `channel?: Channel | null` already. Acceptable.
- **JSON formatting drift** — when overwriting channels.json with `JSON.stringify(_, null, 2)`, ensure trailing newline + 2-space indent matches the codebase convention.
- **Existing 4-channel data already includes characterSlug/bannerColor** — no migration needed; we're just adding `youtubeChannelId`.
