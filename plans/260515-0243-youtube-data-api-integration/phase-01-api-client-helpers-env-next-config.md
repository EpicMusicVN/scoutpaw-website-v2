---
phase: 1
title: API client + helpers + env + next.config
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 1: API client + helpers + env + next.config

## Overview

Build the YouTube Data API foundation: `lib/youtube/` directory with client, types, ISO duration parser, and enrichment helpers. Plus env-var registration and `next.config.ts` hostname allowlist for yt3 avatars/thumbnails.

## Requirements

**Functional**
- `lib/youtube/client.ts` exports `fetchChannels(ids: string[])` + `fetchVideos(ids: string[])`.
- Returns `[]` on missing key, empty input, network failure, or non-OK response.
- `fetch(url, { next: { revalidate: 3600 } })` for 1hr caching.
- IDs batched in groups of 50 max per call (API allows comma-separated).
- `lib/youtube/types.ts` exports `YouTubeChannel` + `YouTubeVideo` interfaces.
- `lib/youtube/duration.ts` exports `parseISODuration(iso: string): string` → "1:23:45" / "5:30" / "0:45".
- `lib/youtube/enrich.ts` exports `enrichChannels(channels: Channel[]): Promise<Channel[]>` and `enrichVideos(videos: Video[]): Promise<Video[]>` that overlay API data on JSON.

**Non-functional**
- API key never exposed client-side (no `NEXT_PUBLIC_` prefix).
- Server-component-safe (no React imports in `lib/youtube/`).
- All public functions typed.

## Architecture

### `lib/youtube/client.ts`

```ts
import type { YouTubeChannel, YouTubeVideo } from "./types";
import { parseISODuration } from "./duration";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

function pickThumb(thumbs: Record<string, { url: string }> | undefined): string {
  return thumbs?.maxres?.url
    ?? thumbs?.high?.url
    ?? thumbs?.medium?.url
    ?? thumbs?.default?.url
    ?? "";
}

export async function fetchChannels(ids: string[]): Promise<YouTubeChannel[]> {
  if (!API_KEY || ids.length === 0) return [];
  const idParam = ids.slice(0, 50).join(",");
  const url = `${API_BASE}/channels?part=snippet,statistics&id=${idParam}&key=${API_KEY}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: any): YouTubeChannel => ({
      id: item.id,
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      thumbnailUrl: pickThumb(item.snippet?.thumbnails),
      subscriberCount: item.statistics?.subscriberCount ? Number(item.statistics.subscriberCount) : undefined,
      videoCount: item.statistics?.videoCount ? Number(item.statistics.videoCount) : undefined,
      customUrl: item.snippet?.customUrl,
    }));
  } catch {
    return [];
  }
}

export async function fetchVideos(ids: string[]): Promise<YouTubeVideo[]> {
  if (!API_KEY || ids.length === 0) return [];
  const idParam = ids.slice(0, 50).join(",");
  const url = `${API_BASE}/videos?part=snippet,contentDetails,statistics&id=${idParam}&key=${API_KEY}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: any): YouTubeVideo => ({
      id: item.id,
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      thumbnailUrl: pickThumb(item.snippet?.thumbnails),
      duration: parseISODuration(item.contentDetails?.duration ?? ""),
      publishedAt: item.snippet?.publishedAt ?? "",
      channelId: item.snippet?.channelId ?? "",
      channelTitle: item.snippet?.channelTitle ?? "",
      viewCount: item.statistics?.viewCount ? Number(item.statistics.viewCount) : undefined,
    }));
  } catch {
    return [];
  }
}
```

### `lib/youtube/types.ts`

```ts
export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount?: number;
  videoCount?: number;
  customUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  viewCount?: number;
}
```

### `lib/youtube/duration.ts`

```ts
/**
 * Convert YouTube's ISO 8601 duration (e.g. "PT1H23M45S") into "h:mm:ss" or
 * "m:ss" depending on whether hours are present. Returns "" for unparseable
 * input so callers can short-circuit cleanly.
 */
export function parseISODuration(iso: string): string {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return "";
  const hh = Number(m[1] ?? 0);
  const mm = Number(m[2] ?? 0);
  const ss = Number(m[3] ?? 0);
  if (hh > 0) {
    return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${mm}:${String(ss).padStart(2, "0")}`;
}
```

### `lib/youtube/enrich.ts`

```ts
import type { Channel, Video } from "@/lib/content";
import { fetchChannels, fetchVideos } from "./client";

/**
 * Overlay live YouTube data onto each JSON channel by `youtubeChannelId`.
 * Falls back to original JSON values when API returns nothing for an id.
 */
export async function enrichChannels(channels: Channel[]): Promise<Channel[]> {
  const ids = channels
    .map((c) => c.youtubeChannelId)
    .filter((x): x is string => Boolean(x));
  if (ids.length === 0) return channels;
  const api = await fetchChannels(ids);
  const byId = new Map(api.map((c) => [c.id, c]));
  return channels.map((c) => {
    if (!c.youtubeChannelId) return c;
    const live = byId.get(c.youtubeChannelId);
    if (!live) return c;
    return {
      ...c,
      name: live.title || c.name,
      avatarUrl: live.thumbnailUrl,
      subscriberCount: live.subscriberCount ?? c.subscriberCount,
      videoCount: live.videoCount ?? c.videoCount,
    };
  });
}

/**
 * Overlay live YouTube data onto each JSON video by `youtubeId`. Skips
 * placeholder IDs (TODO_*). Falls back to JSON when API returns nothing.
 */
export async function enrichVideos(videos: Video[]): Promise<Video[]> {
  const ids = videos
    .map((v) => v.youtubeId)
    .filter((id) => id && !id.startsWith("TODO_"));
  if (ids.length === 0) return videos;
  const api = await fetchVideos(ids);
  const byId = new Map(api.map((v) => [v.id, v]));
  return videos.map((v) => {
    const live = byId.get(v.youtubeId);
    if (!live) return v;
    return {
      ...v,
      title: live.title || v.title,
      thumbnail: live.thumbnailUrl || v.thumbnail,
      duration: live.duration || v.duration,
      uploadDate: live.publishedAt?.slice(0, 10) || v.uploadDate,
      viewCount: live.viewCount ?? v.viewCount,
    };
  });
}
```

### Env

`.env` — add:
```
# YouTube Data API v3 key (server-only; never NEXT_PUBLIC_).
# Restrict by HTTP referrer in Google Cloud Console for prod.
YOUTUBE_API_KEY=
```

`.env.local.example` — same line with comment about restriction.

### `next.config.ts`

```diff
  remotePatterns: [
    { protocol: "https", hostname: "cdn.shopify.com" },
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "img.youtube.com" },
    { protocol: "https", hostname: "images.scoutpaw.tv" },
+   { protocol: "https", hostname: "yt3.googleusercontent.com" },
+   { protocol: "https", hostname: "yt3.ggpht.com" },
  ],
```

## Related Code Files

- Create: `lib/youtube/client.ts`
- Create: `lib/youtube/types.ts`
- Create: `lib/youtube/duration.ts`
- Create: `lib/youtube/enrich.ts`
- Modify: `.env` (add `YOUTUBE_API_KEY=`)
- Modify: `.env.local.example` (document var)
- Modify: `next.config.ts` (yt3 hostnames)

## Implementation Steps

1. Create `lib/youtube/` directory.
2. Write the 4 TypeScript files.
3. Add `YOUTUBE_API_KEY=` to `.env` (placeholder — user pastes later).
4. Add documented line to `.env.local.example`.
5. Add yt3 hostnames to `next.config.ts` `remotePatterns`.
6. Run `pnpm typecheck`. Halt on errors.
7. Run `pnpm lint`. Halt on errors.

## Success Criteria

- [ ] All 4 lib/youtube files exist + export expected symbols
- [ ] `parseISODuration("PT1H23M45S")` → `"1:23:45"`
- [ ] `parseISODuration("PT5M30S")` → `"5:30"`
- [ ] `parseISODuration("PT45S")` → `"0:45"`
- [ ] `fetchChannels([])` and `fetchChannels(["x"])` with empty key return `[]`
- [ ] `.env` has `YOUTUBE_API_KEY=` line
- [ ] `next.config.ts` includes yt3 hostnames
- [ ] `pnpm typecheck` + `pnpm lint` clean

## Risk Assessment

- **API response shape variations** — different status codes, partial data, deprecated fields. Mitigated by `?? ""` defaults + try/catch wrapping.
- **TypeScript `any` in mappers** — used for response parsing; acceptable here since YouTube types are not strictly typed in our codebase. Could add stricter response types later (`@types/youtube` package exists but adds weight).
- **Privacy hook may block `.env` edit** — known from prior cycles. User pre-approved env edits if needed.
- **Duration regex doesn't handle PT0S edge case** — `PT0S` matches but returns `0:00` which is acceptable.
- **Cache stampede** — if many users hit cold cache simultaneously, multiple parallel fetches may briefly exceed quota. Next.js `revalidate` dedupes within a request; risk is low.
