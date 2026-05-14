# Asset Refresh: Home Logo & Hero Components

**Date**: 2026-05-12 13:45
**Severity**: Low
**Component**: Home layout, navigation
**Status**: Resolved

## What Happened

Executed mechanical cook phase to re-optimize home hero, menu cards, and logo treatments after asset updates. Synced 10 PNG files from `/assets/banner` into `/public/assets/{banner,card,logo}/`, deleted stale unreferenced `banner.webp`, and rewrote 4 React components with revised CSS positioning, gradient stops, and glow effects.

## The Brutal Truth

Straightforward execution. No surprises. The plan was locked down tight, so this was copy-paste CSS tweaking, not architectural work. Typecheck and lint both passed clean on first run. Visual QA deferred to user.

## Technical Details

**Files touched:**
- 10 PNG files (fish-eye banner + background-removed card/logo variants)
- `components/home/full-bleed-hero.tsx`: objectPosition 50/50, pt-[12svh], gradient 0.94 → 0.5@24% → 0@42%, lg:text-6xl/xl:text-7xl
- `components/home/menu-cards.tsx`: accentGlow field + radial blur radiant-gradient behind icon; group-hover intensifies drop-shadow; p-4 md:p-6
- `components/nav/footer.tsx`: stacked drop-shadow bloom on text-logo SVG over navy bg
- `components/nav/mobile-nav.tsx`: logoText Image prop added; "Menu" label replaced with text-logo variant
- `components/nav/top-nav.tsx`: passes logoText to MobileNav

**Validation**: pnpm typecheck + pnpm lint both green.

## What We Tried

Direct execution per phase doc. No pivots, no debugging.

## Root Cause Analysis

N/A — phase was fully specified and locked.

## Lessons Learned

**CSS var validation gap**: Brainstorm phase locked `--brand-peach` and `--brand-sky` color maps. These don't exist in globals.css. Had to back-substitute `--bg-blush` and `--bg-sky-deep` instead. Lesson: validate CSS variable names against globals.css before finalizing color maps in phase docs. Saves one round of rework.

**Tailwind 3.4.14 drop-shadow quirk**: drop-shadow-[...] utility accepts only one shadow def. Stacking multiple drop-shadow() functions requires [filter:...] arbitrary class. Used in footer.tsx and mobile-nav.tsx for bloom effect. Good enough to document in codebase comment.

**Cook flow efficiency**: Mechanical phases with fully-locked decisions don't need fullstack-developer subagent spawning. Direct execution on ~30-line edits cuts overhead. Reserve spawning for open-ended architecture or debugging.

## Next Steps

User spot-check at 360/768/1024/1440px breakpoints. Optional polish: (1) card `<Image sizes>` alignment with 768px md breakpoint, (2) mobile-nav alt text vs config.brand.fullName consistency.

---

**Status:** DONE
**Summary:** Asset refresh phase executed cleanly. 4 components updated, 10 PNGs synced, typecheck+lint passing. CSS var substitution and Tailwind quirk documented for future.
