---
phase: 2
title: Watch hero video (asset compress + schema + WatchHero)
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 2: Watch hero video (asset compress + schema + WatchHero)

## Overview

Replace the Watch page hero — currently a static YouTube thumbnail Link — with a local autoplay-muted-loop `<video>` element using `assets/watch/intro.mp4`. The source is 90 MB and must be compressed before shipping. Wire a `videoSrc`/`videoPoster` into the Video schema + JSON content, then conditionally render `<video>` in `WatchHero`.

## Requirements

**Functional**
- `intro.mp4` compressed to ≤12 MB and mirrored to `public/assets/watch/intro.mp4`.
- `intro-poster.jpg` extracted (first frame ~0.5s) and shipped to `public/assets/watch/intro-poster.jpg`.
- `Video` schema gains optional `videoSrc` and `videoPoster` fields.
- Featured video JSON entry carries the new fields.
- `WatchHero` renders `<video autoPlay muted loop playsInline preload="metadata" poster={...}>` when `featured.videoSrc` exists; falls back to the existing YouTube thumbnail otherwise.
- Outer Link still navigates to YouTube on click.
- Play-button overlay only renders in the fallback path (no overlay when video is present, since it's already playing).

**Non-functional**
- Audio stripped from compressed video (`-an`) since `<video muted>` anyway → smaller file.
- `preload="metadata"` (not `auto`) to keep initial page weight low.
- Schema change is additive (optional fields) — backwards-compatible with non-hero videos.
- No fallback markup needed in `<video>` (poster covers load period).

## Architecture

### Asset compression

```bash
# Ensure target dir exists
mkdir -p public/assets/watch

# Compress: clamp to 1920px wide, H.264 high profile, CRF 24, slow preset,
# drop audio, faststart for progressive download.
ffmpeg -i assets/watch/intro.mp4 \
  -vf "scale='min(1920,iw)':-2:flags=lanczos" \
  -c:v libx264 -profile:v high -preset slow -crf 24 \
  -an -movflags +faststart \
  public/assets/watch/intro.mp4

# Extract poster frame at 0.5s
ffmpeg -ss 0.5 -i public/assets/watch/intro.mp4 \
  -frames:v 1 -q:v 3 \
  public/assets/watch/intro-poster.jpg

# Verify size
ls -lh public/assets/watch/intro.mp4
```

If final mp4 >15 MB: bump CRF to 26 (more compression) or scale to 1280 instead of 1920. If artifacts visible at CRF 24: drop to CRF 22 (larger file).

### Schema update

**File:** `lib/content/schemas.ts`

Add to the Video schema (preserve existing field order):

```diff
  // ... existing fields ...
+ videoSrc: z.string().optional(),
+ videoPoster: z.string().optional(),
```

### Content JSON

Featured video entry needs the new fields. Implementation must `grep` for `"featured": true` in `content/` or wherever `lib/content/sources/json-source.ts` reads from, locate the featured entry, add:

```json
"videoSrc": "/assets/watch/intro.mp4",
"videoPoster": "/assets/watch/intro-poster.jpg"
```

**Halt + ask if** no featured video entry exists or content data location is unclear after grep.

### WatchHero refactor

**File:** `components/watch/watch-hero.tsx`

Inside the existing `<Link>` (around lines 37-76), replace the `<div className="relative aspect-video w-full">` block with a conditional render:

```jsx
<div className="relative aspect-video w-full">
  {featured.videoSrc ? (
    <video
      src={featured.videoSrc}
      poster={featured.videoPoster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`Watch ${featured.title} on YouTube`}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  ) : (
    <Image
      src={thumbnail}
      alt=""
      fill
      priority
      sizes="(min-width: 1024px) 1400px, 100vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  )}

  {/* Play-button overlay — only in the YouTube-thumbnail fallback path */}
  {!featured.videoSrc && (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-200 group-hover:bg-ink/30">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-coral text-white shadow-cozy-lg transition-transform duration-200 group-hover:scale-110 md:h-28 md:w-28">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  )}

  {/* Duration / category / channel badges — keep as-is */}
  {featured.duration && (...)}
  {featured.category && (...)}
  {channel && (...)}
</div>
```

**Key shifts:**
- `<video>` is absolute-positioned to fill the `aspect-video` parent (matches how the Image worked).
- `preload="metadata"` keeps initial weight low.
- `playsInline` is essential for iOS autoplay.
- `muted` is essential for all browser autoplay policies.
- `loop` for continuous ambient playback.
- Play overlay hidden when video is playing (would be redundant + cover the imagery).
- Aria label moves to `<video>` to preserve accessibility (Link already has `aria-label`, but adding it here makes the inner element self-descriptive).

## Related Code Files

- Modify: `lib/content/schemas.ts` (add `videoSrc`, `videoPoster` to Video schema)
- Modify: Content JSON file with the featured-video entry (TBD via grep)
- Modify: `components/watch/watch-hero.tsx` (conditional render)
- Create: `public/assets/watch/intro.mp4` (compressed)
- Create: `public/assets/watch/intro-poster.jpg`

## Implementation Steps

1. `mkdir -p public/assets/watch`
2. Run ffmpeg compression command. Halt if ffmpeg unavailable; advise install.
3. Run ffmpeg poster extraction.
4. Verify compressed file size with `ls -lh`. If >15 MB, re-run with CRF 26 or scale to 1280. If <2 MB and quality looks poor, re-run with CRF 22.
5. Locate content data: `grep -rn '"featured": true' content/ lib/content/ data/ 2>&1` (try common paths). If unclear, read `lib/content/sources/json-source.ts` to find the data import.
6. Add `videoSrc: "/assets/watch/intro.mp4"` and `videoPoster: "/assets/watch/intro-poster.jpg"` to the featured-video JSON entry.
7. Update `lib/content/schemas.ts` Video schema with the two new optional fields.
8. Refactor `components/watch/watch-hero.tsx` per the pseudo above.
9. Run `pnpm typecheck`. Halt on errors.
10. Run `pnpm lint`. Halt on errors.
11. Boot dev server, navigate to `/watch`:
    - Video autoplays, muted, loops.
    - No console errors.
    - Click navigates to YouTube channel.
    - Poster shows briefly before video plays.
    - Duration/category/channel badges still render.

## Success Criteria

- [ ] `public/assets/watch/intro.mp4` exists, size ≤15 MB
- [ ] `public/assets/watch/intro-poster.jpg` exists
- [ ] Video schema includes `videoSrc?: string` and `videoPoster?: string`
- [ ] Featured video JSON entry has `videoSrc` and `videoPoster`
- [ ] `WatchHero` conditionally renders `<video>` when `videoSrc` exists
- [ ] Play-button overlay hidden in video path
- [ ] Outer Link → YouTube navigation preserved
- [ ] Autoplay + mute + loop + playsInline all working in browser
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **ffmpeg not available** — halt + advise user to install (`winget install ffmpeg` or `choco install ffmpeg`). Without ffmpeg, this phase can't proceed.
- **Compression to 12 MB degrades quality** — visual judgment after first encode; mitigate via CRF 22 or higher resolution.
- **Content JSON location unclear** — grep then halt + ask if multiple plausible files or no `featured: true` entry exists.
- **Mobile autoplay blocked** — iOS Low Power Mode or aggressive battery savers may block autoplay. Acceptable: poster shows until user interacts. No fallback control needed.
- **`<video>` causes LCP regression** — `preload="metadata"` keeps initial load tiny; video bytes load lazily. Should not impact LCP since poster JPG covers the visual.
- **Schema change breaks other Video consumers** — fields are optional, additive, backwards-compatible. Should not.
- **Sanity-source skeleton (lib/content/sources/sanity-source.ts)** — adapter has a sanity-source stub. If it touches Video schema, the optional fields won't break it. Verify no required-field constraints during impl.
