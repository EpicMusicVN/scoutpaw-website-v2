# Characters Page v6: Carousel Redesign Planning

**Date**: 2026-05-22 10:12
**Severity**: Low
**Component**: Characters carousel, detail view
**Status**: Design approved, implementation planned (5 phases)

## What Happened

Completed design brainstorm and planning for the 6th iteration of the ScoutPaw Characters carousel. This is a substantial UX overhaul—moving from a centered, tight scroll pattern to a left-anchored 3+peek card layout with a cinematic push-in transition to detail view. No schema or content changes required.

## The Honest Take

Planning went smoothly; no technical blockers surfaced, but three design decisions warrant careful attention because they touch existing settled choices and HTML content model constraints. The user explicitly approved the final direction, which is good—but there's real density risk in fitting four text blocks on every carousel card.

## Technical Details

**Design decisions made:**

1. **Carousel masking** — Cards now left-anchor (Embla `align: "start"`). The fourth card peeks and fades via CSS `mask-image: linear-gradient(to right, ...)`, replacing the per-frame JS opacity fade in `use-carousel-fade.ts`. Deleting that hook is a KISS + perf win.

2. **Carousel card structure** — New layout: white content card (breed kicker, name, tagline, 2-line bio, compact quote) with pose PNG overlapping out the top edge. The quote is rendered via the existing `CharacterQuote` component, which outputs `<blockquote>` (flow content). A `<button>` cannot contain flow content, so the v5 pattern (single-button card) is invalid. **Solution**: stretched-button-overlay—a semantic `<article>` with full content (h3/p/blockquote) plus an absolutely-positioned transparent `<button>` as the click/focus target. Reuses `CharacterQuote` unchanged (DRY), maintains valid HTML.

3. **Detail view transition** — Layered cinematic crossfade (carousel scale-down/fade, detail scale-up/fade in), NOT a shared-element morph. This is intentional: v4 removed morph explicitly ("Detail Card De-Morph" decision). User was offered the morph option and chose the cinematic push instead. **Lesson**: a settled architectural decision shouldn't be silently re-litigated. Offer alternatives, document the choice, move on.

4. **CharacterQuote variant** — Adding a `compact` prop to `CharacterQuote` so carousel and detail view can share it. Default behavior unchanged for existing consumers (DealBlock, etc.).

## Density Reality Check

Four text blocks (breed, name, tagline, quote) on every carousel card at 3-up fill visual real estate aggressively. Mitigated via `line-clamp-2` on bio + quote and tight typography. Flagged openly to user as a clutter risk—user accepted the trade-off for richness.

## What We Got Right

- Recognized the button content model constraint early; pattern decision (overlay) emerged naturally from HTML spec reality, not guesswork.
- Reuse of existing `CharacterQuote` component keeps the implementation DRY and familiar.
- Past decision (no morph) was honored despite push toward "smoother" transitions; the cinematic layered effect is actually cleaner and less ambiguous.
- Phase dependencies modeled cleanly: 1-3 independent, 4 waits on all three, 5 waits on 4. Implementation can parallelize early phases.

## Next Steps

1. Implement Phase 1 (carousel layout & masking)
2. Implement Phases 2-3 in parallel (detail view, variant props)
3. Integrate Phase 4 (transition orchestration) after 1-3 merge
4. Polish & test Phase 5 (carousel→detail & detail→carousel flow)

All task tickets hydrated and ready. No external blockers.
