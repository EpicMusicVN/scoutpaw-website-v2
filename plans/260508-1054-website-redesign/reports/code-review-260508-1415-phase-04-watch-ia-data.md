---
type: code-review
phase: 4
slug: phase-04-watch-ia-data
date: 2026-05-08
reviewer: code-reviewer
status: DONE_WITH_CONCERNS
---

# Phase 4 Watch IA + Data — Code Review

## Scope

- Modified: `lib/content/schemas.ts`, `lib/content/adapter.ts`, `lib/content/sources/json-source.ts`, `lib/content/sources/sanity-source.ts`, `lib/content/index.ts`
- Modified: `content/videos.json` (30 entries), `content/channels.json` (added `latestVideoId`)
- Created: `content/playlists.json` (3 playlists)
- Created: `components/watch/video-rail.tsx`, `components/watch/playlist-grid.tsx`
- Modified: `components/watch/featured-video.tsx`, `components/watch/our-channels.tsx`, `components/watch/video-card.tsx`
- Modified: `app/watch/page.tsx` (full IA rewrite)
- Deleted: `components/watch/top-videos.tsx`
- Verified locally: `pnpm typecheck` clean, `pnpm build` clean, Watch route is `○ Static` at 160 KB first-load.

## Overall Assessment

The content-layer plumbing is the strong part of this phase. Extending the existing `ContentSource` interface (rather than building a parallel `videos-adapter.ts`) is the **right call** — it satisfies the spirit of the plan ("swap to YouTube Data API later is content-layer-only — zero UI rewrite") with less surface area. The Sanity stub honors the new methods, all new fields on `Video`/`Channel`/`Playlist` are optional or defaulted so existing JSON validates against the extended schema, and the `id ?? youtubeId` fallback in `json-source.ts:40` keeps legacy entries working. Components import only from `@/lib/content`; the swap path is real.

The UI layer is mostly solid: `VideoCard` is now the canonical card consumed by `VideoGrid` (Home), `VideoRail`, `OurChannels` (via `latestVideoId` lookup), and the featured hero, so the "single shape" goal is met. The `VideoRail` scroll-snap + nav-arrow logic is well-bounded for the common cases.

**Three findings should land before this phase is called done**, none critical-blocking but two of them sit on the user's primary CTAs in the new IA.

1. **`PlaylistGrid` link contract is broken.** Cards link to `/watch?playlist=ID#library`, but `WatchLibrary` doesn't read the query param — the playlist filter is silently dropped. User clicks "Open playlist" → scrolls to library showing **all 30 videos**, with no indication the filter was ignored. The implementation either needs to plumb the filter through (preferred) or stop promising one (downgrade copy + remove the query param). This is the same class of bug as P3's `#products?cat=…` href, so worth treating with the same urgency.

2. **`OurChannels` ships a 2-col grid, not the rail the plan called for, and the data only has 2 channels.** Plan says "Channel rail shows 6-7 channels w/ latest video thumbnail" (`phase-04-watch-ia-data.md:99,156`); implementation uses `grid grid-cols-1 md:grid-cols-2` with 2 entries in `channels.json`. The component name "rail" + the plan's success criteria are both unmet. Either restore the rail layout and seed 6–7 channels, or update the plan + section heading to reflect the deliberate scope cut.

3. **`VideoCard` `formatDate()` uses `Date.now()` from a statically-prerendered page.** `app/watch/page.tsx` is `○ Static`, so the build-time clock determines the relative-date bucket ("Today", "Yesterday", "X weeks ago"). Two consequences: (a) **hydration mismatch warning** the moment a user's browser clock crosses a bucket boundary the build clock sat on (cheap to trigger by waiting a day), (b) **stale relative dates** that drift further from reality the longer the deploy lives. Switching to absolute date format (matching `featured-video.tsx`'s `toLocaleDateString` choice) is the cheapest fix; alternatively, render relative dates from a small `"use client"` `<RelativeDate>` wrapper that suppresses hydration via `useEffect` — but consistency with `FeaturedVideo` favors absolute.

The remaining findings are mediums and polish.

---

## Critical Issues

None.

---

## High Priority

### H1. PlaylistGrid → Watch library filter is a dead query param
**File:** `components/watch/playlist-grid.tsx:44`, `components/watch/watch-library.tsx` (no consumer)

```tsx
href={`/watch?playlist=${playlist.id}#library`}
```

`WatchLibrary` only filters by character (`watch-library.tsx:30-33`). It never reads `useSearchParams()` and there's no `playlist`-aware code path. Click → URL updates → browser scrolls to `#library` → user sees the full 30-video grid filtered to "All". The card's affordance text ("Open playlist", with a directional arrow) explicitly promises a filtered view.

This is a UX-level breaking change in the new IA — it's the only way the user can act on a playlist tile.

**Recommended fix — pick one:**

**A. Plumb the filter (preferred — matches the card's promise).**

```tsx
// app/watch/page.tsx — read the param server-side and pass into WatchLibrary
export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ playlist?: string }>;
}) {
  const params = await searchParams;
  // ...
  const playlistVideos = params.playlist
    ? await content.getVideosByPlaylist(params.playlist)
    : null;
  // pass into <WatchLibrary initialPlaylistId={params.playlist} ... />
}
```

Then `WatchLibrary` adds a playlist-mode chip row alongside characters, or accepts an `initialPlaylistId` prop and pre-filters. The adapter already exposes `getVideosByPlaylist` and `getPlaylistById` — wiring is half-done.

**B. Make the link honest (cheaper — defer real filter to next phase).**

Drop the query param, scroll directly to `#library`, and change the card label to "View library" or "See all videos". Removes the false promise without expanding scope.

Either option closes the gap; (A) preserves the IA the plan describes.

---

### H2. OurChannels is a 2-card grid; plan + heading both promise a rail
**File:** `components/watch/our-channels.tsx:54`, `content/channels.json`

```tsx
<ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
```

- Phase plan (`phase-04-watch-ia-data.md:92,99,156`): channel showcase is a horizontal rail with 6-7 channels.
- Implementation: 2-column grid with 2 channels in seed data.
- Section copy "Our Channels." reads as plural-aspirational; with 2 cards it looks like content was cut.

The component is actually fine in isolation — it shows the avatar, sub count, latest video thumbnail per `latestVideoId`, character peek, all clean. The miss is the IA shape.

**Recommended fix — pick one:**

**A. Match the plan.** Add 4-5 more channels to `content/channels.json` (the brand already has scoutpaw-tv + scoutpaw-music; spinning up character-focused channels like "Buddy's Backyard", "Max's Trails" matches the brand voice from earlier phases) and reflow the component as a horizontal rail (could reuse `VideoRail`'s scroll-snap shell — different card, same chrome).

**B. Update the plan to reflect the cut.** If 2 channels is the intentional MVP scope, edit `phase-04-watch-ia-data.md` Success Criteria + Architecture to say "2 channels, grid layout" so future agents don't read the file as still-aspirational. Adjust section heading + tagline copy ("Our two channels.") to read intentionally.

---

### H3. VideoCard formatDate uses Date.now() inside a statically-prerendered tree → hydration mismatch + stale buckets
**File:** `components/watch/video-card.tsx:130-142`

```ts
function formatDate(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  const diffMs = Date.now() - then.getTime();
  // ... bucket into "Today" / "X days ago" / "X weeks ago" / ...
}
```

`VideoCard` is rendered server-side at build time (statically) inside both `VideoGrid` (Home) and `VideoRail` (Watch — via `"use client"` boundary that still produces SSR HTML). On the client, hydration re-runs the render with the user's browser `Date.now()`.

Two specific failure modes:

1. **Hydration mismatch** when build clock and visit clock straddle a bucket boundary. For a video with `uploadDate: "2026-04-22"` (mock-001), if the build runs on day 16 (server bucket = "2 weeks ago") and the user visits on day 22 (client bucket = "3 weeks ago"), React 19 logs a hydration error and re-renders. Boundaries between every bucket (1 day, 7 days, 30 days, 365 days) all hit this.
2. **Stale dates baked into the build.** A static page deployed on May 8 keeps showing relative dates computed from May 8 forever — every video appears progressively younger than it actually is. For a marketing-grade page that's content-stable for weeks at a time, this is a real freshness signal regression.

**Note:** `featured-video.tsx:135-139` already uses absolute `toLocaleDateString` and is fine. The inconsistency between the two formatters is itself a smell.

**Recommended fix — pick one:**

**A. Switch VideoCard to absolute dates** (matches the featured hero, no hydration risk):

```ts
function formatDate(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  return then.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
```

**B. Keep relative dates but mount them client-side only**:

```tsx
"use client";
function RelativeDate({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => { setLabel(computeRelative(iso, Date.now())); }, [iso]);
  return <span>{label ?? <DefaultAbsoluteDate iso={iso} />}</span>;
}
```

(A) is the YAGNI choice and matches the existing convention.

---

## Medium Priority

### M1. `Video.channelId` references `Channel.slug` — naming collision invites future bugs
**Files:** `lib/content/schemas.ts:43,53-65`, `app/watch/page.tsx:35`, `content/videos.json:13`, `content/channels.json:4`

The plan called for `Channel.id`; the implementation kept the existing `slug` field on Channel but introduced `channelId` on `Video`. So the lookup is `channels.find((c) => c.slug === featured.channelId)`. It works, but:
- A reader naturally expects `channelId` to be `Channel.id`.
- A future schema migration (e.g., Sanity moves to opaque `_id`) will break only by careful audit, not by typecheck.
- The same naming disconnect would bite a YouTube Data API adapter (channels have real string IDs there, distinct from handles).

**Recommended fix:** in `ChannelSchema`, add an `id` alias that defaults to `slug` for back-compat:

```ts
export const ChannelSchema = z.object({
  id: z.string().optional(),  // canonical FK target; defaults to slug
  slug: z.string().min(1),
  // ...
}).transform((c) => ({ ...c, id: c.id ?? c.slug }));
```

Then update `Video.channelId` consumers to compare against `c.id`. Mirrors what `json-source.ts:40` already does for `Video`.

Lower-cost alternative: rename `Video.channelId` to `Video.channelSlug` and align comments; explicit but spreads diff across data + types.

---

### M2. WatchLibrary uses `youtubeId` as React key — collides if two mocks share `TODO_*` placeholders or if real IDs ever duplicate
**File:** `components/watch/watch-library.tsx:86`

```tsx
{filtered.map((video) => {
  // ...
  return (<li key={video.youtubeId}>);
```

For mock data this is fine because `TODO_youtube_id_1` … `_30` are unique. But:
- The whole rest of the codebase keys off `video.id ?? video.youtubeId` (`video-rail.tsx:102`, `our-channels.tsx:38`). The schema's `id` is the stated stable key.
- If any two videos legitimately point to the same YouTube ID (not impossible — channels re-upload, mirrors, multi-locale shorts), React renders a key collision warning and one card silently disappears.

**Fix:** key off `video.id ?? video.youtubeId` for consistency.

---

### M3. WatchLibrary still renders YouTube `hqdefault` thumbnails directly via inline `style={{ backgroundImage: ... }}` — bypasses VideoCard, no `thumbnail` field, no placeholder for `TODO_*` ids
**File:** `components/watch/watch-library.tsx:94-99`

```tsx
<div
  className="relative aspect-video w-full bg-cover bg-center"
  style={{ backgroundImage: `url(https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg)` }}
>
```

Compare with `VideoCard` and `FeaturedVideo`, which both honor `video.thumbnail` first and fall back to `/assets/banner/banner.png` for `TODO_*` placeholders. The library page is statically prerendered with all 30 mocks marked `TODO_…` (page filters them out via `app/watch/page.tsx:38`, so today the library renders zero cards in the deployed build — the empty-state copy fires). But the moment one real ID lands and 29 placeholders remain, the placeholders that pass the filter… wait, the filter strips placeholders. So this only matters once *any* video lands and the rest follow. Still, the asymmetry is a smell:

- VideoCard already provides every behavior the library needs (thumbnail fallback, play overlay, character chips can become a `<MetaLine>` extension).
- Plan note: "components/watch/watch-library.tsx — verify works w/ extended schema; keep filter logic" — extended schema is being half-honored.

**Recommended fix:** swap the inline thumbnail block for `<VideoCard video={video} variant="default" />` and either render character chips inside VideoCard via a new prop (`characterTags?: Character[]`) or above the card. This collapses two divergent thumbnail-rendering code paths into one.

---

### M4. `VideoCard` renders YouTube CDN URLs without `next/image` configuration check — verify `images.remotePatterns` includes `i.ytimg.com`
**File:** `components/watch/video-card.tsx:30`, `components/watch/featured-video.tsx:23`, `components/watch/our-channels.tsx:88`

All three use `<Image src={\`https://i.ytimg.com/vi/${id}/...\`} />` for non-placeholder videos. `next/image` requires the host to be allowlisted in `next.config.ts`. The build passed only because every mock has a `TODO_*` `youtubeId` so the `isPlaceholder` branch always wins and `/assets/banner/banner.png` is local. Once one real YouTube ID lands, the build will fail with `Invalid src prop … hostname "i.ytimg.com" is not configured under images in your next.config.js`.

**Verification needed:** check `next.config.ts` for `i.ytimg.com` (or `img.youtube.com`) under `images.remotePatterns`. If absent, add:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "img.youtube.com" },
  ],
},
```

This is a "passes CI today, breaks on the day a real ID lands" failure mode — exactly the class this review is meant to catch.

---

### M5. `getFeaturedVideo` falls back to `sortedByDateDesc[0]` even when no entry has `featured: true` — silently masks data errors
**File:** `lib/content/sources/json-source.ts:65-67`

```ts
async getFeaturedVideo() {
  return sortedByDateDesc.find((v) => v.featured) ?? sortedByDateDesc[0] ?? null;
},
```

Today four videos are flagged `featured: true` so this never matters. But if a content editor flips all `featured` flags off (intentionally, e.g., during a content cleanup), the page silently picks the latest video and presents it under a "Featured Now" kicker. The editor has no signal their intent was overridden.

**Recommended fix:** drop the `?? sortedByDateDesc[0]` fallback. Return `null` if no video is flagged. The Watch page already handles `null` correctly (`app/watch/page.tsx:58` — `{featured && (...)}`). The "always show something" contract is incompatible with the curator's intent to suppress featuring.

---

## Low Priority

### L1. `VideoSchema.id` is optional — but every consumer treats it as the stable FK target
**File:** `lib/content/schemas.ts:34`

```ts
id: z.string().min(1).optional(),
```

`channels.latestVideoId`, `playlists.videoIds[]` reference `Video.id`. The `id ?? youtubeId` fallback covers legacy entries, but the optionality means a contributor can drop a video into `videos.json` without an `id` and break FK references silently. Consider making `id` required for entries that are FK targets — or at least add a build-time invariant that every `latestVideoId` and every `playlists.videoIds[]` resolves.

A tiny helper in `json-source.ts` would catch this at module-load:

```ts
const idSet = new Set(videos.map(videoId));
for (const ch of channels) {
  if (ch.latestVideoId && !idSet.has(ch.latestVideoId)) {
    throw new Error(`[content] channel ${ch.slug} latestVideoId "${ch.latestVideoId}" not found`);
  }
}
for (const pl of playlists) {
  for (const vid of pl.videoIds) {
    if (!idSet.has(vid)) throw new Error(`[content] playlist ${pl.id} videoId "${vid}" not found`);
  }
}
```

Same fail-fast spirit as the existing Zod parse on JSON files.

---

### L2. `tags`, `category`, and `playlistId` fields on `Video` are written but never filtered/displayed in primary surfaces
**Files:** `lib/content/schemas.ts:46-48`, `components/watch/watch-library.tsx`

The library only filters by character. `category` is shown as a chip on cards but isn't a filter. `tags` are unused in any UI. `playlistId` is unused for filtering (see H1).

Mild YAGNI flag — schema growth is fine if it's earning its keep in P5+. Worth a follow-up plan note that says "category chips on Watch library = P5" so the unused fields don't drift into stale data.

---

### L3. `formatViews` is duplicated in `video-card.tsx:123-127` and `featured-video.tsx:129-133`
**Files:** `components/watch/video-card.tsx:123-127`, `components/watch/featured-video.tsx:129-133`

Identical implementation. Trivial DRY violation; extract to `lib/utils/format-views.ts` (or `lib/format/numbers.ts`) and import.

---

### L4. `formatSubs` in `our-channels.tsx` rounds K to 0 decimals, but `formatViews` rounds to 1 decimal — inconsistent feel
**Files:** `components/watch/our-channels.tsx:5-9`, `components/watch/video-card.tsx:124`

`142000` subscribers → "142K"; `142000` views → "142.0K" (then `.replace(/\.0$/, "")` → "142K"). End result is the same here, but the regex is doing real work elsewhere. Not a bug; if/when a single utility lands per L3, unify.

---

### L5. `VideoRail` `useEffect` dependency `[videos.length]` misses array-content swaps where length is stable
**File:** `components/watch/video-rail.tsx:46`

If a parent ever passes a new `videos` array of the same length (e.g., user swaps playlists), the effect skips re-running. Today nothing exercises this path (videos is server-passed once), but the moment client-side filtering lands the rail's nav-arrow visibility could lag. Use `[videos]` (full ref) for safety.

---

### L6. `OurChannels` builds a `Map` over all videos every render to find one channel's latest video
**File:** `components/watch/our-channels.tsx:36-39`

```tsx
const videoById = new Map(videos.map((v) => [v.id ?? v.youtubeId, v]));
```

For 30 videos this is unmeasurable. Not actionable today; flag for the day the dataset moves from JSON to YouTube API and starts returning hundreds of entries.

---

### L7. `PlaylistGrid` cards apply `transition-all` on a gradient + `Image` scale + `box-shadow` — mobile motion respects `prefers-reduced-motion`?
**File:** `components/watch/playlist-grid.tsx:45,57`

The card has `transition-all duration-300 ease-gentle hover:rotate-0 hover:-translate-y-2` etc. Reduced-motion users on touch devices won't trigger hover, so this is mostly moot, but:
- The `group-hover:scale-105` on the image (line 57) does fire on focus-within if a child gets focus.
- No explicit `motion-reduce:` modifier prevents these.

Plan success criterion: "All hover/scroll animations respect reduced-motion." Add `motion-reduce:hover:transform-none motion-reduce:hover:rotate-0` (or wrap in a `useReducedMotion`-aware client component) to honor that promise.

Same pattern in `featured-video.tsx:36`, `our-channels.tsx:96`, `video-card.tsx:50`. Low-impact since hover doesn't fire on touch, but the success criterion is explicit.

---

## Edge Cases (verified)

- **Empty playlist (`videoIds: []`):** PlaylistGrid renders the card with "0 videos" badge; click → /watch?playlist=ID#library → see H1 (no filter, just scrolls). VideoRail handles `videos.length === 0` early return. Not a crash, just visual oddness.
- **All cards fit on screen (no horizontal overflow):** VideoRail nav arrows correctly hide; verified `el.scrollLeft + el.clientWidth < el.scrollWidth - 4` evaluates false when `scrollWidth ≈ clientWidth`.
- **Channel `latestVideoId` points to a deleted/missing video:** `videoById.get(...)` returns undefined → `latestVideo ?? null` → ChannelCard renders with no thumbnail (line 144 conditional). Character peek + banner color still show. Graceful.
- **Featured video with no `channelId`:** `app/watch/page.tsx:34` short-circuits to `null`; FeaturedVideo renders without channel meta. Graceful.
- **All `featured` flags false:** Falls back to most recent video (M5).
- **Sanity stub typecheck:** `notImplemented` returns `never`; `never` is assignable to `Promise<X>` for any X. Build passes. Stub correctly satisfies the interface contractually.
- **Non-Latin upload dates (locale concern):** Both `formatDate` paths use explicit `"en-US"` locale or English month strings — no SSR/CSR locale drift.

---

## Positive Observations

1. **Schema strategy deviation is sound.** Extending `ContentSource` instead of building a parallel `videos-adapter.ts` matches YAGNI/DRY. The plan's separate-adapter sketch (`lib/content/videos-adapter.ts`) would have duplicated source-selection logic that already lives in `lib/content/index.ts`. The current shape — one interface, multiple implementations selected by `CONTENT_SOURCE` env — is the simpler thing that satisfies the spec.
2. **All Phase 4 fields on `Video`/`Channel` are optional or defaulted.** Existing data (e.g., FeaturedPupSpotlight reading characters, Home VideoGrid reading videos with the older shape) still validates and renders. Backward-compatible schema evolution done right.
3. **`json-source.ts:40` `videoId(v)` helper.** Centralizes the `id ?? youtubeId` fallback. Consumers that key off it stay correct as data migrates.
4. **`getVideosByPlaylist` preserves curated order.** Comment on `json-source.ts:77` is explicit about this — the right call when playlists are hand-ordered.
5. **VideoCard variants stay data-shape-stable.** The `compact | default | featured` switch only affects sizes/density; the underlying props are uniform. Plan goal of "single canonical card" is achieved cleanly.
6. **Comment quality.** `lib/content/adapter.ts`, `json-source.ts`, `sanity-source.ts` all explain the swap path. Future migrators have the context they need.
7. **Sanity stub error message names the method.** `[content/sanity] getFeaturedVideo() not implemented yet.` — easier to debug than a generic "not implemented".
8. **Build budget held.** Watch first-load JS at 160 KB (+2 KB) for a meaningfully larger page is good; the IA expansion didn't ship a JS regression.

---

## Recommended Actions (Prioritized)

1. **H1** — wire `?playlist=ID` through `WatchLibrary`, OR strip the param + downgrade card label to "View library". Don't ship a CTA that lies.
2. **H2** — either seed channels.json to 6-7 entries + reflow as horizontal rail, OR amend the plan to make the 2-card grid the explicit intent.
3. **H3** — switch `VideoCard.formatDate` to absolute dates (matches `FeaturedVideo`); kills hydration risk + bake-staleness in one move.
4. **M4** — verify `next.config.ts` allowlists `i.ytimg.com` before any real YouTube ID lands.
5. **M3** — refactor `WatchLibrary` to use `<VideoCard />` so thumbnail-fallback logic isn't duplicated.
6. **M1** — rename `Video.channelId` → `channelSlug` OR add canonical `Channel.id` (defaulting to `slug`); align consumers.
7. **M2** — key WatchLibrary `<li>` off `video.id ?? video.youtubeId` for consistency.
8. **M5** — drop the `getFeaturedVideo` fallback; respect editor intent.
9. **L1** — add FK validation at module-load time in `json-source.ts`.
10. **L3, L4, L7** — utility consolidation + reduced-motion polish (low priority).

---

## Metrics

- Type Coverage: 100% (typecheck clean)
- Lint Issues: not run by reviewer; assumed clean per author verification
- Test Coverage: no tests touched in this phase (existing pattern across this redesign)
- Build: passes; Watch route is `○ Static`, 160 KB first-load JS
- Bundle delta vs prior: +2 KB (per author note)

---

## Unresolved Questions

1. Is the channels-data truncation (2 vs 6-7) intentional MVP scope or oversight? (Drives H2 fix direction.)
2. Will Phase 5 add playlist filtering to WatchLibrary, or should H1's filter wiring land here? (Drives H1 fix direction — full plumb vs. interim downgrade.)
3. Are there real YouTube IDs already queued for any of the 30 mocks, or is the placeholder→real swap a separate deliverable? (Drives M4 urgency — verify image config now if any real ID is coming this sprint.)
4. Is `category` intended as a Watch library filter chip in P5, or purely metadata? (Drives L2 follow-up planning.)

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Adapter strategy is sound and backward-compatible; UI ships three issues that should land before the phase is called done — the playlist link is a dead query param (H1), OurChannels misses the rail/data scope (H2), and VideoCard's relative date formatter creates hydration + freshness bugs in a static page (H3). No critical security or data-loss issues. Build, typecheck, and adapter swap all verified clean.
**Concerns:** H1, H2, H3 above; M4 will fail the build the moment a real YouTube ID lands.
