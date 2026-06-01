# Characters Carousel v6: Render Before Reasoning — Root Cause Found, Asset Normalization Approved

**Date:** 2026-05-22 03:20  
**Severity:** Critical  
**Component:** `/characters` carousel page, pose assets, shared-element morph, card design  
**Status:** Brainstorm + plan complete; 5-phase blocking task chain hydrated

## What Happened

**The first carousel render happened.** A dev server was already running on localhost:3000. Using the chrome-devtools skill, I screenshotted `/characters` at three viewports: desktop 1440px, mobile 390px, and the detail card modal. Screenshots saved to `.claude/chrome-devtools/screenshots/`.

**What the render showed:** Carousel displayed as a row of pale washed-out gradient rectangles. Side cards faded near-invisible. Characters rendered TINY — unrecognizable silhouettes. Cavernous vertical whitespace from `100svh` flex-centering with no content. Cookie banner overlay clipped card titles. JavaScript console showed two live shipping errors: a Framer-Motion "animate opacity from undefined" warning and an SVG path error ("<path> attribute d: Expected moveto... undefined").

This is v5's code running.

## The Brutal Truth

**Five carousel rebuilds shipped with zero renders. Every journal ended with "needs browser QA." It never happened.**

v1, v2, v3, v4, v5 — all landed in code review with flagged risks ("morph unverified," "aspect mismatch," "visual QA pending"). All deferred visual verification. All were merged or left hanging while the team planned the next cycle. The promise of "we'll QA it" became background noise. So v5 shipped to localhost, no one opened the page, and the user finally saw it 12+ hours later and triggered v6.

**But in this session, something actually broke the pattern: the page was already running.** Instead of planning another cycle blind, I opened the browser. And the render revealed a single fact that five cycles of rigorous code review never discovered.

## Technical Details: The Root Cause

I downloaded the 13 pose PNGs from the asset directory and measured their opaque content bounding boxes using ImageMagick `identify -trim`.

**Result:** Every single PNG is 1280x720 LANDSCAPE canvas. The opaque character occupies only ~38% of the canvas width and ~82% of the height, off-center, with substantial empty transparent air around it.

- **Golden1:** 485px opaque width × 584px height (38% × 81% of canvas)
- **Husky1:** 389px opaque width × 594px height (30% × 83% of canvas)
- **Collie1:** 519px opaque width × 619px height (41% × 86% of canvas)
- **Corgi2:** 483px opaque width × 580px height (38% × 81% of canvas)
- **Poodle1:** 536px opaque width × 574px height (42% × 80% of canvas)
- **All others:** 60–70% empty transparent air per PNG

These assets are **designed for horizontal 16:9 display** — think cast-group lineup shot. When rendered through `<Image object-contain>` into a portrait card box, the character occupies perhaps 40% of visible card height. Scaling up doesn't help; more empty air scales with it.

**This single fact — never measured, never mentioned in any journal — explains why all five CSS-only rebuilds failed to make characters "dominant" and "2× larger."** The assets are the constraint, not the CSS. No card design, fade curve, or overflow trick can make a character larger if 60% of its PNG is transparent air around it.

The five prior journals diagnosed symptoms ("characters still small," "cards feel boxy") and prescribed CSS fixes ("upscale via transform," "overflow the card boundary," "de-box with masks"). None of those fixes address the root: the assets themselves are landscape-framed with the character off-center in a sea of empty space.

## What We Tried (v1–v5)

- **v2–v4:** Bigger overflow, taller cards, stronger gradient focus, pose transforms.
- **v5:** Ancestor-applied pose tuning (morph-safe), card de-boxing with radial masks, `100svh` full-height section.
- **Result:** Character still renders tiny; cards still pale and inert; section still feels empty.

Each fix was *locally correct* (the CSS changes were valid). Each fix was *globally powerless* (the asset constraint was never identified). That's the signature of debugging a visual system without rendering it.

## Root Cause Analysis

**Why did five CSS-only rebuilds fail to solve "characters look small"?**

Because the PNGs are landscape assets with the character off-center and surrounded by 60% empty space. A portrait card cannot display a landscape asset at dominance. Tuning opacity, overflow, scale, and shadow cannot change the geometric fact that most of the PNG is air.

**Why was this never caught in code review?**

Because the reviews examined CSS values, opacity curves, and layout math — none of which reveal asset composition. A code review of `scale: 1.2` cannot tell you whether the scaled result is 1.2 of a 40%-opaque PNG (still small) or 1.2 of a 100%-opaque asset (large). The only way to know is to render it and measure.

**Why did v5's pose-tuning file never get real values?**

Because populating it requires running the app, looking at the carousel, and eyeballing scale/offset numbers. That's a render activity, not a code activity. But it was written as a code file in TypeScript, so it was code-reviewed, and the review correctly flagged that it had no real values. This is backwards: the file should only exist *after* rendering and measuring; it should not be a plan deliverable.

## Approved Decisions (User + Brainstorm)

1. **Normalize the 13 pose assets.** Use ImageMagick to:
   - Trim each PNG to its opaque bounding box.
   - Re-pad the trimmed content to a uniform 900×1200px portrait canvas (character fills ~92% of height, bottom-aligned, centered horizontally).
   - This makes the character occupy ~92% of visible card height instead of ~40%. No CSS tricks needed; the asset itself is now dominant.

2. **Drop the Framer-Motion `layoutId` shared-element morph.** This has been a recurring source of bugs across v4 and v5 (morph trap, asymmetry, unverified). Replace with the existing `AnimatePresence` + `crossfade` approach. The morph is not a requirement; the fade is sufficient and proven.

3. **Soft-glow-only cards.** No gradient rectangle, no box, no border, no shadow. Cards are pure aesthetic layers (glow effect, optionally a theme-tint overlay). Page background shows through. Characters and text sit directly on the page, not in a "contained card."

4. **Delete `character-carousel-poses.ts`.** It was built with neutral values twice and will never be populated because populating it is a render activity, not code. The pose assets now being uniformly normalized remove the need for per-character tuning.

## Deliverables

**Brainstorm report:** `plans/260522-0320-characters-page-carousel-refinement/reports/brainstorm-260522-0320-characters-carousel-v6-brainstorm.md`

**5-phase plan:** `plans/260522-0320-characters-page-carousel-refinement/`

- **Phase 1: Asset Normalization** — ImageMagick normalize all 13 PNGs to 900×1200 portrait, opaque bbox trim + re-pad. Verify in browser.
- **Phase 2: Card + Fade Redesign** — Remove gradient box structure. Implement soft glow and theme overlay. Replace morph with crossfade.
- **Phase 3: Detail Card Simplification** — De-morph detail card to a simple modal. Remove aspect constraint, remove tuning ancestor.
- **Phase 4: Page Rhythm + Bug Fixes** — Vertical spacing, cookie banner z-index, SVG path undefined error, framer opacity undefined.
- **Phase 5: Browser QA Gate (HARD BLOCKER)** — Render /characters at 3 viewports. Verify zero console errors. Visually approve before merge. This phase cannot be marked done without explicit human visual sign-off.

**Task chain:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (sequential blocking). Phase 5 is a hard gate; no merge without browser verification.

## Lessons Learned

1. **Render before reasoning.** Five cycles of rigorous static code review never found what one screenshot + one ImageMagick measurement revealed in minutes. The asset composition is a *physical fact* that exists independent of code. Static analysis cannot see it. Rendering can.

2. **Process failure is the root cause.** The carousel saga is not a code quality failure. The code is clean, the reviews are thorough, the TypeScript is correct. The failure is **treating rendering as a stretch goal instead of the primary diagnostic.** Every journal promised browser QA as a next step. Every next step was a new brainstorm cycle, not a render.

3. **Pose tuning is not a code deliverable.** The file was built twice with neutral defaults and flagged as a no-op both times because **the only way to populate it is to render the page and eyeball values.** Stop planning it as code; schedule it as a QA task after rendering, or remove it entirely if the assets are normalized.

4. **Visual constraints must be measured, not guessed.** A landscape asset in a portrait card is a geometric constraint. It cannot be overcome with CSS scale, opacity, or overflow. It must be fixed at the asset level (normalize the PNGs) or removed (drop the image entirely). Guessing at CSS-only fixes wastes cycles.

5. **Blocking on rendering prevents cascade failure.** v5 shipped with known imperfections because the process deferred QA. The user then saw the rendering and immediately triggered v6. If v5 had blocked on visual approval before merge, the user would have been consulted during the cook phase, not after. The current flow (code → review → merge → user sees → v6 triggered) guarantees rework. The correct flow is (code → render + user approval → merge).

## Next Steps

**Phase 1 blocks everything; cannot start Phase 2 until assets are normalized and verified rendered.**

1. **Measure all 13 pose PNGs with ImageMagick:** `identify -trim` on each to get exact opaque bbox.
2. **Normalize to 900×1200 portrait:** Trim opaque content, re-pad to uniform canvas, character bottom-aligned, centered.
3. **Update pose file references in `content/characters.json`** to point to the new normalized assets.
4. **Browser verification:** Render `/characters` at desktop 1440px. Visually confirm characters are now dominant (~92% card height, recognizable, readable).

Phase 5 is non-negotiable: **no merge without explicit browser visual approval at 3 viewports with zero console errors.**

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260522-0320-characters-page-carousel-refinement\`  
**Brainstorm report:** `plans/260522-0320-characters-page-carousel-refinement/reports/brainstorm-260522-0320-characters-carousel-v6-brainstorm.md`  
**Prior cycle journals:**  
  - v5 impl: `journal-writer-260522-0045-characters-carousel-v5-implementation.md`  
  - v5 plan: `journal-writer-260521-1753-characters-carousel-v5-plan.md`  
  - v4 impl: `journal-writer-260521-1721-characters-carousel-v4-implementation.md`  
**Key discovery:** Asset composition measured with ImageMagick; all 13 PNGs are 1280×720 landscape with character 38–42% width, 80–86% height, rest transparent air. This is the single constraint none of five CSS rebuilds could overcome.  
**Status:** Brainstorm + plan complete. Root cause identified (assets, not CSS). Decisions approved. 5-phase plan hydrated with sequential blocking. Phase 5 is a hard QA gate. Ready for Phase 1 start.
