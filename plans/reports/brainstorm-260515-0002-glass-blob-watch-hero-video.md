# Brainstorm — Glass Blob Hero + Watch Hero Video

**Date:** 2026-05-15 00:02 (Asia/Saigon)
**Scope:** Cycle 1 of a 5-cycle decomposition. Polish pass: soften Hero glass card (Home + Shop) into a mask-faded blob; replace Watch hero from YouTube-link thumbnail to a local autoplay-muted-loop `<video>`.
**Status:** Design agreed — awaiting plan decision.

**Out of cycle (later cycles):** Responsive audit (cycle 2), SEO audit (cycle 3), audit-driven fixes (cycle 4), YouTube Data API integration (cycle 5).

---

## 1. Problem Statement

User feedback after iter-3:

1. **Hero glass card (Home + Shop)** — `bg-white/55 backdrop-blur-xl rounded-2xl border` reads as a UI rectangle on the banner. User wants it to feel like a soft glow, not a card. Fade transparency outward; drop the hard edges.

2. **Watch page hero** — currently a YouTube-thumbnail+Link, not a real video. User provided `assets/watch/intro.mp4` (90MB!) and wants an autoplay-muted-loop cinematic video in place of the thumbnail. Must compress aggressively + handle mobile autoplay + provide poster fallback.

---

## 2. Current State

| Area | File | Current |
|------|------|---------|
| Hero glass card | `components/home/full-bleed-hero.tsx:97` | `max-w-sm rounded-2xl border border-white/40 bg-white/55 px-6 py-5 shadow-cozy backdrop-blur-xl lg:max-w-md lg:px-7 lg:py-6` |
| WatchHero featured visual | `components/watch/watch-hero.tsx:37-76` | `<Link>` wrapping `<Image>` (YouTube thumbnail) + play-button overlay; click → external YouTube |
| Featured video data | `lib/content/sources/json-source.ts:65` | Returns a `Video` matching `lib/content/schemas.ts` |
| Video schema | `lib/content/schemas.ts:77+` | Has `youtubeId`, `thumbnail`, `duration`, `category`, no `videoSrc` field |
| Source asset | `assets/watch/intro.mp4` | 90MB, NOT mirrored to `public/assets/watch/` (dir doesn't exist) |

---

## 3. Decisions Locked

| Question | Choice |
|----------|--------|
| Glass intensity | **Soft blob** — drop rectangle, use radial mask-image to fade edges |
| Watch video behavior | **Autoplay muted loop in place**, click still navigates to YouTube |
| Asset prep | **Compress aggressively** — H.264 ~1080p ~3-6 Mbps, drop audio, strip metadata, target 5-12 MB |
| Data wiring | **Add optional `videoSrc` + `videoPoster` to Video schema**; WatchHero branches on presence |

Cycles 2–5 deferred.

---

## 4. Final Design

### 4.1 Hero Glass Blob (FullBleedHero)

Restructure the desktop card from a single rounded rectangle into two layers: a soft glass blob (background) + the text content (foreground).

**File:** `components/home/full-bleed-hero.tsx`

**Current desktop overlay block (lines ~95-101):**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
    <div className="max-w-sm rounded-2xl border border-white/40 bg-white/55 px-6 py-5 shadow-cozy backdrop-blur-xl lg:max-w-md lg:px-7 lg:py-6">
      <CardBody />
    </div>
  </div>
</div>
```

**New:**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
    <div className="relative max-w-sm px-8 py-7 lg:max-w-md lg:px-10 lg:py-9">
      {/* Glass blob — soft white tint + backdrop-blur, edges fade via radial mask.
          inset-[-1rem] extends the blob outside the text container so the fade
          has room. No border, no shadow, no rounded rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-1.5rem] bg-white/55 backdrop-blur-xl"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)",
        }}
      />
      {/* Text content sits above the blob at full opacity. */}
      <div className="relative">
        <CardBody />
      </div>
    </div>
  </div>
</div>
```

**Key changes:**
- Outer container: NO bg/border/shadow/rounded. Just provides padding + width constraint.
- Glass blob: absolute-positioned, slightly larger (`inset-[-1.5rem]`) than the text container, radial mask fades transparent at 95% radius.
- Backdrop-blur applies only inside the masked region (where mask is opaque) — edges blend smoothly into the banner imagery.
- Text content wrapped in a `relative` div so it stacks above the blob; text remains fully opaque.

**Mobile path (lines 87-90) unchanged** — the mobile card sits BELOW the banner (in-flow), not OVER it, so the "boxy card on imagery" problem doesn't apply.

### 4.2 Asset prep — `intro.mp4`

Compress + generate poster + mirror to `public/`.

**Commands (run sequentially):**

```bash
# Compress to ~5-12 MB target. -an drops audio (video is muted anyway).
# -movflags +faststart enables progressive download.
mkdir -p public/assets/watch
ffmpeg -i assets/watch/intro.mp4 \
  -vf "scale='min(1920,iw)':-2:flags=lanczos" \
  -c:v libx264 -profile:v high -preset slow -crf 24 \
  -an -movflags +faststart \
  public/assets/watch/intro.mp4

# Extract a poster frame at 0.5s
ffmpeg -ss 0.5 -i public/assets/watch/intro.mp4 \
  -frames:v 1 -q:v 3 \
  public/assets/watch/intro-poster.jpg
```

**Targets:**
- Compressed size: 5–12 MB.
- Poster: ~80-200 KB.
- Resolution: clamped at 1920px wide.
- CRF 24 is good quality; if too lossy bump to 22 (larger file).

Verify final size before merge; if >15 MB, increase CRF to 26 or scale to 1280.

### 4.3 Content schema update

**File:** `lib/content/schemas.ts`

Add optional fields to the Video schema:

```diff
  // Existing fields...
+ videoSrc: z.string().optional(),       // Local video URL (e.g., /assets/watch/intro.mp4)
+ videoPoster: z.string().optional(),    // Poster image URL
```

**File:** wherever the JSON content lives (likely `content/videos.json` or similar — verify during implementation). Update the featured video entry to include:

```json
{
  ...,
  "videoSrc": "/assets/watch/intro.mp4",
  "videoPoster": "/assets/watch/intro-poster.jpg",
  "featured": true
}
```

If no current featured video exists, add one. If multiple, pick the existing featured entry.

### 4.4 WatchHero refactor

**File:** `components/watch/watch-hero.tsx`

Branch the visual rendering: if `featured.videoSrc` is present, render a `<video>` element; else fall back to the current YouTube thumbnail.

**Pseudo:**

```jsx
<Link href={videoHref} target="_blank" ... className="group relative block overflow-hidden rounded-[2rem] ...">
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
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        aria-label={`Watch ${featured.title} on YouTube`}
      />
    ) : (
      <Image src={thumbnail} ... />
    )}
    {/* Play button overlay — show only when NO local video (i.e., still YouTube-thumbnail mode) */}
    {!featured.videoSrc && (
      <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-200 group-hover:bg-ink/30">
        <div className="flex h-20 w-20 ... rounded-full bg-brand-coral text-white shadow-cozy-lg ...">
          <svg ...><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
    )}
    {/* Duration / category / channel badges — keep as-is */}
    ...
  </div>
</Link>
```

**Key shifts:**
- `<video>` replaces `<Image>` when `videoSrc` exists.
- `autoPlay muted loop playsInline preload="metadata"` — required combo for mobile autoplay.
- `preload="metadata"` (not `auto`) → don't fetch the full video until user scrolls into view or interacts. Saves bandwidth on initial page load.
- Click still navigates via outer Link to YouTube channel.
- Play button overlay only renders in the legacy YouTube-thumbnail path.
- Duration/category/channel badges retained (they're informational, not interactive).

### 4.5 Validation phase

Standard: typecheck + lint + visual QA. Plus video-specific checks: autoplay fires, mobile (Chrome Android + iOS Safari simulator) renders + autoplays, no console errors, video file loads under 12 MB.

---

## 5. Implementation Notes

### Files touched (exhaustive)

1. `components/home/full-bleed-hero.tsx` — glass blob refactor.
2. `lib/content/schemas.ts` — add `videoSrc`, `videoPoster` to Video schema.
3. Content JSON file (TBD during impl, likely `content/videos.json` or `lib/content/data/videos.json`) — add `videoSrc`/`videoPoster` to featured video.
4. `components/watch/watch-hero.tsx` — video branch.
5. `public/assets/watch/intro.mp4` — NEW compressed file.
6. `public/assets/watch/intro-poster.jpg` — NEW extracted frame.

### Out of scope

- Shop hero glass — gets the change automatically (shared `FullBleedHero`).
- Mobile in-flow card path — unchanged.
- Responsive/SEO audit — cycle 2/3.
- YouTube API — cycle 5.
- Other Watch sections (VideoRail, ExploreVideos, OurChannels, SubscribeCard).

---

## 6. Risks / Concerns

1. **`mask-image` browser support** — well-supported in Chrome/Safari/Firefox/Edge (modern). Safari requires `-webkit-mask-image` prefix (included in pseudo). Legacy IE11 not supported (not a target).
2. **Backdrop-blur + mask compositing** — backdrop-filter applies only where mask is opaque. Works correctly on Chrome 88+, Safari 14+, Firefox 103+. Older versions may render the blur as a hard rectangle and ignore the mask. Acceptable graceful degradation: hard rectangle is the current behavior.
3. **Glass blob may render too soft / illegible** — if kicker (top edge) or description bottom-line fades too much, increase mask inner radius from `35%` → `45%` so the opaque region covers more of the text bounds.
4. **iOS autoplay policy** — `autoPlay muted playsInline` is the required combo. iOS Low Power Mode may still block autoplay. Mitigation: `<video>` will simply show the poster until user interacts. Acceptable.
5. **90MB → 12MB compression artifacts** — CRF 24 should preserve animation quality acceptably. If artifacts visible, drop to CRF 22 or scale to 1280.
6. **Featured-video data file location** — need to find/verify during implementation (`grep` for the featured: true entry in content JSON). Halt and ask if structure unclear.
7. **`<video>` aspect-ratio mismatch** — if intro.mp4 isn't 16:9, the `object-cover` will crop. Acceptable; user provided this asset for hero use.
8. **Layout shift on video load** — `aspect-video` parent + `absolute inset-0` video prevents CLS.
9. **Backdrop-blur perf cost** — extra backdrop-blur layer per page. Acceptable since it's only ~max-w-md and only above the fold.

---

## 7. Success Criteria

- Home Hero + Shop Hero: glass card reads as a soft glow that fades into the banner, NOT a rectangle.
- Text inside glass blob remains fully legible.
- Watch hero shows the local intro video playing silently in a loop.
- Video file ships ≤12 MB.
- Poster image displays before video loads.
- Clicking video still navigates to YouTube channel.
- Mobile: video autoplays with `muted playsInline`; in-flow card path unchanged.
- `pnpm typecheck` + `pnpm lint` clean.

---

## 8. Open Questions

_None — all decisions locked._

---

## 9. Next Steps

- Decision: `/ck:plan` to convert into phased plan, or direct single-pass implementation.
- After cycle 1 ships: cycle 2 = responsive audit (audit-only).
