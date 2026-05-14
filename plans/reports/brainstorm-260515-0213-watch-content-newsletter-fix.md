# Brainstorm — Watch Content + Newsletter API + Channels + Paw Upload

**Date:** 2026-05-15 02:13 (Asia/Saigon)
**Scope:** Mixed cycle — multiple Watch page content additions, Newsletter API scaffold (currently 404s), Watch hero duration removal, and 4 new channel entries. Plus user-side R2 upload reminder for `paw-tile.svg`.
**Status:** Design agreed — awaiting plan decision.

---

## 1. Problem Statement

After QA of recent shipped cycles, user reports:

1. **Home menu cards missing paw pattern** — `paw-tile.svg` 404s on R2 (verified via curl). User mirrored pre-existing assets; this asset was created in iter-2 cycle and never uploaded. → **User uploads to R2**, no code change.
2. **Newsletter form ("Join The Pack") not working** — `/api/newsletter` route doesn't exist. Form POSTs → 404 → error state. → Scaffold stub-mode route.
3. **Watch Hero shows duration badge** — looks YouTube-card-y. Remove for cinematic feel.
4. **Community Choice rail "empty"** — actually populated, but all `youtubeId` are TODO placeholders → falls back to banner.png thumbnail → looks placeholder-y. Replacing 6 dog-video IDs with real YouTube IDs surfaces real thumbnails.
5. **Cats / product-reviews categories empty** — need graceful empty-state handling.
6. **Our Channels has only 2 entries** — add 4 with hardcoded placeholder counts. Real counts deferred to cycle 5 (YouTube API).

---

## 2. Decisions Locked

| Question | Choice |
|----------|--------|
| Paw tile fix | **User uploads to R2 at `assets/patterns/paw-tile.svg`**. No code change. |
| Newsletter API | **Stub-mode route only** (logs + returns 200; ConvertKit deferred). |
| Channel data | **Hardcode placeholders** (subscriberCount, videoCount, etc.) — cycle 5 replaces with real fetched data. |
| Dog video IDs | **mock-001..006** (latest by uploadDate) get the 6 real YouTube IDs. |

---

## 3. Final Design

### 3.1 Paw tile upload (USER ACTION)

User uploads `D:\works\emvn\scoutpaw-v2\public\assets\patterns\paw-tile.svg` to R2 bucket key `assets/patterns/paw-tile.svg`. Verifies via `curl -I https://images.scoutpaw.tv/assets/patterns/paw-tile.svg` returning 200.

### 3.2 Newsletter API route

**NEW file:** `app/api/newsletter/route.ts`

```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { email?: string; tag?: string; hp?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, tag, hp } = body;

  // Honeypot — silently accept bot submissions so they don't see an error.
  if (hp && hp.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const mode = process.env.NEWSLETTER_MODE ?? "stub";

  if (mode === "stub") {
    console.log(`[newsletter] stub: ${email} (tag: ${tag ?? "none"})`);
    return NextResponse.json({ ok: true });
  }

  // Live mode (ConvertKit) — placeholder, fail loudly until implemented.
  return NextResponse.json(
    { error: "Live newsletter mode is not configured yet." },
    { status: 501 },
  );
}
```

Result: form POST gets 200 → success state renders ("You're on the list. Welcome to the pack. 🐾"). Real ConvertKit integration deferred to a later cycle when the user flips `NEWSLETTER_MODE=live` and provides API keys.

### 3.3 Watch hero duration removal

`components/watch/watch-hero.tsx` — delete the `{featured.duration && (...)}` block (around lines 60-64 post-cycle-1). The duration badge is purely cosmetic. Category + channel badges retained.

### 3.4 Dog video YouTube IDs

`content/videos.json` — replace the youtubeId for mock-001 through mock-006 (sorted by uploadDate desc):

| Mock | Real YouTube ID | Source URL |
|------|-----------------|------------|
| mock-001 | `4Fgl_dW3vgA` | https://youtu.be/4Fgl_dW3vgA |
| mock-002 | `X19MapswOQs` | https://youtu.be/X19MapswOQs |
| mock-003 | `PRCac_UMohw` | https://youtu.be/PRCac_UMohw |
| mock-004 | `3b3T2Z2CZLA` | https://youtu.be/3b3T2Z2CZLA |
| mock-005 | `HPlFCtF_Sxs` | https://youtu.be/HPlFCtF_Sxs |
| mock-006 | `D3vSMHj2mrg` | https://youtube.com/live/D3vSMHj2mrg (live) |

Side effect: WatchHero's video element will continue to play `intro.mp4` (videoSrc takes precedence over youtubeId in cycle-1's branch). The featured-video Link href will now navigate to a real YouTube URL.

### 3.5 New channels

`content/channels.json` — add 4 entries. Pick character mappings + placeholder counts.

| Slug | Name | Channel ID | character | Banner | Avatar |
|------|------|------------|-----------|--------|--------|
| puppy-lullaby-tv | Puppy Lullaby TV | UCy-QL5kMOtAPoDaq2VFoaRQ | bella | `#A8C7E8` | `#D7E6F4` |
| happy-paws-cartoon | Happy Paws Cartoon | UCaiJ0puSQ9KdqZ7965j1W6w | oscar | `#F4B97A` | `#FFD5A6` |
| magic-paw | Magic Paw - Cartoon For Dogs | UC6Ak0T2v3cuoqXJU9lJ0gkQ | rocky | `#C9A6E8` | `#E1CCF4` |
| doggo-dreams-tv | Doggo Dreams TV | UCFGix2jR9bfzhOYIBxI3CjQ | max | `#7DC4E2` | `#B6E3F4` |

**Placeholder counts (all 4):** `subscriberCount: 50000`, `videoCount: 30`. `latestVideoId` omitted (optional field). URLs from user input.

**Verification step:** check `characters.json` contains slugs `bella`, `oscar`, `rocky`, `max`. If not, swap to existing slugs. The 2 current channels use `buddy` and `max` — so `buddy` definitely exists; need to verify the others.

### 3.6 Empty-category UI

Inspect `components/watch/explore-videos.tsx` during impl. Expected behavior:
- If user clicks a category chip with 0 videos, the grid shows nothing.
- Add a friendly placeholder: "Fresh episodes coming soon 🐾".

If the component already handles this gracefully (e.g., skips empty categories or shows nothing without breaking layout), leave as-is.

---

## 4. Files Touched

**NEW:**
- `app/api/newsletter/route.ts`

**Modify:**
- `content/videos.json` (6 youtubeId replacements)
- `content/channels.json` (4 entries appended)
- `components/watch/watch-hero.tsx` (remove duration badge)
- `components/watch/explore-videos.tsx` (potentially — empty-state placeholder)

**User action (out of code):**
- Upload `public/assets/patterns/paw-tile.svg` to R2 at `assets/patterns/paw-tile.svg`

---

## 5. Out of Scope

- Real ConvertKit integration (deferred — flip `NEWSLETTER_MODE=live` later).
- YouTube Data API integration (cycle 5).
- Real subscriber/video counts (cycle 5).
- More than 6 dog videos.
- Hero pattern fix beyond user-upload (no code change).

---

## 6. Risks / Concerns

1. **User forgets to upload paw-tile.svg** — pattern stays missing. Add a sanity-check step in validation phase.
2. **Schema may have constraints that reject empty `latestVideoId`** — verified: it's `.optional()`, safe to omit.
3. **Channel `characterSlug` references char that doesn't exist** — grep characters.json during impl; swap if needed.
4. **Newsletter route file naming on Windows** — `route.ts` (lowercase) is correct for Next App Router. No Win-specific casing issues.
5. **Empty-category broken layout** — if ExploreVideos uses CSS grid that depends on minimum N children, an empty grid may collapse. Mitigation: render a single "Coming soon" placeholder card.
6. **Live YouTube URL (`youtube.com/live/D3vSMHj2mrg`)** — works in `i.ytimg.com/vi/D3vSMHj2mrg/hqdefault.jpg` thumbnail lookup. May need adjustment if YouTube treats live differently (unlikely for hqdefault).
7. **CORS on Newsletter API** — same-origin Next API route, no CORS issue.

---

## 7. Success Criteria

- Form on `/` submits → success message renders (no console error, no 404 in Network panel).
- Home menu cards show paw pattern (after user upload + browser refresh).
- Watch hero shows category + channel badges but NO duration badge.
- Watch Community Choice rail shows real YouTube thumbnails for the top 6 videos.
- Our Channels rail shows 6 channels total.
- Empty categories (cats, product-reviews) don't break layout.
- `pnpm typecheck` + `pnpm lint` clean.

---

## 8. Open Questions

_None — all locked._

---

## 9. Next Steps

- Decision: `/ck:plan` to phase, or direct implement.
- After this cycle: deferred cycles 2-5 still pending (responsive audit, SEO audit, fixes, YouTube API).
