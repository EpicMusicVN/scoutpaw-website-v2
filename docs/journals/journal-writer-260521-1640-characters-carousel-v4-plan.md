# Characters Carousel V4: Brainstorm + Plan — Fourth Redesign in One Day, Reversing Two User-Confirmed Decisions

**Date:** 2026-05-21 16:40  
**Severity:** Medium  
**Component:** `/characters` carousel card design, layout, transitions  
**Status:** Plan complete; 3-phase implementation plan hydrated as blocked task chain

## What Happened

Brainstorm + planning session for a fourth carousel redesign in one day. User requested six changes; the substantive ones:

1. **Drop focal coverflow.** All cards same scale + height (reverses the "focal coverflow centered with neighbors at 0.86× scale" design from V3 implementation, which was itself a refinement of V2).
2. **Restore per-pup gradient card backgrounds with glow/motif effects** (reverses V3's "uniform calm white cards", which replaced V2's gradients).
3. **Character pose overflows card top edge.** ~50% of pose sits inside the card, ~50% extends above it, straddling the boundary.
4. **Move carousel by 1 card per scroll** (user initially requested 3, but acknowledged during brainstorm that 5 characters don't divide evenly by 3; revised to 1 after seeing the trade-off).
5. **Smoother fade transitions** on card boundaries.
6. Move next/prev nav — already shipped in V3, confirmed fine, skipped this round.

**Clarifications surfaced during brainstorm:**
- "3 cards visible" — already shipped V3, working as expected.
- "Background blends with site" — already shipped V3, confirmed fine.
- The pose overflow constraint: Embla's viewport must keep `overflow:hidden` to hide off-screen slides, so true DOM overflow is impossible. Design solution: add `pt-[<pose-height>]` top padding to the carousel track, letting the pose extend up into that padding stripe (still inside the viewport, visually floating above the card).

**Artifacts:** 
- Brainstorm report: `plans/260521-1640-characters-carousel-v4/reports/brainstorm-260521-1640-characters-carousel-v4.md`
- 3-phase plan: `plans/260521-1640-characters-carousel-v4/` with phases:
  - Phase 1: Pose tuning + gradient card backgrounds + glow/motif restoration
  - Phase 2: Carousel layout (flat scale, move-by-1, fade transitions)
  - Phase 3: Polish + documentation + visual QA
- Task chain: `pose-and-cards` → `carousel-layout` → `polish-and-qa` (blocked dependencies)

## The Brutal Truth

**This is the fourth redesign of one 5-card carousel in a single day, and two of the user's new requests directly reverse decisions they explicitly approved two rounds ago.**

The timeline:
- **V2 (08:10):** Coverflow focal design + per-pup gradient cards. User saw rendered output.
- **V3 (08:23 plan, 09:26 impl):** Flattened scale (no focal), switched to uniform white cards. Rendered.
- **V4 (now, 16:40):** Reverse to flat scale (already V3's choice), reverse back to gradient cards (already V2's choice).

Each V2→V3 decision was made from an **ASCII mockup preview** (`AskUserQuestion` with 6-option branching diagrams). The user chose "flat + white" over "focal + gradient" at that stage. Then saw it rendered in V3, used the site for hours, and now requests a return to gradient cards (but keep the flat scale). The gradient cards looked better in ASCII than in practice; the flat layout looked worse in ASCII than in practice.

**The process inefficiency is now undeniable:** Brainstorm + plan + cook cycles consume 1–2 hours per round (the prior refinement cycle took 56 minutes from plan to implementation). We are running that cycle on visual/aesthetic questions that *only a running browser can answer*. ASCII mockups are confidence theater. The user needs to click, see motion, feel the scale and spacing, and decide. Not pick from ASCII options.

**Here's what the journals show:**
1. V2 implementation (journal: `0810`): "Rendered carousel works, looks good." Code is green, state clean, ready to ship.
2. V3 refinement plan (journal: `0823`): User sees ASCII diagrams of flat vs. focal, white vs. gradient—picks flat + white.
3. V3 refinement implementation (journal: `0926`): Renders it, code review finds 3 state bugs, fixes them. Carousel is now green, flat, white.
4. V4 brainstorm (now): User sees same ASCII options + rendered screenshots from V3, asks to reverse both card visual decisions, keep flat scale.

The honest truth: **The brainstorm tool is not the constraint. The rendered browser is.** If the goal is to avoid rework, the path is:
1. Build a quick, rough-draft version (V2 level, maybe 30–40 min).
2. Ship it to a staging/preview URL.
3. Let the user click around, feel the interactions, see the motion, and decide.
4. Only then iterate.

Instead, we run ASCII-brainstorm → plan → code → visual-QA cycles. By the time the user sees the rendered page, decisions are "baked" and require a full rework cycle to change. That's what happened here: V2 shipped, user saw it rendered, picked "flat + white" from ASCII, V3 shipped, user clicked it, decided gradients were better, now V4 is queued.

**The self-critical realization:** I contributed to this by running the brainstorm + plan cycle again instead of flagging the pattern. The rendered V3 already exists. It's live to the user's browser. The feedback medium (ASCII mockup) is broken. Running a 4th plan cycle doesn't fix that.

## Technical Details

**Key design constraints identified:**

1. **Pose overflow + viewport safety.** Embla carousel uses `overflow:hidden` on viewport to clip off-screen slides. DOM overflow is not possible. Solution: Add top padding to carousel container equal to pose height (approx. 60–80px estimated). The pose extends up into this padding stripe, creating the visual effect of straddling the card boundary while remaining technically inside the viewport.

2. **Gradient card backgrounds + glow/motif.** Card redesign:
   - Per-character themed gradient (matching V2 design, stored in `character-themes.ts` or new `card-styles.ts`)
   - Glow effect (shadow blur or radial gradient overlay, subtle)
   - Character motif icon or accent (small SVG or image, positioned top-right or bottom-left)
   - Text + charm points + species info sit on top of gradient + glow layer

3. **Flat scale + move-by-1.** Carousel parameters:
   - All cards `scale: 1` (no focal scaling)
   - All cards same `height` (V3's slide-basis split is replaced with uniform sizing)
   - Click next/prev moves carousel by exactly 1 card
   - Visible cards fade in/out at edges (opacity transition on cards entering/leaving viewport)

4. **Fade transitions.** 
   - Cards at viewport edges (first/last visible) fade from/to transparent (opacity 0 → 1 → 0)
   - Fade duration tied to scroll animation (same easing as V3)
   - No fade on focal cards (all cards now have equal opacity when visible)

**Files to touch (planned, not yet coded):**
- `components/characters/character-carousel.tsx` — update carousel parameters (remove focal scale, set move-by-1 logic)
- `components/characters/character-carousel-track.tsx` — flatten scale logic, add top padding for pose overflow, add fade CSS on edge cards
- `components/characters/character-detail-card.tsx` — restore gradient background from V2 assets or rebuild
- New/updated: `lib/content/character-themes.ts` or new `card-styles.ts` — gradient definitions, motif icon mappings
- `components/characters/character-carousel-ambient.tsx` — review ambient decor against new card visual weight

**Open technical questions (for implementation phase):**
- Pose height estimate: Need to measure actual rendered pose SVG/image to set padding accurately. Risk: padding too small = pose clips; too large = excessive whitespace.
- Gradient + glow performance: Are the per-card gradients + glow overlays expensive to animate? Test on low-end device (Lighthouse simulated throttle) during phase 3.
- `layoutId` morph safety: V3 risk (from `0926` journal) still unverified in real browser. Now there's a gradient layer + glow. Do those break the morph in browser? Test.
- Fade on edges: Does Embla's scroll listener have sufficient granularity to know which cards are at the viewport edge? Or do we need a custom intersection observer?

## What We Tried

N/A — brainstorm + plan session only, no code written. ASCII mockup options were reviewed; user made selections. No failed implementations in this phase.

## Root Cause Analysis

**Why is there a V4 at all?**

The user made an informed, explicit choice in V3's ASCII brainstorm: "flat scale, white cards" over "focal scale, gradient cards." That choice was rendered in V3, deployed, and confirmed (user approved it for merge, saw it live). Hours later, the user is asking to reverse both the card color and aesthetic choice, though keeping the scale.

**Root cause:** The feedback medium (ASCII mockup) does not represent the emotional/aesthetic impact of rendered design. Mockups are good for structure (layout, visibility, information hierarchy). They are terrible for **feel** (visual weight, depth, brand cohesion, motion appeal). The user's brain makes different aesthetic choices looking at ASCII vs. a rendered page. That's not a mistake; it's human. ASCII and rendered are fundamentally different sensory inputs.

**Why wasn't this caught earlier?** The brainstorm tool offers ASCII mockups because they're fast to generate and easy to compare. That speed is false economy: it creates decision-making confidence about questions that can't be answered without rendering. The user doesn't feel wrong picking "white cards" from ASCII. They *did* feel it was suboptimal after clicking them in V3.

## Lessons Learned

1. **ASCII mockups are not usable feedback tools for aesthetic questions.** They are great for structure (can we fit 3 cards visible? should nav be top or side?). They fail for visual polish (color, glow, depth, motion appeal). The user will make different choices looking at ASCII vs. a running page. This is not indecision; it's a mismatch between the tool and the question type.

2. **Rendered iteration is faster than brainstorm-plan-code cycles for visual work.** A rough rendered version (even V2's relatively simple coverflow) deployed in 40 minutes, with feedback incorporated in a 1-hour refinement cycle, is more efficient than ASCII-brainstorm → 1.5-hour plan+code+review cycle that still requires a browser QA step. We've now run the slow path four times on the same component.

3. **The honest timeline for "which aesthetic do you prefer?" should be: render rough → deploy → user clicks + uses → feedback → refine and re-deploy.** Not: render → user sees ASCII options → pick option → code → user sees rendered → ask for change → code again.

4. **Decision reversals after visual render are not a failure mode; they're a feature of good feedback.** The V2 gradient cards + coverflow did look nicer rendered than anticipated. The V3 white cards did look flatter than expected. That's useful information. The failure is running 4 planning cycles instead of accepting that rendered iteration is the feedback medium.

5. **This session's brainstorm was not the problem; running it was.** The brainstorm itself is well-structured (clear options, user reasoning captured, trades explained). The problem is what we do *after* the user picks: another plan-code-review cycle, when what the user needs is a rendered page to click.

## Next Steps

1. **Ship the 3-phase implementation plan (task chain created; blocked tasks ready).**
   - Phase 1 (pose + gradient cards): Extract pose height from V2, update card backgrounds, add glow layer
   - Phase 2 (carousel layout): Flatten scale, move-by-1 logic, edge fades
   - Phase 3 (polish + QA): Verify `layoutId` morph with new gradients, test pose padding on mobile, check performance

2. **After Phase 3 QA, commit and deploy to production immediately.** Don't loop back to brainstorm. The rendered page is now the feedback medium.

3. **If user requests changes post-deploy:** Instead of another brainstorm → plan cycle, create a quick experimental branch, push to staging URL, let user click for 10 minutes, then decide if change is worth the code work. This collapses the feedback loop from 1–2 hours to 10 minutes.

4. **Document this lesson in the project's development guide.** Future dev should know: ASCII mockups are for structure, not aesthetics. Use them to validate "can we fit the content" and "is the hierarchy clear?" Don't use them to choose colors, glows, or depth effects. Render first.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260521-1640-characters-carousel-v4\`  
**Brainstorm report:** `plans/260521-1640-characters-carousel-v4\reports\brainstorm-260521-1640-characters-carousel-v4.md`  
**Related prior rounds:** 
  - V2 impl: `journal-writer-260521-0810-characters-carousel-page-implementation.md`
  - V3 plan: `journal-writer-260521-0823-characters-page-refinement-plan.md`
  - V3 impl: `journal-writer-260521-0926-characters-page-refinement-implementation.md`  
**Status:** Plan + task chain complete. Implementation blocked pending phase 1 start. Key risk: `layoutId` morph + new gradients not yet verified in browser. Key lesson: rendered iteration beats brainstorm cycles for visual work.
