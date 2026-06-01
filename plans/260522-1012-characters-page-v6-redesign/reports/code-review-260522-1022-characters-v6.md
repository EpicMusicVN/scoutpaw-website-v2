# Code Review — Characters Page v6 Redesign

Date: 2026-05-22 · Reviewer: code-reviewer · Plan: `260522-1012-characters-page-v6-redesign`

## Scope

- `components/characters/character-detail-card.tsx` (198 LOC)
- `components/characters/character-carousel.tsx` (148 LOC)
- `components/characters/character-carousel-track.tsx` (163 LOC)
- `components/characters/character-carousel-card.tsx` (90 LOC)
- `components/characters/character-quote.tsx` (45 LOC)
- Deleted: `components/characters/use-carousel-fade.ts`
- Context (not reviewed): arrows, atmosphere, motif, scene-decor, character-themes, schemas

Gates: `pnpm typecheck` + `pnpm lint` reported clean by the caller. `pnpm build` deferred (dev-server `.next` contention — environmental, not a defect). Live render verified HTTP 200.

## Overall Assessment

Solid, well-considered redesign. The work is faithful to the plan: dead wiring (`flipPup`, `onPrev`/`onNext`, `count`, `useCarouselFade`) is fully removed with **zero dangling references** in `app/` or `components/` (grep-verified — remaining hits are only in `docs/` and `plans/`). The stretched-button-overlay accessibility pattern is correct and the history/URL sync is intact. All files are under the 200-line limit. The issues below are layout-robustness and consistency concerns, not correctness bugs — no critical or high-severity defects.

## Critical Issues

None.

## High Priority

None.

## Medium Priority

### M1 — White card `h-[52%]` + `overflow-hidden` can clip the quote on dense content

`character-carousel-card.tsx:59` — the white card is a fixed `h-[52%]` flex column with `overflow-hidden`, holding: breed kicker, `h3` name, optional tagline, `line-clamp-2` bio, and a compact `CharacterQuote`. The quote (`character-quote.tsx:21`) is `p-4` (~2rem vertical) plus an italic line that itself has no clamp. The card region at the *smallest* viewport (`VIEWPORT_H` floor `clamp(520px, 72vh, 860px)` → 520px → 52% ≈ 270px) must fit five stacked text blocks. With a long quote string the `<p>` inside the blockquote wraps to 3–4 lines and the bottom of the quote silently clips against `overflow-hidden`.

Plan phase-03 risk note acknowledges "content density at 3-up" and bounds the bio with `line-clamp-2`, but the **quote text itself is unbounded**. The bio is clamped; the quote is not.

Concrete fix — clamp the compact quote body too:
```tsx
// character-quote.tsx — inner <p>
className={`relative font-display italic leading-relaxed text-warm-text ${
  compact ? "text-sm line-clamp-3" : "text-base md:text-lg"
}`}
```
`line-clamp-3` only applies in `compact` mode, so the detail view + per-character page are unaffected. Verify against the longest `quote` in `content/characters.json` at the 520px floor during Phase 5 browser QA.

### M2 — Track viewport `VIEWPORT_H` clamp can exceed the section min-height (vertical overflow)

`character-carousel-track.tsx:11` sets `VIEWPORT_H = h-[clamp(520px,72vh,860px)]`, and `:129` wraps it in `min-h-[calc(100svh-5rem)]` with `flex flex-col justify-center`. Below the viewport (`:149`) sits the arrow row (`mt-7` + a 48px button → ≈76–92px).

On a short-but-wide viewport (e.g. 740px tall): `100svh - 5rem` ≈ 660px section min-height, but `VIEWPORT_H` floor is `520px` + arrows `~90px` = `610px` — fits. On a 600px-tall viewport: section min-height ≈ 520px, content ≈ 610px — content **exceeds** the section and, because the parent `<section>` is `overflow-hidden` (`character-carousel.tsx:104`), the arrow row or card bottom is clipped with no scroll escape. Phase 4 risk note ("verify no flash of a scrollbar") gestures at this but the carousel side specifically has the arrow row stacked *outside* `VIEWPORT_H`.

Concrete fix — account for the arrows in the clamp floor, or let the section scroll on short viewports. Lowest-risk: drop the `VIEWPORT_H` floor so it can compress, e.g. `h-[clamp(420px,68vh,860px)]`, and confirm the pose+card still read at 420px. Alternatively change the carousel `<section>` from `min-h` + `overflow-hidden` to allow `overflow-y` when content exceeds. Validate at 600–700px viewport heights in Phase 5.

### M3 — Detail view `min-h-[calc(100svh-5rem)]` + `justify-center` + parent `overflow-hidden` risks clipping tall mobile content

`character-detail-card.tsx:78` — `min-h-[calc(100svh-5rem)] flex flex-col justify-center overflow-hidden`. On mobile the grid stacks (artwork `aspect-[3/4]` up to `clamp(320px,42vw,640px)` wide, then breed + large `text-4xl` name + tagline + full unclamped `bio` + full quote below). Phase-01 step 4 + risk note explicitly require: "allow the section to grow taller than the viewport and scroll if content overflows — use `min-h`, not `h`."

The detail card itself correctly uses `min-h` (not `h`) — good. But it is `overflow-hidden`, and its parent in `character-carousel.tsx:104` is also `overflow-hidden`. With `justify-center` and content taller than `100svh`, the flex column centers the overflowing content and the top/bottom get clipped by the *card's own* `overflow-hidden` — the page cannot scroll to reveal it because nothing establishes a scroll container; the document body scroll only sees the `min-h` box, whose content is centered and clipped within it.

In practice the detail content is moderate and `min-h` (not `h`) means the box *grows*, so the body scroll usually saves it — but `justify-center` on a grown box plus `overflow-hidden` is the exact combination the phase-01 risk note warned against. Recommend: on `<md`, switch `justify-center` to `justify-start` (or `md:justify-center` only), and drop `overflow-hidden` to `md:overflow-hidden`, so small screens scroll naturally and never clip. Verify on a 360×640 viewport with the longest `bio` in Phase 5.

### M4 — `SETTLE_FALLBACK_MS` does not scale with reduced motion

`character-carousel-track.tsx:14,39,94` — when `reduce` is true, Embla `duration` is `0` (instant scroll), but the centre-first fallback timer is still a fixed `650ms`. With `reduce`, `scrollTo` settles instantly and the `settle` event fires immediately, so `finish()` runs via the event and clears the timer — functionally fine. Not a bug, but the 650ms constant reads as if it assumes the 30-unit animation. Minor: no action strictly required; if touched, a comment that the fallback is only a safety net (the `settle` event is the primary path) would help. Leaving as-is is acceptable (KISS).

## Low Priority

### L1 — Stale module-doc comments contradict the v6 implementation

- `character-carousel-track.tsx:17-20` — the JSDoc still says *"4 equal-size cards visible (no scaling). Cards keep a soft opacity edge-fade; next/prev moves one card at a time."* v6 shows **3** cards left-anchored, the opacity edge-fade was replaced by the CSS mask, and there is no per-card fade. Update to match.
- `character-carousel-arrows.tsx:5-7` (context file, not in scope) — comment says the arrow is *"Reused by the coverflow carousel and the detail card's pup flipper"* — the pup flipper was removed in Phase 1. Out of review scope but worth a one-line fix while nearby.

### L2 — `docs/codebase-overview.md` still describes the v5 carousel

`docs/codebase-overview.md:31,109` still reference `useCarouselFade` and "opacity edge-fade" / "3 equal-size cards". This is a Phase 5 docs-sync deliverable (explicitly listed in phase-05 step 4), so it is *expected pending work*, not a defect — flagging only so it is not missed before the plan closes. `docs/project-changelog.md` and `docs/development-roadmap.md` likewise still need the v6 entry.

### L3 — `assetUrl(pose)` with `poses[0] ?? image` fallback duplicated across card + detail

`character-carousel-card.tsx:31-32` and `character-detail-card.tsx:51-53` both compute `const pose = poses[0] ?? image;`. The schema (`schemas.ts:18`) guarantees `poses` has `.min(1)`, so `poses[0]` is always defined and the `?? image` fallback is technically dead code. Harmless defensive code; if DRY-tidying, a tiny `lib/content` helper or just `poses[0]` alone would do. Not worth a dedicated change — note only.

### L4 — Detail view nested `AnimatePresence` is now single-purpose

`character-detail-card.tsx:152` keeps an inner `<AnimatePresence mode="wait">` keyed on `slug` with an `exit` variant. Since the pup-flipper was removed, the detail card's `slug` can no longer change while mounted — the orchestrator unmounts/remounts the whole `CharacterDetailCard` per pup. The inner `AnimatePresence` + `exit` therefore never triggers (the node is gone before exit can play). It still works as a plain mount-stagger via `STORY_CONTAINER`, but the `AnimatePresence` wrapper and `exit` prop are now YAGNI dead weight. Could simplify to a bare `motion.div` with `initial`/`animate`. Low priority — harmless, just no longer earning its complexity.

## Verified Correct (Positive Observations)

- **Dead-reference removal**: grep across `app/` + `components/` confirms zero remaining `flipPup`, `onPrev`, `onNext`, `useCarouselFade`, `use-carousel-fade`, or `carousel-fader` references. The deleted file is gone from disk. `count` is no longer destructured. Clean.
- **History / URL sync intact**: `openPup` push → `closePup` `history.back()` guarded by `didPushRef`, deep-link `replaceState` fallback, `popstate` listener re-syncing `openSlug`/`startIndex` — all preserved correctly from v5. The `closedRef` double-close guard prevents a double `history.back()` from a fast double-Escape.
- **Stretched-button-overlay a11y**: correct — visual `<article>` carries semantic `h3`/`p`/`blockquote`, the single transparent `<button>` (`character-carousel-card.tsx:82`) is the only interactive node with a proper `aria-label`, `type="button"`, visible `focus-visible:ring`, and keyboard activation. The `event.detail !== 0` contract (`:117`) correctly distinguishes pointer clicks (suppressible on drag) from keyboard activation (`detail === 0`, never suppressed). Valid HTML — no flow content inside the `<button>`.
- **Carousel ARIA**: `role="region"` + `aria-roledescription="carousel"` on the viewport; `role="group"` + `aria-roledescription="slide"` + positional `aria-label` per slide. Matches the APG carousel pattern.
- **Detail focus management**: `closeRef.current?.focus({ preventScroll: true })` on mount, `Escape` listener with cleanup, return-focus to the active card via `autoFocus`/`returning`. Complete.
- **Reduced motion**: orchestrator flattens `detailScale`/`carouselScale` to `1` and `duration` to `0`; Embla `duration: reduce ? 0 : 30`; detail stagger guards `initial={reduce ? false : "hidden"}`. The global `@media (prefers-reduced-motion: reduce)` block (`globals.css:182`) additionally neutralizes the decorative `cloud-drift`/`twinkle`/`paw-drift` CSS animations. Thorough.
- **Performance**: per-frame JS opacity fade deleted in favour of a static CSS `mask-image` — a real win. Transitions are opacity/transform only (GPU-friendly). Image `priority` correctly limited to the first 3 poses in the carousel + the single detail pose; `sizes` attributes are breakpoint-appropriate.
- **Design tokens**: `ease-gentle`, `shadow-cozy`/`shadow-cozy-md`, `warm-text`, `ink`, `surface`, `paper`, `max-hero` all verified present in `tailwind.config.ts`. Keyframes `cloud-drift`/`twinkle`/`paw-drift` verified in `globals.css`. Motion easing `[0.16,1,0.3,1]` and durations are consistent across orchestrator + detail.
- **`CharacterQuote` `compact` prop**: additive, default-false, default branch byte-identical to v5 — existing consumers (detail view, per-character page `app/characters/[slug]/page.tsx`) unchanged. Backwards compatible.
- **No schema/content changes**: confirmed — `Character` type untouched by this work; the v6 card reuses existing fields.

## Acceptance Criteria Status

| Phase | Criteria | Status |
|-------|----------|--------|
| 1 | Detail fills 100vh, art-dominant, no flipper, deep-link/Escape/Back work | Met (see M3 for mobile-scroll robustness) |
| 2 | 3 cards left-anchored, edge dissolve, `use-carousel-fade` deleted, loop+arrows work | Met (see M2 for short-viewport height) |
| 3 | White card + pose overlap, clamped bio, valid HTML, focus ring, `compact` quote | Met (see M1 for quote clamp) |
| 4 | Layered push-in transition, no layout jump, reduced-motion instant | Met |
| 5 | typecheck/lint pass, docs synced | typecheck/lint pass; docs sync pending (L2 — expected) |

## Recommended Actions

1. **M1** — add `line-clamp-3` to the compact quote body in `character-quote.tsx`; QA against the longest quote at the 520px viewport floor.
2. **M2** — lower the `VIEWPORT_H` clamp floor (or account for the arrow row) so carousel content + arrows never exceed `100svh-5rem` on short viewports.
3. **M3** — on `<md`, use `justify-start` + `md:overflow-hidden` for the detail card so tall mobile content scrolls instead of clipping.
4. **L1** — refresh the stale module-doc comments in `character-carousel-track.tsx` (and the arrows file if touched).
5. **L2** — complete the Phase 5 docs sync (`codebase-overview.md`, `project-changelog.md`, `development-roadmap.md`).
6. **L4** (optional) — simplify the now single-purpose inner `AnimatePresence` in the detail card to a plain `motion.div`.

## Unresolved Questions

1. What is the longest `quote` string in `content/characters.json`? M1's severity depends on it — if all quotes are short, M1 drops to low.
2. Is there a defined minimum supported viewport height? M2/M3 only bite below ~700px tall; if the product targets standard laptop/desktop heights only, both drop to low.
3. Phase 5 browser QA across breakpoints (tablet/mobile) — was it actually performed on the live dev server, or only the desktop HTTP 200 check? M1–M3 are precisely the cases that QA pass should catch.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** The v6 redesign is correct and clean — all dead wiring removed with zero dangling references, a11y/history/reduced-motion all intact, no critical or high-severity defects. Three medium layout-robustness concerns (unbounded compact-quote text under `overflow-hidden`, carousel height vs. short viewports, detail-card mobile-scroll clipping) should be verified/fixed during Phase 5 browser QA before the plan closes.
**Concerns/Blockers:** M1–M3 are short-viewport / dense-content clipping risks that desktop-only QA will not surface; the Phase 5 docs sync is still pending (expected, not a defect).
