# Brainstorm — YouTube Data API Integration (Cycle 5)

**Date:** 2026-05-15 02:43 (Asia/Saigon)
**Scope:** Cycle 5 of the originally-decomposed 5-cycle Watch+SEO roadmap. Integrate YouTube Data API v3 for dynamic channel + video metadata. Component-transparent via server-side enrichment helpers.
**Status:** Design agreed — awaiting plan decision.

---

## 1. Problem Statement

Watch page currently renders from `content/videos.json` + `content/channels.json` with hardcoded titles, thumbnails, sub counts. User wants real-time data from YouTube Data API: video titles/thumbnails/durations, channel logos/names/sub counts. API calls must be server-side (key never leaks), cached, with JSON acting as a fallback if API is down.

Plus minor cleanup carried over from prior cycle: aligned empty-state copy, removal of placeholder mock channels.

---

## 2. Decisions Locked

| Question | Choice |
|----------|--------|
| API key | User provides `YOUTUBE_API_KEY` (server-only). Stub fallback if missing. |
| Fetch strategy | Server components + `fetch(..., { next: { revalidate: 3600 } })` — 1hr revalidate, no client weight. |
| Data layer | JSON keeps IDs + fallback metadata. API enrichment merges on render. |
| Channel logos | API-only; existing `bannerColor`/`avatarColor` schema fields go optional. |
| Channel ID field | Add explicit `youtubeChannelId?: string` to ChannelSchema. |
| Mock channels | Drop `scoutpaw-tv` + `scoutpaw-music` (placeholder URLs). |
| Empty-state copy | Unified "No videos yet" everywhere. |
| Subscriber count | Show when API returns it; gracefully hide otherwise. |

---

## 3. Architecture

### 3.1 YouTube API client

**NEW dir:** `lib/youtube/`

```
lib/youtube/
├── client.ts        // fetchChannels(ids), fetchVideos(ids)
├── types.ts         // YouTubeChannel, YouTubeVideo
├── duration.ts      // parseISODuration("PT1H23M") → "1:23:00"
└── enrich.ts        // enrichChannels(jsonChannels), enrichVideos(jsonVideos)
```

**`client.ts`** — thin wrapper around fetch:

```ts
const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

export async function fetchChannels(ids: string[]): Promise<YouTubeChannel[]> {
  if (!API_KEY || ids.length === 0) return [];
  // Batches of 50 (YouTube limit); ids comma-separated.
  const url = `${API_BASE}/channels?part=snippet,statistics&id=${ids.join(",")}&key=${API_KEY}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map(mapChannel);
  } catch {
    return [];
  }
}
```

Same pattern for `fetchVideos(ids)` hitting `/videos?part=snippet,contentDetails,statistics`.

**Failure mode:** any error → returns `[]`. Caller falls back to JSON data. Site never breaks because of API outage / key issue.

**Quota:** channels.list = 1 unit per call. videos.list = 1 unit per call. 1hr revalidate → ~24 calls per day × 2 endpoints = 48 units/day. Free tier 10,000/day. Well under.

### 3.2 Types

```ts
export interface YouTubeChannel {
  id: string;            // UCxxx
  title: string;
  description: string;
  thumbnailUrl: string;  // high.url
  subscriberCount?: number;
  videoCount?: number;
  customUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;  // maxres or high
  duration: string;      // "1:23:45" (parsed from ISO 8601)
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  viewCount?: number;
}
```

### 3.3 Duration parser

`lib/youtube/duration.ts`:

```ts
export function parseISODuration(iso: string): string {
  // PT1H23M45S → "1:23:45"; PT5M30S → "5:30"; PT45S → "0:45"
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const [, h, mn, s] = m;
  const hh = Number(h ?? 0);
  const mm = Number(mn ?? 0);
  const ss = Number(s ?? 0);
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}
```

### 3.4 Enrichment helpers

`lib/youtube/enrich.ts`:

```ts
import type { Channel, Video } from "@/lib/content";
import { fetchChannels, fetchVideos } from "./client";

// Returns Channel[] with API data overlaid on JSON fields. Falls back to
// JSON values if API returns nothing for an entry.
export async function enrichChannels(channels: Channel[]): Promise<Channel[]> {
  const ids = channels.map((c) => c.youtubeChannelId).filter((x): x is string => !!x);
  if (ids.length === 0) return channels;
  const apiData = await fetchChannels(ids);
  const byId = new Map(apiData.map((c) => [c.id, c]));
  return channels.map((c) => {
    if (!c.youtubeChannelId) return c;
    const api = byId.get(c.youtubeChannelId);
    if (!api) return c;
    return {
      ...c,
      name: api.title,
      // Store the avatar URL on the Channel for the card to read.
      avatarUrl: api.thumbnailUrl,
      subscriberCount: api.subscriberCount ?? c.subscriberCount,
      // tagline left to JSON unless API description is desired (TBD)
    };
  });
}
```

Same pattern for `enrichVideos(videos: Video[]): Promise<Video[]>` — overlays `title`, `thumbnail`, `duration`, `publishedAt` from API when youtubeId is real (not `TODO_*`).

### 3.5 Schema updates

`lib/content/schemas.ts`:

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
-   avatarColor: HexColorSchema.optional(),
+   avatarColor: HexColorSchema.optional(),
+   avatarUrl: z.string().optional(),
+   youtubeChannelId: z.string().optional(),
    latestVideoId: z.string().optional(),
  });
```

Keep `bannerColor` for the existing colored backdrop on CompactChannelCard. Make optional so future entries don't need it.

### 3.6 Page-level enrichment

`app/watch/page.tsx`:

```diff
  const [videos, channels, characters, config, featured] = await Promise.all([
    content.getVideos(),
    content.getChannels(),
    content.getCharacters(),
    content.getSiteConfig(),
    content.getFeaturedVideo(),
  ]);
+ const [enrichedVideos, enrichedChannels] = await Promise.all([
+   enrichVideos(videos),
+   enrichChannels(channels),
+ ]);
+ const enrichedFeatured = featured ? (await enrichVideos([featured]))[0] : null;
- // pass `videos`/`channels`/`featured` to components
+ // pass enriched versions instead
```

Components stay component-transparent — they still read `video.title`, `channel.name`, etc. The enrichment is a server-side pass.

### 3.7 channels.json updates

- Remove `scoutpaw-tv` + `scoutpaw-music` entries.
- Add `youtubeChannelId` field to the 4 real channels:
  - puppy-lullaby-tv → `UCy-QL5kMOtAPoDaq2VFoaRQ`
  - happy-paws-cartoon → `UCaiJ0puSQ9KdqZ7965j1W6w`
  - magic-paw → `UC6Ak0T2v3cuoqXJU9lJ0gkQ`
  - doggo-dreams-tv → `UCFGix2jR9bfzhOYIBxI3CjQ`
- Existing characterSlug (bella, oscar, rocky, max) + bannerColor stays — used for card theming. avatarColor stays as fallback.

### 3.8 channels.json videos referencing dropped channels

Videos in videos.json reference `channelSlug: "scoutpaw-tv"` / `"scoutpaw-music"`. Removing those breaks the channelSlug FK. Options:
- Remap video `channelSlug` to one of the new channels.
- Drop the channelSlug from video entries (it's optional).
- Keep the 2 mock channels but skip API enrichment (yields cycle-back to brainstorm question — user chose "drop").

**Recommend:** drop `channelSlug` field from existing videos OR map them to `doggo-dreams-tv` (max-themed) since featured video is dog content. Easiest path: set all dog videos to `doggo-dreams-tv` and other-category videos to whichever matches thematically. Actually simplest: just drop the `channelSlug` field from videos — UI handles missing channel gracefully (already seen via `channel?: Channel | null` in WatchHero typing).

### 3.9 Component updates

Most components transparent. Specific updates:

- **`components/watch/our-channels.tsx`** — `CompactChannelCard` currently uses `character.image` as the avatar (line 166: `src={assetUrl(character.image)}`). Switch to API `avatarUrl` when present. Pseudo: `src={channel.avatarUrl ? channel.avatarUrl : assetUrl(character.image)}`.
- **Note:** `channel.avatarUrl` is a YouTube URL (not under our R2). Already allowed via Next remotePatterns? Need to add `yt3.googleusercontent.com` to `remotePatterns` in next.config.ts (and possibly `yt3.ggpht.com` which YouTube also uses).
- **Sub count display** — already shown in card if `subscriberCount > 0`. Gracefully degrades.

### 3.10 Empty state copy

- `components/watch/explore-videos.tsx` line 79-81: change `"No videos in this category yet — try All."` → `"No videos yet"` (or keep both forms — user said "everywhere"; let me lean toward minimal unified copy).
- `components/watch/video-rail.tsx` (Community Choice rail): inspect for empty handling. If no empty state exists, add one with same "No videos yet" copy.

### 3.11 Env update

`.env` adds `YOUTUBE_API_KEY=` (placeholder). User pastes their key locally.
`.env.local.example` documents the var.

**SECURITY:** key is server-only (NO `NEXT_PUBLIC_` prefix). Recommend restricting by HTTP referrer in Google Cloud Console once domain is known. Document this in the env example comment.

### 3.12 Next.config remotePatterns

Add YouTube avatar/thumbnail hostnames:

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

---

## 4. Files Touched

**NEW:**
- `lib/youtube/client.ts`
- `lib/youtube/types.ts`
- `lib/youtube/duration.ts`
- `lib/youtube/enrich.ts`

**Modify:**
- `.env` (add `YOUTUBE_API_KEY=`)
- `.env.local.example` (document var)
- `next.config.ts` (yt3 hostnames)
- `lib/content/schemas.ts` (add `youtubeChannelId`, `avatarUrl`; relax `bannerColor`)
- `content/channels.json` (drop 2 mock, add `youtubeChannelId` to 4 real)
- `content/videos.json` (drop `channelSlug` from videos that referenced dropped channels OR remap)
- `app/watch/page.tsx` (enrichVideos + enrichChannels server-side)
- `app/page.tsx` (Home if it surfaces channels/videos via VideoGrid — verify)
- `components/watch/our-channels.tsx` (read `avatarUrl` over `character.image`)
- `components/watch/explore-videos.tsx` (unified empty copy)
- `components/watch/video-rail.tsx` (empty state if missing)

**Out of scope:**
- Live ConvertKit (separate cycle).
- Real-time push (websockets etc.) — not needed.
- OAuth for private/owned channels — using public API key only.

---

## 5. Risks / Concerns

1. **API key restriction** — if user restricts by HTTP referrer in Google Cloud Console BEFORE deploying, dev mode will fail. Document: dev uses no referrer restriction; tighten in prod.
2. **Quota exhaustion** — 1hr revalidate × N pages × ~30 video lookups could exceed if traffic spikes. Mitigation: batch all video IDs into ONE fetch per page render (channels.list + videos.list both support up to 50 IDs comma-separated). With 30 videos + 4 channels, total = 2 API calls per cold revalidate. 48 units/day. Negligible.
3. **Stub fallback exposes JSON data** — if API key empty, site shows JSON fallback values. That's the intended graceful degradation. Document this.
4. **`channelSlug` FK breakage** — videos reference `scoutpaw-tv` / `scoutpaw-music`. After dropping those channels, the reference is dangling. UI handles `channel?: Channel | null` (already null-safe). But `our-channels.tsx` may look weird if it tries to render the latest video for a dropped channel. Acceptable.
5. **`bannerColor` removal from required** — existing 2 channels have it; new 4 will too. Schema relaxation is forward-compatible.
6. **Thumbnail vs avatar dimensions** — YouTube channel `snippet.thumbnails.high` is 800×800 (avatar). `medium` is 240×240. Use `high` for best quality. Next Image optimizes via remotePatterns.
7. **Component breakage if `avatarUrl` typing** — verify CompactChannelCard image element handles either URL form.
8. **Race condition between enrich + render** — Next caches by URL; same input → same output. Safe.
9. **`channel.tagline` vs API `description`** — JSON `tagline` is short brand-coherent copy. API `description` is the YouTube channel's full description (often paragraphs). KEEP JSON tagline as the displayed text. API description NOT shown.
10. **`channel.url` vs API `customUrl`** — JSON `url` is the full YouTube channel URL (working fine). API returns `customUrl` (e.g. `@PuppyLullabyTV`) which can be appended to youtube.com/. Stay with JSON `url`.
11. **Existing JSON tagline placeholders** — the 4 new channels have hand-written taglines from cycle 4. Acceptable; not replaced.
12. **Video count placeholder values** — 50000 subs / 30 videos hardcoded. After API enrichment, real values overlay these. Stale only when API down → JSON shown.

---

## 6. Success Criteria

- `lib/youtube/` directory + 4 files created.
- `app/watch/page.tsx` calls `enrichVideos` + `enrichChannels` server-side.
- With `YOUTUBE_API_KEY` set: channel cards show real avatars, real names, real sub counts. Video cards show real titles + thumbnails + durations.
- With `YOUTUBE_API_KEY` empty: site falls back to JSON values — no breakage.
- Empty-category filters show "No videos yet" placeholder.
- Community Choice rail shows "No videos yet" placeholder when empty.
- `pnpm typecheck` + `pnpm lint` clean.
- Quota usage: ~2 API calls per cold revalidate (channels + videos batched).

---

## 7. Open Questions

_None — all locked._

---

## 8. Next Steps

- Decision: `/ck:plan` (4 phases) or direct implement.
- During implementation: user provides `YOUTUBE_API_KEY` value to test live.
- After this cycle: deferred cycles 2-4 (responsive audit, SEO audit, fixes) still pending.
