# Code Review — Glass Blob Hero + Watch Hero Video (Cycle 1)

**Date:** 2026-05-15
**Scope:** `components/home/full-bleed-hero.tsx`, `components/watch/watch-hero.tsx`, `lib/content/schemas.ts`, `content/videos.json`, `public/assets/watch/*`
**Cycle:** 1 of 5

---

## Scope verification (grep-checked)

- `components/home/full-bleed-hero.tsx` reflects blob structure as described.
- `components/watch/watch-hero.tsx` conditional `<video>`/`<Image>` confirmed (lines 45-66) + play-overlay gated on `!featured.videoSrc` (line 69).
- `lib/content/schemas.ts` lines 82-83: `videoSrc`/`videoPoster` added as optional after `playlistId`.
- `content/videos.json` mock-001 (uploadDate 2026-04-22) carries both new fields; mock-005/006/014 untouched (verified read).
- Adapter `getFeaturedVideo()` returns `sortedByDateDesc.find((v) => v.featured) ?? sortedByDateDesc[0]` — mock-001 wins (latest featured by date). The intended target asset will actually surface on `/watch`.
- Assets: `intro.mp4` 12.6 MB, `intro-poster.jpg` 252 KB — both present at expected paths.
- `WatchHero` is the only consumer of `videoSrc`/`videoPoster` (grep-confirmed).
- Sanity source is a stub (`notImplemented`) — schema additions don't require it to change.

---

## Overall Assessment

Clean, targeted iteration. Both deltas are additive (no breaking schema, no caller-contract changes). Render logic is straightforward conditional, no async/race risk. Validation already green (typecheck + lint). Ready to ship with one minor observation and a few low-priority notes.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### 1. Video LCP risk (informational)
**File:** `components/watch/watch-hero.tsx:46-56`

Hero `<video>` autoplays above the fold on `/watch`. The `<Image>` fallback path uses `priority`, but `<video>` has no equivalent. With `preload="metadata"` + `autoplay`, the browser fetches metadata first then the full 13 MB asset when the element becomes visible. On 3G/slow links the poster (252 KB) carries the LCP candidate; once the video plays the LCP element may flip.

**Impact:** Minor — poster acts as initial paint frame, autoplay kicks in soon after. Acceptable given the documented 13 MB budget. No action required unless Lighthouse scores regress.

**Optional polish:** Add `fetchpriority="high"` to the `<video>` (Chromium-only, gracefully ignored elsewhere) if LCP measurement is a concern.

---

## Low Priority

### 2. Duplicated `!featured.videoSrc` predicate
**File:** `components/watch/watch-hero.tsx:45, 69`

Two distinct decisions key off the same boolean: which media element renders + whether to overlay a play button. Pragmatically fine. Could DRY into `const hasInlineVideo = Boolean(featured.videoSrc);` at the top for readability, but it's two checks — not worth a refactor.

### 3. Mask value duplication
**File:** `components/home/full-bleed-hero.tsx:84-88`

Inline style sets both `WebkitMaskImage` and `maskImage` to the same radial gradient string. Tailwind v3 has limited mask utility coverage; inline is the right pragmatic call. Could extract to a const if reused, but it's only used once. Leave as-is.

### 4. `videoPoster` is optional but recommended
**File:** `lib/content/schemas.ts:83`

When `videoSrc` is set without `videoPoster`, the `<video>` shows a black frame until first paint. Not a bug (optional by design), but a Zod `.refine()` requiring poster *when videoSrc is set* would catch authoring oversights at build time. Out of scope for this cycle — note for cycle 5 if YouTube API integration revisits the schema.

---

## Edge Cases Verified

### Glass blob mask + backdrop-filter compositing
The `mask-image` clips the rendered output of the div, including its `backdrop-filter`. Browser behavior: the backdrop-filter samples the underlying pixels, then the mask attenuates the result. The fade-to-transparent edge truly fades both the white tint AND the blur — exactly the "soft glow" intent. Verified semantically; pre-Safari-15.4 / pre-Firefox-103 falls back to a hard rectangle (mask unsupported), which is the iter-3 baseline. Graceful.

### Z-stack ordering
Outer container: `relative max-w-sm px-8 py-7 lg:max-w-md lg:px-10 lg:py-9` (no z-index, no transform, default stacking context).
Children:
1. Blob: `absolute inset-[-1.5rem]` (no z-index, `auto`)
2. Text wrapper: `relative` (no z-index, `auto`)

Both children resolve to `z-index: auto` and share the same stacking context. Painting order = DOM order: blob paints first, text wrapper paints on top. Confirmed correct. The `relative` on the text wrapper isn't strictly required for layering (siblings paint in order), but it does establish a fresh containing block which is harmless and explicit.

### `inset-[-1.5rem]` overflow
Outer overlay: `pointer-events-none absolute inset-0 hidden items-start md:flex` — fills the section.
Inner padded container: `mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16`.
Text container: `max-w-sm` (~384px) or `lg:max-w-md` (~448px) inside the padded outer.

Blob extends `-1.5rem` = -24px on all four sides:
- **Top:** `pt-12` (48px) − 24px = 24px from section top. Inside.
- **Left:** outer `px-8` (32px) − 24px = 8px from section left. Inside.
- **Right:** Constrained by `max-w-hero` and outer right padding; blob stays within section width even at 2xl.
- **Bottom:** Blob bottom = text bottom + 24px. Section is `relative isolate` with no `overflow-hidden`, but bottom edge sits well above section bottom (banner is 16:9 within max-w-[1600px], text takes ~25% of banner height). No clip, no bleed into adjacent sections (CloudDivider). Verified.

Section has no `overflow-hidden`, so a hypothetical overflow would bleed visually — current geometry stays inside. No regression risk for Home or Shop.

### Schema back-compat
Both new fields are `.optional()`. All 30 existing video entries (including the 3 untouched featured entries) re-parse cleanly. Confirmed against `VideosFileSchema.parse(videosJson)` at module load in `json-source.ts:30` — typecheck passes, which means the loaded JSON satisfies the schema.

### Adapter selection
`getFeaturedVideo()` sorts videos by `uploadDate` desc and returns first with `featured: true`. mock-001 (2026-04-22) is the latest featured entry — so it wins. The asset will surface. Verified that mock-005 (2026-03-30), mock-006, mock-014 are older and will not be selected, so their lack of `videoSrc` doesn't matter for the hero. If a future entry with `featured: true` and a later `uploadDate` is added without `videoSrc`, the WatchHero gracefully falls back to the `<Image>` thumbnail — no break.

### iOS autoplay
`muted` + `playsInline` both present (lines 50, 52). Low Power Mode caveat is documented + accepted per spec.

### Video element ARIA
`aria-label` on `<video>` duplicates the outer `<Link>`'s aria-label. SR experience: link is the actionable element, video is a child decorative-but-labeled media. Acceptable. SR users get the "Watch X on YouTube" affordance from the link; sighted users get the moving image as visual cue (replacing the old static play-button overlay). Trade-off is documented in priorities and acceptable for an above-the-fold hero where motion is the affordance.

---

## Positive Observations

- Comments at the blob (lines 70-73, 77-79) explain WHY the radial mask exists — future maintainers won't accidentally remove it.
- Schema comment (lines 79-81) explains both shape and rendering implication.
- `play-button overlay` comment on watch-hero line 67-68 makes the conditional render's intent obvious.
- Mock data only touches the single entry the adapter selects — minimal blast radius.
- Asset budget (13 MB) sits comfortably under the 15 MB cap.
- Faststart-enabled MP4 + audio-stripped — correct encoding choices for autoplay-loop hero usage.
- Schema additions are tightly scoped (two fields, both optional) — no over-engineering, satisfies YAGNI.

---

## Recommended Actions

1. **Ship as-is.** All critical/high concerns resolve cleanly.
2. (Optional) Consider `fetchpriority="high"` on the `<video>` only if LCP measurement shows regression.
3. (Future cycle) Add Zod `.refine()` for `videoPoster` required-when-videoSrc — defer to cycle 5 schema revisit.

---

## Metrics

- Type coverage: clean (`pnpm typecheck` green per task context)
- Lint: clean (`pnpm lint` green per task context)
- Linting issues: 0
- Files changed: 4 code + 1 JSON + 2 assets
- New external dependencies: 0
- Breaking changes: 0

---

## Unresolved Questions

1. Is there a Lighthouse / WebPageTest baseline for `/watch` before this change? If LCP regresses by >0.5s, the `fetchpriority` polish or a smaller compressed variant should be considered. (Not blocking — flag for visual QA phase.)
2. When cycle 5 introduces real YouTube IDs, will the `videoSrc`/`videoPoster` fields remain (local-asset override path) or get retired? Affects whether schema deserves a `.refine()` constraint now or stays loose.

---

**Status:** DONE
**Summary:** Cycle-1 changes (glass blob refactor + watch hero local video) are correct, additive, and back-compatible. All five priority concerns (mask compositing, z-stack, inset overflow, video a11y, preload+autoplay) verified safe against actual code. No blockers.
**Concerns/Blockers:** None blocking. One medium (video LCP risk — informational) and three low-priority polish items documented; ship as-is.
