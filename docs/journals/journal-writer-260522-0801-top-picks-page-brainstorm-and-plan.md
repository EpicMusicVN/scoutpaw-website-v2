# Top Picks Page: Design Approved, Modal Pushback Accepted, 5-Phase Plan Hydrated

**Date:** 2026-05-22 08:01  
**Severity:** Low  
**Component:** New `/top-picks` page, hero, deal blocks, filter chips, content schema  
**Status:** Brainstorm + plan complete; 5-phase task chain hydrated with dependencies

## What Happened

Brainstormed the design for a new ScoutPaw "Top Picks" landing page — a curated showcase of featured products and offers. User approved the design as-is. No scope changes, no failed iterations. Generated a design report and a complete 5-phase implementation plan with tasks and dependency chain.

## The Brutal Truth

This was a refreshingly efficient session. No heated debates, no scope creep, no design-by-committee. A single pushback on modals (from the brief) was briefly debated and resolved cleanly via explicit tradeoff acknowledgment. The user got the rationale, agreed, and we moved forward. No rework cycles needed.

## Technical Details: Approved Decisions

### 1. Hero Component: Reuse FullBleedHero As-Is
Reuse the existing `FullBleedHero` component from Home / Characters / Shop pages rather than building a custom or enhanced hero. This ensures visual consistency across the site and avoids one-off component debt.

**Accepted tradeoff:** FullBleedHero has no decorative-overlay slot (no Framer-Motion layers for floating toys/stars/paw prints). The brief requested these decoratives. They can only come from the banner image itself, not from a layered atmosphere component. This is an **explicit constraint**, not a bug. User acknowledged it; we're proceeding.

### 2. Deal Block Reveals: Inline CSS Accordion, Not Modal
The brief proposed modals or drawers for revealing offer details. Rejected in favor of an inline CSS `grid-template-rows: 0fr→1fr` accordion (height expansion reveal).

**Rationale:** No modals or drawers exist anywhere on the site. The site's UX is calm, scroll-driven, scroll-state-driven (parallax, hero decor follow scroll). Overlays break that aesthetic and add friction to mobile (keyboard slides, focus trap management). Modals also hurt SEO (content in modals is invisible to crawlers). YAGNI: the accordion is simple, consistent, and sufficient. User agreed this is not over-engineering pushback; it's staying true to the site's visual language.

### 3. New Content Type: `content/top-picks.json`
Create a new standalone JSON content file for curated top picks, wired through the existing pattern: JSON → Zod schema → adapter function `getTopPicks()`. This follows the site's existing data-handling pattern (same as `content/characters.json`, `content/shop.json`).

### 4. Extract Shared FilterChip Component
The brief describes category filter chips. The pattern already exists in `components/watch/explore-videos.tsx`. Extract it to a reusable `components/ui/filter-chip.tsx` for DRY. Update the Watch page to import from the new location.

### 5. Imagery: Reuse Shop + Character Assets
Use existing shop product and character photos as placeholder assets. No new photography required. Visual consistency with existing product pages.

## What We Tried

Nothing broke. One design decision (modal) was debated and resolved via explicit tradeoff acknowledgment.

## Root Cause Analysis

N/A — no failures in this session. The brainstorm was scoped clearly, the design was tight, and the user's approval came without churn. The modal pushback was anticipated (brief asked for it; site architecture doesn't support overlays) and was addressed with a clear statement of why and what we're doing instead.

## Lessons Learned

1. **Scope clarity prevents rework.** The brief was specific (hero, deal blocks, filter chips, imagery), and we stuck to it. No "what if we also" additions. This is how brainstorms should feel.

2. **State tradeoffs explicitly.** The hero-decorative tradeoff was not hidden or glossed over. It was named, explained (component architecture vs. image-only decoratives), and accepted. User knew what they were getting.

3. **Reuse before custom.** Every decision prioritized existing patterns (FullBleedHero, FilterChip, content JSON schema, data adapters). This keeps the codebase lighter and more maintainable.

4. **Modal-free design is a strength, not a limitation.** The site's calm, scroll-driven aesthetic is intentional. Pushing back on modals in favor of the accordion is not conservative or timid; it's defending the site's established voice.

## Deliverables

**Brainstorm report:** `plans/260522-0801-top-picks-page/reports/brainstorm-260522-0801-top-picks-page-design.md`

**5-phase plan:** `plans/260522-0801-top-picks-page/`
- **Phase 1: Setup & Content Schema** — Create `content/top-picks.json`, Zod schema, `getTopPicks()` adapter. (Independent)
- **Phase 2: Extract FilterChip** — Move filter chip from Watch explore to `components/ui/filter-chip.tsx`. Update Watch page. (Independent)
- **Phase 3: Hero + Layout** — Wire FullBleedHero, deal blocks grid, filter chips, basic spacing. (Depends on Phases 1 + 2)
- **Phase 4: Accordion Reveal** — Implement CSS `grid-template-rows` accordion for deal block details. (Depends on Phase 3)
- **Phase 5: Browser QA + Polish** — Viewport testing (1440px, 768px, 390px), imagery swap, spacing tune, console check. (Depends on Phase 4)

**Task chain:** Phases 1 & 2 independent; Phase 3 waits for 1+2; Phase 4 waits for 3; Phase 5 waits for 4.

## Next Steps

Phase 1 and Phase 2 can kick off immediately in parallel (no blocking dependencies). Phase 3 is unblocked once both complete.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260522-0801-top-picks-page\`  
**Design report:** `plans/260522-0801-top-picks-page/reports/brainstorm-260522-0801-top-picks-page-design.md`  
**Key decision:** Reuse FullBleedHero + inline accordion instead of modals. Hero decoratives come from banner image, not component layers (explicit tradeoff, user approved).  
**Status:** Brainstorm + plan complete. No blockers. Ready for Phase 1 + Phase 2 start (parallel).
