# Code Review — Characters Carousel v4 (Straddling-Pose Refinement)

**Date:** 2026-05-21
**Reviewer focus:** straddling-pose layout, layoutId morph, opacity fade hook, `coverflow`→`fader` rename, deleted hook, hooks/sizes/YAGNI.
**Verdict:** Solid, ships-able. No Critical issues. One High (morph-distorting transform), a handful of Medium/Low. CI-green is real but two runtime/visual bugs CI cannot catch.

---

## Scope

- `character-carousel-card.tsx` (95 LOC) — rewritten
- `character-carousel-poses.ts` (33 LOC) — new
- `use-carousel-fade.ts` (89 LOC) — new, replaces `use-carousel-coverflow.ts`
- `character-carousel-track.tsx` (156 LOC) — modified
- All files within the 200-LOC ceiling.

---

## Critical

None.

---

## High

### H1 — Tuning `transform` on the inner div distorts the `layoutId` morph
`character-carousel-card.tsx:66-71`

The `motion.div` carries `layoutId={pup-art-${slug}}`. Inside it, a plain `<div>` applies `transform: translateY(...)%/scale(...)` from `getPoseTuning`. Framer Motion's layout engine measures the **bounding box of the `layoutId` element** at start (carousel) and end (detail card) and animates the delta with its own `transform`. The inner div's transform is *not* part of that measurement — it is baked into the child and rides along unchanged.

Concretely, the morph target in `character-detail-card.tsx:126-144` is an `aspect-square` box with **no** equivalent inner-transform wrapper. So during the morph:
- Carousel side: pose visually shifted/scaled by `tuning`.
- Detail side: pose at neutral.
- The `layoutId` boxes morph cleanly, but the *image inside* jumps from `translateY(x%) scale(y)` to `translateY(0) scale(1)` **instantly** at frame 0 (no tween on the inner div) — a visible pop at the start/end of the morph.

Right now this is **latent**: every entry in `POSE_TUNING` is `{scale:1, offsetY:0}`, so the inner transform is the identity matrix and nothing pops. The bug only activates the moment someone tunes a pup — which the file's own doc-comment explicitly instructs ("adjust once the page is rendered in a browser"). This is a trap primed to fire on the next iteration.

**Impact:** First non-neutral tuning value produces a janky morph. Hard to attribute later because the tuning file looks unrelated to the morph.

**Options:** (a) apply the same tuning transform to the detail-card pose wrapper so both ends match; (b) drop the inner-div transform and bake tuning into the `layoutId` box geometry (`inset`/`top`/`bottom` %) so framer measures it; (c) document loudly that tuning desyncs the morph and is carousel-only by design. (a) or (b) are correct; (c) is a smell.

---

## Medium

### M1 — Straddling math does NOT produce ~50/50 overlap
`character-carousel-card.tsx:45,64`

The plan claims the pose centre (~30% of the button) sits on the panel's top edge (`top-[30%]`) → 50/50. Run the actual numbers against the button height:

- Panel top edge = **30%** of button.
- Pose box = `top-[4%] … bottom-[44%]` → occupies button rows **4% → 56%**. Box height = 52% of button. Box centre = **(4+56)/2 = 30%**. ✓ Box centre lands on the panel edge.

But "box centre" ≠ "pose centre". The `<Image>` is `object-contain` inside that box. The PNGs have **varying transparent padding** (the `character-carousel-poses.ts` doc-comment says so explicitly — that's the whole reason the tuning map exists). `object-contain` centres the *image file* in the box, not the *visible dog*. A pup PNG with headroom padding renders its visible body **below** box centre → less than 50% above the edge. A bottom-padded PNG renders higher → more than 50%.

So the geometry gives a 50/50 split **of the box**, but the visible overlap per pup will drift, possibly substantially, until the tuning map is populated. The plan's "~50/50" claim is true for the box and false for the dogs. Not a code defect — but the stated success criterion ("~50/50 overlap") is not met by the math alone; it depends entirely on hand-tuning that is currently all-neutral. Flag for browser QA before sign-off.

### M2 — Pose top edge can clip against the `overflow:hidden` viewport
`character-carousel-track.tsx:134` + `character-carousel-card.tsx:64`

The pose box starts at `top-[4%]` of the **button**. The button is `h-full` of the `carousel-fader` div, which is `h-full` of the `embla-slide`, which is `h-full` of the flex row = the Embla viewport (`VIEWPORT_H`, `overflow-hidden`). So the pose box top is only **4% of viewport height** from the clip edge.

At the clamp floor (`440px`): 4% = **17.6px** of clearance. Then:
- `drop-shadow-[0_18px_30px_...]` on the image extends ~30–48px upward-ish (shadow is offset +18y so mostly downward — OK upward).
- The accent glow `span` (`character-carousel-card.tsx:53-57`) is centred at `top-[30%]`, `h-[42%]`, `blur-3xl` (48px) → its blurred halo reaches roughly `30% - 21% - blur` ≈ above the viewport top. Glow clipping is cosmetically minor (it's a soft bloom) but it **will** be hard-cut by `overflow-hidden` at small heights.
- More importantly: any future negative `offsetY` tuning (the doc-comment invites "negative moves the pup UP / more overflow above the card") pushes the visible pose past `top-[4%]` and **into the clip**. With only 4% clearance there is almost no headroom for the very tuning the system is designed around.

**Impact:** Tops of poses / glow halos get clipped on short viewports and the instant anyone uses negative `offsetY`. The `overflow-hidden` is required by Embla, so the fix is layout headroom, not removing the clip.

### M3 — `isScroll && !slidesInView` skip leaves off-screen slides at a stale opacity
`use-carousel-fade.ts:43`

On a `scroll` event, slides not in `slidesInView()` are skipped — their opacity DOM value is whatever it was last written. The intent (perf: don't touch invisible nodes) is fine *if* every slide is guaranteed to pass through `slidesInView` while still partly visible so it gets a final low-opacity write before going fully off-screen. With `loop:true` + move-by-1 + 3-in-view that mostly holds.

The gap is **non-scroll paths**:
- `reInit` calls `tweenOpacity` with `eventName` undefined → `isScroll` false → all slides updated. ✓
- `slideFocus` likewise updates all. ✓
- Initial mount call `tweenOpacity(emblaApi)` — no event name → all slides. ✓

So full passes do happen. The residual risk: a slide that is mid-fade when a scroll **ends abruptly** (drag flick that settles fast) could be skipped on the final frames and freeze at e.g. `opacity:0.4` until the next `reInit`/`slideFocus`. There is **no `settle` listener** in this hook (the old coverflow hook had the same shape, so not a regression). Low-probability, but a stale half-faded card is a visible glitch. Consider adding `settle` → `tweenOpacity` (full pass) as a cheap correctness backstop, or drop the `slidesInView` skip entirely — 5 slides, opacity write is trivially cheap, the skip is premature optimization (YAGNI).

### M4 — Title block overlaps the pose's lower body with no guard
`character-carousel-card.tsx:64,84`

Pose box bottom = `bottom-[44%]` → occupies down to **56%** of button. Title block is `absolute inset-x-0 bottom-0 p-5/6` with two text lines — at typical card heights that block occupies roughly the bottom **22–28%**. No collision today (gap between ~56% and ~74%). But the title is `z-10` and the pose wrapper is also `z-10` — equal stacking, so **DOM order decides**: pose renders before title, title wins. If a pup PNG is bottom-heavy or a positive `offsetY` pushes it down, the dog's feet render *under* the title text. Likely intentional layering, but it's fragile and undocumented. Minor — flag for visual QA.

---

## Low

### L1 — FADE_START/FADE_FACTOR keep 3 cards opaque, but margin is thin
`use-carousel-fade.ts:10-11,58-61`

Opacity = `clamp(1 - (|diff| - 0.2) * 3.6, 0, 1)`. With 5 slides, `align:center`, `loop:true`, the snap step ≈ `1/5 = 0.2` in scrollProgress units. Adjacent in-view card `|diff| ≈ 0.2` → `1 - (0.2-0.2)*3.6 = 1.0` exactly. So the two side cards sit **right on the opacity=1 boundary** — any sub-pixel scroll progress drift nudges `|diff|` to `0.201` → opacity `0.996`, imperceptible, fine. But it means the side cards are *exactly* at the fade threshold, not comfortably inside it. Fully opaque "3 in view" holds. Card 3-away: `|diff|≈0.4` → `1-(0.2)*3.6 = 0.28`. Faded but not gone — acceptable peek. Math checks out; just note the side cards have zero opacity headroom by design.

### L2 — Loop-point branch reads correctly but is untested for 5-slide/3-visible
`use-carousel-fade.ts:45-54`

The loop-seam diff correction is the canonical Embla pattern and is copied intact from the prior coverflow hook (which a prior review — `code-review-260521-0723` — explicitly verified as correct). Carrying it forward unchanged is the right call. No action; noted only because the slide count/visible count is the same as when it was last verified, so the verification still holds.

### L3 — Rename is clean in code; docs still say "coverflow"
Grep confirms **zero** dangling `coverflow-scaler` / `useCarouselCoverflow` / `use-carousel-coverflow` references in `components/`. Hook `querySelector(".carousel-fader")` (`use-carousel-fade.ts:27`) and track markup `className="carousel-fader …"` (`character-carousel-track.tsx:114`) agree. ✓ Deleted `use-carousel-coverflow.ts` has no dangling imports. ✓

However `docs/` is stale — `codebase-overview.md:22,30,95`, `development-roadmap.md:7`, `project-changelog.md:10,16,39` all still describe a "coverflow" carousel. Phase 3 ("Polish & Docs Sync", task #13) is still `pending`, so this is expected in-flight, not a defect — but the docs-sync task must actually rewrite these lines, not just append a changelog entry. The v4 design *reverses* coverflow; leaving "focal coverflow" in `codebase-overview.md` will mislead the next reader.

### L4 — `character-carousel-poses.ts` is a YAGNI borderline
All 5 entries are identical neutral `{scale:1, offsetY:0}`. The file, the `PoseTuning` interface, `DEFAULT_TUNING`, and `getPoseTuning` currently do **nothing** — `getPoseTuning(slug)` always returns the identity. This is speculative infrastructure (KISS/YAGNI). It is defensible *only if* the team genuinely intends to tune in the very next browser pass (the plan says so). If tuning is deferred indefinitely, this is dead code plus the H1 morph trap for no benefit. Acceptable as a deliberate staging step; revisit if the next iteration doesn't populate it. The explicit `Record<string, PoseTuning>` with a `?? DEFAULT_TUNING` fallback is good defensive typing under `noUncheckedIndexedAccess`.

### L5 — Reduced-motion: morph correctly disabled, fade hook still runs
`character-carousel-card.tsx:62`, `character-detail-card.tsx:127` — `layoutId` is `undefined` when `reduce`, so no layout morph. ✓ Embla `duration: reduce ? 0 : 30` (`character-carousel-track.tsx:40`) → instant snaps. ✓ But `useCarouselFade` still attaches and writes `opacity` on every scroll under reduced-motion. The opacity *cross-fade* is arguably a motion effect a reduced-motion user opted out of. It's subtle (opacity, not transform) and the global CSS reset (`globals.css:182`) doesn't touch inline-style opacity, so it persists. Very low severity — opacity fades are generally considered reduced-motion-safe — but strictly, a reduced-motion user still gets the edge-fade animation frames. Acceptable; note only.

### L6 — `pose = poses[0] ?? image` — `poses` is schema-guaranteed non-empty
`character-carousel-card.tsx:34`. `schemas.ts:18` declares `poses: z.array(z.string()).min(1)`, so `poses[0]` is always defined and the `?? image` fallback is unreachable. Harmless (also present in `character-detail-card.tsx:52` and `character-detail-hero.tsx:26` — consistent), satisfies `noUncheckedIndexedAccess` without a non-null assertion, which is the right tradeoff. No change needed; noted for completeness.

---

## Positive Observations

- `layoutId` correctly gated on `reduce` on **both** ends of the morph — symmetric, no orphaned shared element.
- `EmblaCarouselApi` derived via `NonNullable<ReturnType<...>[1]>` instead of an `any` — honest typing.
- `fadeNodes` typed as `(HTMLElement | null)[]` with a null guard at `use-carousel-fade.ts:56` — the exact crash-safety fix flagged in the very first carousel review is preserved through the rename.
- All event listeners (`reInit`/`scroll`/`slideFocus`) have matching `.off()` cleanup; the `settle`/`pointerDown`/`scroll` listeners in the track also clean up. No leaks.
- Centre-first click logic untouched and still sound: `SETTLE_FALLBACK_MS` guards against a missed `settle`, `openingRef` blocks double-open, `draggedRef` suppresses drag-release clicks while `event.detail===0` keeps keyboard activation working.
- Files all under 200 LOC; the hook extraction pattern is being maintained.

---

## Recommended Actions (priority order)

1. **H1** — before populating `POSE_TUNING`, decide the morph strategy: mirror the tuning transform onto the detail-card pose wrapper, or bake tuning into the `layoutId` box geometry. Do not ship non-neutral tuning values until this is resolved.
2. **M2** — add vertical headroom above the pose (raise `VIEWPORT_H` floor or pad the panel down) so negative `offsetY` and the glow halo don't clip at small viewports.
3. **M1** — browser QA each pup; the "~50/50 overlap" target is not satisfied by the geometry alone.
4. **M3** — drop the `slidesInView` skip (5 slides, premature optimization) or add a `settle`→`tweenOpacity` backstop.
5. **L3** — Phase 3 docs-sync must rewrite the "coverflow" language in `codebase-overview.md` / `development-roadmap.md`, not just append a changelog line.
6. **M4/L4/L5** — note for visual QA / future revisit; no code change required now.

---

## Unresolved Questions

1. Is the title-text-over-pose-feet layering (M4) intentional? If so, document it; if not, give pose and title distinct `z` values.
2. Will the next iteration actually populate `POSE_TUNING` (per the plan), or is it deferred? If deferred, L4+H1 argue for removing the inner-transform wrapper until needed.
3. Is the opacity edge-fade acceptable under `prefers-reduced-motion` (L5), or should `useCarouselFade` write `opacity:1` to all nodes and bail when `reduce`?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** v4 is well-built and CI-green with no Critical issues; the rename is clean and hooks are leak-free. The one real trap is H1 — the inner-div tuning transform will pop the `layoutId` morph the instant anyone enters a non-neutral tuning value (currently all-neutral, so latent) — plus M2 clip headroom and the M1 "50/50" claim that the geometry does not actually guarantee.
