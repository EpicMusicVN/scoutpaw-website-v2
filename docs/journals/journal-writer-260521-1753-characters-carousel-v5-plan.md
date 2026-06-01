# Characters Carousel v5: Fifth Brainstorm + Plan — The Same Morph Risk, Higher Stakes

**Date:** 2026-05-21 17:53  
**Severity:** High  
**Component:** `/characters` carousel card design, layout, pose positioning  
**Status:** Plan complete; 3-phase task chain hydrated and blocked

## What Happened

Brainstorm + planning session for a **fifth carousel redesign in 12 hours**. User flagged v4's rendered output and requested six changes aimed at visual dominance and removing the "boxed container" feeling:

1. **Show 4 visible cards** (was 3 in v3–v4). Denser row.
2. **Carousel fills `100vh`** — immersive, cinematic full-screen section.
3. **Characters 2× larger, dominant, extending well outside card boundaries.** Currently they straddle the top edge; need substantial overflow left/right and up.
4. **Card de-boxed** — drop shadows, borders, the rectangular container feeling. "Soft pad, no box."
5. **Background blends with page** — no isolated boxed-section visual weight.
6. **Keep smooth fades** — no snapping, no motion jank.

**Clarifying questions + outcomes during brainstorm:**
- **Pose consistency:** Characters pose differently (some cropped tight, others framed wide). Need per-pose tuning to visual-normalize size across the 5 PNGs. Solution: `character-carousel-poses.ts` with scale/offset constants **applied safely to an ancestor of the `layoutId` element** (not a child div Framer's layout engine ignores). This is the **same file created in v4, then deleted as a no-op; this time it must account for morph safety.**
- **Character bounds:** Characters stay in-column (no left/right overflow into neighbors' space, no overlap). Vertical overflow up/down only.
- **Card visual:** "Soft pad with radial gradient mask edges, not a rectangle." Gradient background with feathered boundaries, no hard border.
- **Detail card:** De-boxed as well (consistent visual treatment).

**Artifacts:**
- Brainstorm report: `plans/260521-1753-characters-carousel-v5/reports/brainstorm-260521-1753-characters-carousel-v5.md`
- 3-phase plan: `plans/260521-1753-characters-carousel-v5/` with phases:
  - Phase 1: Pose tuning (morph-safe), character upscaling, card de-boxing (gradient soft-edge, no border)
  - Phase 2: Layout and viewport (4-visible, `100vh` section, fade edge treatment)
  - Phase 3: Polish, ambient integration, visual QA
- Task chain: `pose-and-character-scale` → `layout-and-viewport` → `polish-and-qa` (blocked)

## The Brutal Truth

**This is the fifth full carousel rebuild in 12 hours, and the render loop is still broken.**

The honest pattern:
- **v2 (08:10):** Coverflow focal, gradient cards. User approved ASCII mockup, saw render, changed mind.
- **v3 (08:23 plan, 09:26 impl):** Flat white cards. User approved ASCII, saw render, requested gradients back.
- **v4 (16:40 plan, 17:21 impl):** Flat gradient cards, pose straddling. User saw render 32 minutes ago, now requesting bigger characters, immersive full-screen, de-boxed cards.
- **v5 (now, 17:53):** Bigger characters, 4 visible, full-height section, soft-pad cards, no boxes.

**The one genuinely positive sign:** v5's spec language ("remove the rectangular border feeling," "reduce visual heaviness," "2× larger characters") reads like someone who **actually opened the page and looked at v4**. The feedback is no longer ASCII-mockup-abstract ("flat vs. focal") — it's reactive to the rendered design ("characters need dominance," "cards feel boxy"). That's progress. It means the feedback loop *is* closing; the render *is* informing decisions. The problem is **when** it closes: after the implementation is done and in code review, not before the next plan is approved.

**The brutal cascade:** v4 shipped with zero browser QA. It hit review with a flagged risk ("morph safety unverified"). The recommendation in the implementation journal was explicit: "Do not merge without visual approval." No browser opened. The user then saw the rendered v4 on their own, saw the problems (characters small, cards boxy, section feels confined), and immediately triggered a v5 brainstorm. So v5 exists because v4 was shipped before it was tested.

**The morph risk is now higher.** v4's notes: "The `layoutId` morph — the shared-element transition between carousel and detail card — needs browser QA before merge." That's still true. v5 adds a second risk: the pose-tuning transform, which will modify the carousel-card geometry mid-morph if tuning values are real (not neutral). The plan mandates "ancestor-of-layoutId" placement to keep the morph safe, but that advice **has not been verified in a browser yet**. Shipping v5's pose tuning without actually rendering and testing the morph is a high-probability ship-breaking event.

**The pose file is being built for the second time.** Created in v4, deleted for being a no-op, now recreated. The cycle (build → measure in browser → oh, that's a tuning data file → requires render → can't render without code → delete) is being walked again. The solution this time (apply transform to ancestor, not child) is technically sound, but **it's advice in a journal, not a tested pattern**. Running it twice and deleting it once is the tax for skipping the render step.

**The team has now run five plan-code-review cycles on one component without opening a browser.** That's not iteration. That's optimization theater.

## Technical Details

**Key design constraints for v5:**

1. **Pose tuning, morph-safe:** Create `character-carousel-poses.ts` with per-pup scale/offset. Apply transform via ancestor div of the carousel-card (the `<motion.div>` with `layoutId`), **not** via Framer-layout-ignorant child. Framer's layout measurement then sees the ancestor geometry, which is stable across morph. Pose-tune values estimated at `scale: 0.8–1.1` and `offsetY: -20 to +20px` depending on character framing. **Requires browser to measure and finalize values.**

2. **Character 2× scale:** Pose image upscaled via CSS `scale()` or canvas rendering, depending on how much overflow is tolerable. Risk: if character extends far outside card boundary, may overflow siblings in 4-column layout (need careful bounds testing).

3. **4-visible carousel:** Embla configuration change. All cards same width (slot calculation changes). Fade edge now applies to cards 1 and 4 only (viewport edges). Move-by-1 logic still applies, but now scrolls through 5 characters with 4 visible at a time (1 off-screen at each end before/after visible set).

4. **100vh section:** Carousel container positioned as full-height viewport section. Ambient decor (background glow, scene backdrop) scales to fill height. Risk: mobile viewports with address bar shrink `100vh` semantics — test on Safari iOS and Chrome Android specifically.

5. **Card de-boxing:** Replace rectangular card structure with:
   - Gradient background (per-character theme, same as v4)
   - Radial or feathered-edge mask (CSS `clip-path` with `radial-gradient` or SVG `<mask>` with soft edges)
   - No border, no drop shadow on the card itself (shadow moves to ambient layer, subtle)
   - Text + charm info sit on masked gradient
   - Pose overlaid, no containment by card boundary

6. **Detail card de-boxing:** Same treatment as carousel card (masked gradient, no box).

7. **Fade transitions:** Cards at viewport edges (1 and 4) fade in/out. Opacity ramp: 0 → 1 → 1 → 1 → 0 (cards 1–5). Duration tied to scroll animation (sync with v4's 600ms).

**Files to touch (planned, not yet coded):**
- `components/characters/character-carousel.tsx` — update Embla config for 4-visible, 1-move
- `components/characters/character-carousel-track.tsx` — update card width calculation, 4-visible grid, remove border/shadow card styles
- `components/characters/character-detail-card.tsx` — de-box: masked gradient, no border/shadow
- New/updated: `lib/content/character-carousel-poses.ts` — per-pup scale/offset (created, tested in browser, then applied)
- New: `components/characters/character-soft-card-backdrop.tsx` — radial-gradient mask container (shared by carousel + detail card)
- `app/characters/page.tsx` — carousel section height to `100vh`
- `components/characters/character-carousel-ambient.tsx` — scale ambient decor to full height

**Open technical questions (for implementation):**
- **Pose-tuning values:** Need to measure each character's rendered size in a browser and calculate target scale/offset. Cannot be estimated. This is why v4's pose file was a no-op.
- **Card mask implementation:** SVG `<mask>` with `<feGaussianBlur>` for soft edges vs. CSS `clip-path` with `radial-gradient`. SVG is more reliable cross-browser but adds DOM nodes. Tradeoff?
- **4-visible layout on mobile:** At small viewports, 4 cards may be unreadably cramped. Do we stack to 2 visible on mobile, or accept the squeeze? Need design guidance.
- **100vh on Safari iOS:** The address bar shrinks the viewport. `100vh` in Safari iOS includes the address bar height, causing overflow. Solution: use `100dvh` (dynamic viewport height) instead. Cross-browser support?
- **Morph safety with pose transform:** Plan says apply transform to ancestor of `layoutId` element. Framer's layout engine should then measure ancestor geometry, keeping the morph stable. **This assumption has not been tested in a browser.** Risk: if the transform still causes geometry mismatch, the morph will jump or distort.
- **Performance with 4-visible + larger characters + masked gradients:** Are the per-card SVG masks + scaled PNG overlays expensive to animate on low-end devices? Lighthouse test required.

## What We Tried

N/A — brainstorm + plan session only, no code written. User reviewed v4's rendered output, specified changes. No failed implementations in this phase.

## Root Cause Analysis

**Why is there a v5?**

v4 was implemented and merged into code review **without any browser testing**. The implementation journal explicitly flagged the morph risk as unverified and recommended "do not merge without visual approval." No approval was sought or received. The user then saw the rendered v4, identified visual gaps (small characters, boxy cards, confined feel), and triggered a redesign request. v5 exists because v4 was treated as complete without the one step that would have caught its shortcomings: opening a browser.

**Why is the pose-tuning cycle repeating?**

v4's plan included "create a pose-tuning map" without acknowledging that **tuning values cannot be known without rendering the app and eyeballing them**. The file was built with neutral defaults, shipped to review, and flagged as a no-op. This cycle (plan file → build with unknowns → ship empty → delete) is being walked again because v5's plan again includes pose tuning, and again **the only way to measure those values is to render the page**.

**Why hasn't the morph been tested?**

The workflow (plan → code → review → done) includes a "verify morph in browser" checklist item, but no stage that **blocks** on that verification. Code review flags the risk and defers it. But deferral is treated as "figure it out during next refactor," not "render now before merging." The pressure to move to the next brainstorm cycle overrides the pressure to verify the current build.

## Lessons Learned

1. **Rendered iteration must come before the next brainstorm cycle.** If v4 had been opened in a browser before the user was asked "do you want another redesign?", v5 would likely be a targeted CSS refinement (bigger characters, softer card edges), not a full rebuild. The user needs to see and click the current design before deciding if another round is necessary.

2. **Pose tuning is a QA activity, not a code-writing activity.** Building `character-carousel-poses.ts` with estimated defaults is planning theater. The file only makes sense once the page is rendered and you can measure. Don't plan for it; schedule it as a QA task after the carousel is rendered.

3. **The morph risk is now compounded.** v4 added a `layoutId` morph safety question that was never answered. v5 adds a second question: does the ancestor-transform approach actually keep the morph stable? Two unverified assumptions. This is a high-risk merge if both are wrong.

4. **The feedback loop closes faster with rendering.** v5's spec language is more detailed and specific than v4's brainstorm because the user saw the rendered carousel. They didn't approve ASCII mockups; they reacted to concrete output. That's a stronger signal. But it only works if we render *before* asking "do you want to rebuild?" not after.

5. **Five rebuilds in 12 hours is a sign of broken process, not iteration.**Iteration assumes: try → learn → adjust → try again. This pattern is: try → review → hypothesize → try again (from hypothesis, not data). The user hasn't been shown a rendered carousel they actually liked yet. Each version is either "haven't seen it rendered" or "saw it and didn't like it." That's not iteration; it's search.

## Next Steps

**CRITICAL: Browser verification must happen during v5's cook phase, not deferred to a v6 redesign.**

1. **Phase 1 (pose + character scale + card de-boxing):**
   - Build `character-carousel-poses.ts` with morph-safe ancestor placement.
   - Upscale character images (2×).
   - Implement card mask (SVG or CSS, decide during cook).
   - Detail card de-box (match carousel styling).

2. **During Phase 1, after code is written:**
   - **OPEN THE BROWSER.** Run `npm run dev`, navigate to `/characters`.
   - Measure each character pose in the rendered carousel. Update `character-carousel-poses.ts` with real values (not estimates).
   - Eyeball the card softness. Adjust mask feather if needed (too harsh → too soft range).
   - **Click a carousel card.** Verify the morph transition (carousel card → detail card expansion) is smooth and doesn't jump. If it jumps, debug the transform-ancestor geometry before moving forward.
   - Document what looks good, what needs tweaking.

3. **Phase 2 (layout + viewport):**
   - Apply 4-visible config to Embla.
   - Set carousel section to 100vh (or 100dvh for Safari iOS compat).
   - Implement fade edge opacity for cards 1 and 4.
   - Re-test in browser after this phase (layout changes often break morph visually even if code is correct).

4. **Phase 3 (polish + QA):**
   - Performance audit (Lighthouse throttle, low-end device simulation).
   - Mobile viewport test (4-visible crunch, address-bar interaction).
   - Final visual sign-off from user (not an ASCII mockup, not a code review — actual rendered carousel click-through).

5. **Post-visual-approval:**
   - Commit and merge.
   - Do **not** start a v6 brainstorm based on "it could be better." If the user approves it rendered, ship it.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260521-1753-characters-carousel-v5\`  
**Brainstorm report:** `plans/260521-1753-characters-carousel-v5/reports/brainstorm-260521-1753-characters-carousel-v5.md`  
**Related prior rounds:**  
  - v2 impl: `journal-writer-260521-0810-characters-carousel-page-implementation.md`  
  - v3 plan: `journal-writer-260521-0823-characters-page-refinement-plan.md`  
  - v3 impl: `journal-writer-260521-0926-characters-page-refinement-implementation.md`  
  - v4 plan: `journal-writer-260521-1640-characters-carousel-v4-plan.md`  
  - v4 impl: `journal-writer-260521-1721-characters-carousel-v4-implementation.md`  
**Status:** Plan + task chain complete. Ready for Phase 1 start. Critical blocker: morph safety + pose-tuning approach not yet verified in browser. Key lesson: this is the fifth rebuild; render verification must happen during cook, not deferred. If rendered carousel is approved after Phase 1 QA, do not restart.
