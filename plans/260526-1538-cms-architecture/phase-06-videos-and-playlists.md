---
phase: 6
title: "Videos and Playlists"
status: pending
priority: P1
effort: "1.5d"
dependencies: [5]
---

# Phase 6: Videos and Playlists

## Overview

Migrate `videos.json` + `playlists.json`. Higher complexity than Characters because:
- Videos have FKs to characters (`characterSlugs[]`), channels (`channelSlug`), and playlists (`playlistId`)
- Channels gain back-FK to latest video
- Playlists hold a video ID list (M:N via array)
- YouTube Data API enrichment must continue working alongside CMS data

Depends on Phase 5 (channels FK target).

## Requirements

- Functional:
  - Collection `videos` mirrors `VideoSchema`, with relationships to characters + channels + playlists
  - Collection `playlists` mirrors `PlaylistSchema` with array of video relationships
  - All videos + playlists from JSON migrated, FKs preserved
  - `channels.latestVideo` back-FK populated
  - Adapter methods all swap to Payload: `getVideos`, `getFeaturedVideo`, `getLatestVideos`, `getVideosByCategory`, `getVideosByPlaylist`, `getPlaylists`, `getPlaylistById`
  - YouTube enrichment layer (existing `enrichChannels` / `enrichVideos`) continues to work — runs on adapter output before return
- Non-functional:
  - `/watch` SSG/ISR output identical pre/post-flip
  - Video local-asset uploads (`videoSrc`, `videoPoster`) handled by R2 adapter same way as images
  - YouTube fallback still works when API key absent

## Architecture

```
Payload Collections:
  - videos
      ├── relationship: channel → channels
      ├── relationship: characters[] → characters
      ├── relationship: playlist → playlists
      └── upload: thumbnail, videoSrc, videoPoster (all optional)
  - playlists
      ├── upload: coverImage
      └── relationship: videos[] → videos (array w/ ordering)

  channels (Phase 5)
      └── relationship: latestVideo → videos (added now)

Adapter pipeline (unchanged shape):
  Payload Local API → map to Zod schema → optional YouTube enrichment → return
```

**FK direction decision:** Use `playlist → videos[]` (playlist owns the list) AND `video.playlist` (backref). Payload supports `hasMany` relationships natively. Pick ONE source of truth — recommend `playlist.videos[]` (matches existing JSON where playlist holds `videoIds[]`), with `video.playlistId` auto-derived in the adapter from a reverse query.

## Related Code Files

- Create: `lib/payload/collections/videos.ts`
- Create: `lib/payload/collections/playlists.ts`
- Create: `scripts/seed-videos.ts`
- Create: `scripts/seed-playlists.ts`
- Modify: `lib/payload/collections/channels.ts` (add `latestVideo` relationship)
- Modify: `payload.config.ts` (register collections)
- Modify: `lib/content/sources/payload-source.ts` (implement 7 video/playlist methods)
- Reference: `content/videos.json`, `content/playlists.json`, `lib/content/sources/json-source.ts` (filter/sort logic to port), `lib/youtube/enrich.ts` (if present)

## Implementation Steps

1. **`lib/payload/collections/videos.ts`** — mirror `VideoSchema`:
   ```ts
   export const videos: CollectionConfig = {
     slug: "videos",
     versions: { drafts: true },
     access: { /* same pattern */ },
     hooks: { afterChange: [() => revalidateTag("videos")] },
     fields: [
       { name: "youtubeId", type: "text", required: true, unique: true, index: true },
       { name: "title", type: "text", required: true },
       { name: "characters", type: "relationship", relationTo: "characters", hasMany: true },
       { name: "channel", type: "relationship", relationTo: "channels" },
       { name: "playlist", type: "relationship", relationTo: "playlists" },
       { name: "category", type: "select", options: ["dogs","cats","shorts","funny","product-reviews","community"] },
       { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
       { name: "featured", type: "checkbox", defaultValue: false, index: true },
       { name: "viewCount", type: "number", min: 0 },
       { name: "duration", type: "text" },
       { name: "thumbnail", type: "upload", relationTo: "media" },
       { name: "uploadDate", type: "date" },
       { name: "videoSrc", type: "upload", relationTo: "media" },
       { name: "videoPoster", type: "upload", relationTo: "media" },
     ],
   };
   ```
2. **`lib/payload/collections/playlists.ts`** — mirror `PlaylistSchema`:
   ```ts
   export const playlists: CollectionConfig = {
     slug: "playlists",
     versions: { drafts: true },
     access: { /* same pattern */ },
     hooks: { afterChange: [() => revalidateTag("playlists")] },
     fields: [
       { name: "title", type: "text", required: true },
       { name: "description", type: "textarea" },
       { name: "coverImage", type: "upload", relationTo: "media", required: true },
       { name: "videos", type: "relationship", relationTo: "videos", hasMany: true },
       { name: "category", type: "select", required: true, options: ["calm-sounds","naps","adventures","ambient","stories","shorts"] },
       { name: "accentColor", type: "text", defaultValue: "#e8b547" },
       { name: "youtubeUrl", type: "text" },
     ],
   };
   ```
3. **Update `channels.ts` from Phase 5** — add `latestVideo` relationship (depth-1 read on adapter side):
   ```ts
   { name: "latestVideo", type: "relationship", relationTo: "videos" },
   ```
4. **Seed scripts** — order: videos first (so playlists can link to them), then playlists, then patch channels with `latestVideo` IDs.
   - `seed-videos.ts`: for each video in JSON, resolve character + channel relationships by slug → ID lookup, optional thumbnail/poster image upload, create with `_status: published`
   - `seed-playlists.ts`: resolve each `videoIds[]` to video IDs, create playlist
   - Post-step: patch each channel's `latestVideoId` → new video relationship ID
5. **`payload-source.ts` implementations** — port the JSON-source filter/sort logic. Use Payload's `where` for category/featured filters; in-memory sort for stable ordering. Examples:
   ```ts
   async getFeaturedVideo() {
     const payload = await getPayloadClient();
     const res = await payload.find({ collection: "videos", where: { featured: { equals: true } }, depth: 2, limit: 1 });
     return res.docs[0] ? VideoSchema.parse(mapVideo(res.docs[0])) : null;
   }
   async getLatestVideos(limit = 10) { /* sort: "-uploadDate" */ }
   async getVideosByCategory(category) { /* where category equals */ }
   async getVideosByPlaylist(playlistId) {
     const p = await payload.findByID({ collection: "playlists", id: playlistId, depth: 2 });
     return (p.videos ?? []).map(mapVideo).map(v => VideoSchema.parse(v));
   }
   async getPlaylists() { /* find all, sort by title */ }
   async getPlaylistById(id) { /* findByID + map videos to ids array */ }
   ```
6. **`mapVideo(doc)` helper** — central transform that converts Payload's nested relationship docs back to the JSON-flat shape (`channelSlug`, `characterSlugs[]`, `playlistId`) for downstream Zod parse:
   ```ts
   function mapVideo(d: any) {
     return {
       id: d.id,
       youtubeId: d.youtubeId,
       title: d.title,
       characterSlugs: (d.characters ?? []).map((c: any) => c.slug ?? c),
       channelSlug: d.channel?.slug,
       playlistId: d.playlist?.id,
       tags: (d.tags ?? []).map((t: any) => t.tag),
       featured: d.featured ?? false,
       category: d.category,
       viewCount: d.viewCount,
       duration: d.duration,
       thumbnail: d.thumbnail?.url,
       uploadDate: d.uploadDate,
       videoSrc: d.videoSrc?.url,
       videoPoster: d.videoPoster?.url,
     };
   }
   ```
7. **YouTube enrichment** — if `lib/youtube/enrich.ts` exists and JSON-source calls it post-fetch, payload-source should mirror that exact path. Enrichment is a read-side overlay; CMS data is the fallback. Verify behavior with/without `YOUTUBE_API_KEY`.
8. **Snapshot test** before/after the env flip on `/watch` + `/watch/[playlistId]` if such routes exist.

## Success Criteria

- [ ] All videos + playlists migrated, FKs intact
- [ ] `channels.latestVideo` populated correctly per channel
- [ ] All 7 video/playlist adapter methods return data matching JSON-source output (snapshot test)
- [ ] Filter chips on `/watch` (by category) work correctly
- [ ] Featured video on home renders correctly
- [ ] YouTube enrichment continues to overlay live stats when key present
- [ ] Editor can mark a different video as `featured` → home featured updates
- [ ] Editor can swap playlist coverImage → playlist tile updates
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Lighthouse on `/watch` unchanged

## Risk Assessment

- **`videos.playlist` + `playlists.videos[]` bidirectional drift** — single-side authoritative (playlist owns list) with backref read on video. Document; do NOT let editors edit `videos.playlist` directly (mark `admin.readOnly` on video doc OR remove the field; rely on inverse lookup from playlist side). Pick one and stick to it.
- **YouTube enrichment masks CMS-side bugs** — temporarily disable enrichment during cutover QA to validate CMS-only data accuracy
- **`featured` flag race** — multiple `featured=true` videos is possible; adapter takes first match. Acceptable; doc'd.
- **Migration order** — videos first, then playlists, then channels patch. Wrong order = FK resolution fails. Seed script must enforce sequence.
- **`tags` modeling** — Payload's array-of-text-object format vs. simple string array; adapter mapper normalizes to flat string[].
- **Image vs. video file size limits** — R2 default object size is generous; verify any single `videoSrc` upload stays under your limit
