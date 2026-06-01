# Characters Page: Pivot to Embla Focal Coverflow Carousel

**Date:** 2026-05-21 06:55  
**Severity:** Medium  
**Component:** `/characters` page + routing strategy  
**Status:** Planning complete, 5-phase implementation plan blocked and ready

## What Happened

After six iterations of full-screen immersive scene design (262 lines of SVG, animated backdrops, depth-layered figures), the `/characters` route is being **pivoted entirely away** from that direction. New direction: `CinematicHero` + horizontal **Embla Focal-Coverflow carousel** showcasing the 5 pups, with click-to-expand inline detail cards. The immersive scene work is retired; decorative infrastructure (`character-atmosphere`, `character-motif`, `character-scene-backdrop/decor`, `character-quote`, `getCharacterTheme`) is salvaged and reused.

Brainstorm + planning session via `/brainstorm` then `/ck:plan` produced a 5-phase implementation roadmap and detailed risk analysis.

## The Brutal Truth

This is a **hard pivot**, and it stings. Six weeks of iterative work on the immersive scene—layout refinement, backdrop enrichment, reduced-motion fixes, responsive validation—is being shelved. The codebase contains four completed journals documenting that effort, plus three plan directories. That's not lost time (the architectural patterns are portable), but it feels like one.

The honest part: the decision came from clarity that the immersive scene, while visually rich, wasn't serving user intent well. A scroll-and-click carousel is **more discoverable** (hero draws attention, carousel invites lateral exploration), **faster to load** (no full-screen animation overhead), and **better for SEO** (individual pup pages are still canonical). The immersive scene was beautiful, but it was optimizing for atmosphere over usability.

What's harder to admit: the pivot was triggered by a design reference (`pin.it/1AEx2qgAe`) that the team couldn't access during the session. That meant the plan was drafted entirely from a written brief, not visual precedent. That's acceptable (briefs are detailed), but it's a known gap—when implementation starts, the Pinterest reference may reveal visual details the plan misses.

## Technical Details

**Key decisions:**

- **Carousel library:** Embla (`embla-carousel-react`, ~6kb headless) over custom Framer Motion or Swiper. Headless = maximum control, minimal footprint.
- **Detail routing:** Keep `/characters/[slug]` detail pages (SEO, per-pup sharing, long-form bio). Query param `?pup=<slug>` drives carousel scroll position and inline card open state (shallow routing, shareable, back-button friendly).
- **Visual pattern:** "Focal Coverflow"—large center card with full artwork, dimmed/scaled neighbors with subtle perspective tilt.
- **Transition:** Framer Motion `layoutId` morph between carousel card artwork and detail card artwork (card → expanded detail).
- **Hero:** Reuse existing `cinematic-hero` component (consistency, no new investment).
- **Content:** No schema changes. `characters.json` already holds `name`, `tagline`, `bio`, `quote`, `poses`. Detail title derives from `name`.

**Artifacts produced:**

- **Brainstorm report:** `plans/260521-0655-characters-carousel-page/reports/brainstorm-260521-0655-characters-carousel-page.md` (design brief, carousel reference, detail workflow, Q&A)
- **5-phase plan:** `plans/260521-0655-characters-carousel-page/` with phases:
  - Phase 1: Setup & Dependencies (Embla install, query param parsing, suspense boundary setup)
  - Phase 2: Carousel Coverflow (Embla integration, carousel styling, focal effect)
  - Phase 3: Detail Card & Transition (inline card render, `layoutId` morph, open/close state)
  - Phase 4: Responsive & Accessibility (breakpoint testing, keyboard nav, ARIA labels, touch UX)
  - Phase 5: Cleanup & Docs Sync (retire immersive scene files, update roadmap/changelog)

**Files to delete:** `character-scene.tsx`, `character-scene-figure.tsx` (rest of scene infrastructure is reused as decor/theme layers).

## What We Tried

N/A — this is planning, not implementation. No code written. The pivot came from design clarification, not failed iteration.

## Root Cause Analysis

**Why the pivot now?** The immersive scene was a **proof-of-concept for richness**, not a ship decision. Six iterations proved the feasibility (responsive, performant, reduced-motion safe) but didn't answer the user-experience question: "Does a full-screen animated scene help users discover and engage with the pups?" The honest answer is no—it's atmospheric but not functional.

The carousel is **hypothesis-driven**: horizontal layout is a familiar affordance, focal scaling draws the eye to the active pup, inline card expansion keeps context, per-pup pages serve long-form storytelling. It's less "wow" and more "usable."

**Why now, not earlier?** The immersive scene required validation. Couldn't skip to carousel without proving full-screen responsiveness and performance were viable. That work wasn't wasted—it informed the confidence level in the new plan.

## Lessons Learned

1. **Visual richness ≠ user value.** The immersive scene was accomplished technically but didn't serve the design intent of "help users know the pups." A simpler, more scannable pattern (carousel) is better. Next time, validate the intent before investing in execution.

2. **Proof-of-concept work is intentional technical debt.** Those six iterations were exploring viability. Don't regret shelving the result—regret would mean you didn't learn from building it. You did (performance, responsive patterns, reduced-motion handling). Ship the learning, not the artifact.

3. **Design references require fallback strategy.** The Pinterest pin was inaccessible—plan relied entirely on the brief. This worked, but it's a gap. Recommendation: when referencing external design, always include a text description of the key visuals (color, scale, depth cues, typography) so the plan survives link rot.

4. **Query params are shareable state.** `?pup=<slug>` means a user can copy the URL and land on the expanded card directly. This is a feature, not overhead. Treat route params as part of the contract from the start.

5. **Headless carousel + Framer Motion is a proven pairing.** Embla handles scroll logic, Framer Motion handles morph transitions. Clear responsibility split. No framework-vs-library conflicts.

## Next Steps

1. **Claim Phase 1** (Setup & Dependencies) — Install Embla, scaffold query param parsing, add Suspense boundary, verify build clean.
2. **Parallel work:** Phase 2 (Carousel) and Phase 3 (Detail) can run together if split by ownership (carousel structure vs. detail card).
3. **Phase 4 (Responsive & Accessibility)** — Must not start until Phase 2/3 are code-complete (breakpoint testing requires working carousel).
4. **Phase 5 (Cleanup)** — Retire immersive scene files, update `development-roadmap.md` (mark "Characters Page" phase complete, close related plan directories), update `project-changelog.md` (document the pivot, link to this journal).
5. **Unresolved:** Pinterest reference inaccessible—will verify focal coverflow styling against written brief. If visual details mismatch when implementation starts, escalate for clarification.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260521-0655-characters-carousel-page\`  
**Brainstorm report:** `D:\works\emvn\scoutpaw-v2\plans\260521-0655-characters-carousel-page\reports\brainstorm-260521-0655-characters-carousel-page.md`  
**Status:** Planning complete. Blocked task chain ready for implementation handoff.
