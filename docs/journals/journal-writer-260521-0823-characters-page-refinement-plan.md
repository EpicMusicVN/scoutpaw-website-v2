# Characters Carousel: Refinement Plan — Design-to-Code Gap Revealed

**Date:** 2026-05-21 08:23  
**Severity:** Medium  
**Component:** `/characters` carousel (hero, layout, cards, animation, navigation)  
**Status:** Planning complete; 5-phase refinement plan + blocked task chain created

## What Happened

User reviewed the just-shipped carousel (from `journal-writer-260521-0810-characters-carousel-page-implementation.md`) and identified six polish refinements. Brainstorm + planning session (`/brainstorm` → `/ck:plan`) generated two artifacts:

1. **Brainstorm report:** `plans/reports/brainstorm-260521-0823-characters-page-refinement.md` (ASCII comps + decision rationale)
2. **5-phase plan:** `plans/260521-0823-characters-page-refinement/` with blocked task chain

**Six refinements decided:**

| Priority | Refinement | Change | Rationale |
|----------|------------|--------|-----------|
| 1 | Hero | Swap `CinematicHero` → `FullBleedHero` (letterbox banner + glass text card) + `CloudDivider`s | Unify `/characters` visual language with home page; carousel sits in the site, not isolated |
| 2 | Carousel visibility | Change focal coverflow so **3 cards are fully visible** (no clipping); slide basis ~33.2%, `MIN_SCALE` 0.74→~0.86 | Original design showed ~1.5 cards with neighbours clipped; user expected whole cards visible in 3-up view |
| 3 | Background | Remove full `CharacterSceneBackdrop` sky-gradient block; keep only faint floating decor + soft cyan blend | Carousel bleeds into site background; kills visual isolation of immersive-scene work |
| 4 | Cards | Drop per-pup gradient on carousel cards; uniform calm white cards | Cleaner 3-up view; gradient reserved for detail card to signal the reveal |
| 5 | Navigation | Remove pagination dots; arrows only | Lighter chrome; focus on content |
| 6 | Animation | Cinematic rework: "center-first" (click side card → scroll to center before expand), carousel recede (scale+fade), staggered detail content, unified easing | Resolves `layoutId`-morph QA risk; cleaner interaction flow |

**Key clarifications from brainstorm:**
- Focal coverflow (3 whole) beats flat 3-up grid — focal effect preserved, but with full card visibility
- Uniform calm cards over per-pup gradients — simpler, bigger reveal contrast
- Soft-white arrows kept — small but essential affordance

**5-phase implementation:**
1. **Phase 1:** Hero + page shell (FullBleedHero, CloudDividers)
2. **Phase 2:** Carousel layout + background (Embla basis tweak, backdrop removal)
3. **Phase 3:** Card styling + navigation (white cards, no dots)
4. **Phase 4:** Animation rework (center-first, recede, stagger)
5. **Phase 5:** Cleanup + docs (delete dead `character-scene-backdrop/data`, update roadmap/changelog)

**Plan artifacts:**
- `plans/260521-0823-characters-page-refinement/plan.md` — overview
- `plans/260521-0823-characters-page-refinement/phase-01-hero-shell.md` through `phase-05-cleanup.md`
- Task list: 5 tasks, blocked chain (Phase 1 → 2 → 3 → 4 → 5)

## The Brutal Truth

**ASCII mockups are not a substitute for rendered pages.** The first carousel brainstorm (from `journal-writer-260521-0655-characters-carousel-page-plan.md`) picked "Focal Coverflow with peeking neighbours" — a decision made from an ASCII preview the user approved. But when the user *saw the rendered carousel*, they realized "peeking neighbours" meant ~1.5 cards visible, not 3 whole cards. An ASCII comp can show layout intent, but it can't show the *visceral feel* of what "3 cards visible" looks like at scale.

This is frustrating because it means a full brainstorm → ASCII mockup → approval cycle still landed off target. The design was *internally consistent* (peeking/cut neighbours match the Focal Coverflow pattern), but it missed the user's actual intent. We're now doing a second redesign of the same page in one day.

**Salvage code has a short shelf life.** The first carousel plan deliberately preserved `character-scene-backdrop.tsx`, `character-scene-decor.tsx`, and `character-scene-data.ts` to soften the loss of the immersive-scene work (from `journal-writer-260521-0220-characters-immersive-scene-completion.md`). The pitch was: "Keep the decorative infrastructure, so if we pivot again, we don't lose everything." Spoiler: this refinement deletes most of it anyway (phase 5 cleanup). The salvage felt prudent at the time, but it didn't age well. Code reuse is good; code *preservation for potential future reuse* is debt.

## Technical Details

**Files affected (deletions):**
- `components/characters/character-scene-backdrop.tsx` (120 lines of sky-gradient logic, no longer needed)
- `components/characters/character-scene-data.ts` (scene config, only used by backdrop)

**Files affected (modifications):**
- `components/characters/character-carousel.tsx` — MIN_SCALE tweak (0.74 → 0.86), remove backdrop render, add carousel recede (scale+fade on inactive slides)
- `components/characters/character-carousel-track.tsx` — adjust Embla basis calculation for 33.2% slide width (3 whole cards)
- `components/characters/character-carousel-card.tsx` — strip gradient, uniform white background
- `components/characters/character-carousel-arrows.tsx` — no changes (keep soft-white style)
- `components/characters/character-detail-card.tsx` — add staggered content animation (framer-motion `variants` + `transition.staggerChildren`), keep shared-element morph
- `app/characters/page.tsx` — replace `CinematicHero` with `FullBleedHero`, add `CloudDividers`
- `components/characters/character-scene-decor.tsx` — reduce opacity/scale for "faint floating" effect (replace `backdrop` render with minimal decor layer)

**Critical interaction change — "center-first" expand:**
Current: Click any card → detail card expands from wherever it was (left/right edge). Shared-element morph originates from off-center source.

New: Click side card → carousel scrolls it to center first (animated snap), *then* detail expands from center. Shared-element morph always originates from a full-size centered card, eliminating the `layoutId`-morph edge case flagged in the implementation review.

Implementation sketch:
```tsx
const handleCardClick = (slug, index) => {
  const isCenter = index === api.selectedIndex;
  if (!isCenter) {
    // Scroll to center first, then trigger expand
    api.scrollTo(index);
    setTimeout(() => openDetailCard(slug), 300); // wait for snap
  } else {
    openDetailCard(slug);
  }
};
```

**Animation timeline (unified easing):**
- Carousel recede: scale 1 → 0.9, opacity 1 → 0.3, 300ms ease-out (while detail card expands)
- Detail card expand: scale/opacity morph from carousel card, 300ms ease-out (shared-element)
- Detail content stagger: fade in children with 50ms stagger, 200ms per child, starts at +200ms (after card morph completes)

## What We Tried

Nothing failed; this is a *planning-only* session. Decisions were:

1. **Flat 3-up grid vs. focal coverflow** — Rejected flat grid (loses the focal effect and depth). Kept focal, adjusted scale/basis for full visibility.
2. **Per-pup gradient cards vs. uniform white** — Rejected per-pup (clutters 3-up, kills contrast on detail reveal). Moved gradient to detail card only.
3. **Keep vs. delete `character-scene-backdrop`** — Rejected keep (it's only used for a sky-gradient that's now deleted). Phase 5 removes it + data.ts.

## Root Cause Analysis

**Why did the first design miss "3 whole cards visible"?**

The Focal Coverflow pattern inherently includes peeking neighbours (scale < 1 on off-center cards). The design brief said "focal coverflow," and the ASCII mockup showed that pattern. But the user's mental model was "3 cards visible in a row," which ASCII couldn't convey at actual scale. The gap: **ASCII comps are coarse; scale-based visibility requires rendering.**

The first plan didn't ask "if a card is scaled to 0.74, how many pixels is it actually taking up at 1440px viewport width?" until implementation time. By then, the commit was in flight.

**Why did we preserve `character-scene-backdrop`?**

The immersive-scene work (3 components deleted in the first carousel implementation) felt like a loss. Preserving `backdrop` and `decor` was a soft landing—"we might use these again." But "might" code is debt. The backdrop was only useful in the immersive scene; outside that context, it's visual noise. When the carousel design evolved away from the scene, the salvage became dead weight.

## Lessons Learned

1. **ASCII mockups need a scale companion.** Before approving a focal coverflow layout, ask: "At 1440px viewport, how many pixels wide is a slide at 0.74 scale? Does that look like 'peeking' or 'clipped'?" Run the math, don't eyeball it.

2. **Preserve code only if reuse is *immediate*.** The `character-scene-backdrop` preservation was speculative ("we might use it"). Speculative reuse is debt. If the next iteration needs it, resurrect from git history; don't carry it forward.

3. **"Focal coverflow" ≠ "3 visible cards."** These are orthogonal design goals. Focal coverflow emphasizes the center card (scale/opacity tween). "3 visible" is a layout constraint. Pin down both before brainstorm.

4. **Rendered > ASCII + approved.** ASCII is great for rapid ideation, but ship a brainstorm artifact (Figma, live HTML, video walkthrough) that the user sees at scale before greenlight. One iteration of "oh, that's not what I meant" is cheaper than doing two full implementations.

5. **Center-first expand is safer than edge-case morphing.** The shared-element morph from an off-center card is canonical-but-risky. Snapping to center first makes the interaction atomic and kills the QA edge case. Simpler always wins.

## Next Steps

1. **Merge the implementation plan into the task queue.** 5 phases, blocked chain, ready to dispatch to implementation team.
2. **Phase 1 (Hero + shell):** Swap hero component, add CloudDividers. Est. 30 min, lowest-risk phase (isolated to page wrapper).
3. **Phase 2 (Carousel layout + background):** Embla basis tweak (33.2%), remove backdrop. Est. 45 min, needs verification that 3 cards fit cleanly.
4. **Phase 3 (Cards + navigation):** Strip gradients, remove dots. Est. 20 min.
5. **Phase 4 (Animation rework):** Center-first logic, recede tween, stagger. Est. 60 min, highest complexity (interaction + timeline).
6. **Phase 5 (Cleanup + docs):** Delete dead files, update roadmap (`./docs/development-roadmap.md`), changelog (`./docs/project-changelog.md`), core status. Est. 20 min.

**Success criteria:**
- `/characters` loads with FullBleedHero + 3 whole visible cards in carousel (no clipping)
- Click a side card → snaps to center → detail expands from center
- Escape/close → carousel recedes in, detail collapses, carousel scales back to full
- No jank on animation morph (test on 60 FPS Safari + Chrome)
- Build passes, prerender completes

**Visual QA before merge:**
- Dev server: click each card, escape, drag carousel, back button
- Browser inspector: verify `MIN_SCALE` produces 3 whole cards at 1440px (no partial cards)
- Touch device (iOS/Android): swipe carousel, tap cards, verify affordances

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260521-0823-characters-page-refinement\`  
**Related planning journal:** `journal-writer-260521-0655-characters-carousel-page-plan.md`  
**Related implementation journal:** `journal-writer-260521-0810-characters-carousel-page-implementation.md`  
**Brainstorm report:** `plans/reports/brainstorm-260521-0823-characters-page-refinement.md`  
**Status:** Planning complete. 5-phase plan hydrated as blocked task chain. Ready for phase 1 dispatch.
