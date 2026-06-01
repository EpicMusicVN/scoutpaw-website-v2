# Characters Page v7: Rapid Design Iteration & the Cost of Taste Pivots

**Date**: 2026-05-22 10:38
**Severity**: Low (design refactoring, not a bug or outage)
**Component**: Characters page carousel & detail view
**Status**: Approved and planned

## What Happened

v7 was designed and planned within 90 minutes of v6 shipping. Three major v6 design decisions were reversed: white cards → themed accent-color cards, content-rich card layout → minimal name+tagline nameplate, and v6's de-boxed detail view → a premium floating card treatment. The user approved the new direction as-is, and a 4-phase implementation plan was created (Phases 1–3 independent; Phase 4 cleanup depends on all).

## The Brutal Truth

This session felt productive and collaborative—the design work itself was smooth. But the underlying reality is uncomfortable: we shipped v6 just 90 minutes ago, and now we're throwing away meaningful parts of it. The carousel card component alone is on its third full rebuild in under 24 hours (v5 → v6 → v7). The character-carousel-card.tsx file has absorbed nearly all the design churn. This is the cost of rapid visual iteration on a design-heavy page. It's not *wrong*—the new direction is genuinely better—but it's worth naming honestly rather than pretending we nailed it the first time.

## Technical Details

Three design reversals:

1. **Card styling**: v6 used white card backgrounds to solve an accessibility crisis—character accentColors vary wildly in luminance (Oscar #9C6644 dark brown vs Max #FFB627 light yellow), so a single text color can't stay AA-contrast across all cards. v7 reintroduces colored backgrounds but solves the contrast problem inline: each card now applies `luminance(accentColor) > 0.5 ? darkText : lightText` logic. This prevents the same accessibility guarantee from silently breaking.

2. **Card content**: v6 packed five text blocks per card (name, breed, tagline, bio snippet, quote). v7 strips to a minimal signature nameplate: name + tagline only, sitting on a small solid-color bar. This is a genuine KISS win—less cognitive load, clearer visual hierarchy. The character art now dominates the slide.

3. **Detail view layout**: v6 used a de-boxed treatment (content flowing freely over the page). v7 wraps detail in a premium floating card (rounded corners, soft shadow, layered depth) over a soft themed wash with drifting decor. The card feels more intentional and cinematic, but it's a taste pivot, not a functional improvement.

## What We Tried

No false starts here—this was a directed brainstorm, not a debate. The user showed the new direction; we evaluated and refined it. The only "trying" was validating that the luminance-based text color solution would hold the WCAG AA line.

## Root Cause Analysis

Two things to note:

**1. Reversal churn is real and was surfaced.** When the user's new request undid three v6 decisions, we named it explicitly rather than silently absorbing the scope creep. This mattered: the user was making a conscious choice to pivot, not unknowingly duplicating work. Lesson: when a new brief reverses recent decisions, flag it in the sync so the choice is visible.

**2. A silent accessibility hazard was caught at design time.** The brief asked for "card background = character's accent color," which reintroduced the luminance problem v6 had solved. Rather than escalate to the user, we baked the fix into the design—luminance-based text color, inline in the component (one consumer, so YAGNI on a shared util). This held the accessibility guarantee without requiring a clarifying round-trip. But the pattern is worth noting: visual pivots can silently undo accessibility work; check for these at design approval time, not implementation time.

## Lessons Learned

1. **Name reversal churn.** When a new request undoes recent work, surface it explicitly. The user may be choosing taste over efficiency (valid choice), but they should choose consciously, not accidentally.

2. **Accessibility checks at design time.** A luminance-based approach to text color on variable backgrounds is sound, but it should be written down *before* implementation. Don't discover contrast failures during QA.

3. **Component churn is a visible metric.** character-carousel-card.tsx on its third rebuild in one day is a yellow flag worth capturing in a journal. Not a blocker, but a signal that this component is absorbing design uncertainty. Future iterations should either slow the design feedback loop or accept that one component will continue to churn.

## Next Steps

1. **Implement Phase 1** (Embla config: loop:true → loop:false, bound the Max anchor, add disabled states to prev/next arrows)
2. **Implement Phase 2** (card rebuild: minimal nameplate + dominantpose + accent-color logic)
3. **Implement Phase 3** (detail view: floating card + atmosphere decor)
4. **Phase 4 cleanup + QA** (visual polish, accessibility audit, cross-browser test)

All phases are hydrated in the task list. No blockers identified.

---

**Files directly impacted:** character-carousel.tsx, character-carousel-card.tsx, character-detail-view.tsx, possibly new component for atmosphere decor.

**No implementation code written.** Design and plan only.
