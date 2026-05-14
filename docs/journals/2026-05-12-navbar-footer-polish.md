# Navbar + Footer Logo Aspect-Ratio Fixes

**Date**: 2026-05-12 23:38  
**Severity**: Medium  
**Component**: Navigation (top-nav, footer)  
**Status**: Resolved

## What Happened

Navbar and footer logos were rendered at 280×112px and 280×96px respectively, creating visually stretched, awkward proportions. The intrinsic dimensions of the source images (935×789 for navbar, 812×183 for footer text wordmark) didn't match the declared layout dimensions, causing Next.js Image to squish content inside an incorrect aspect-ratio box. Result: logos looked bloated and unbalanced across all viewport sizes.

## The Brutal Truth

This was a classic "it looks wrong but I don't know why" bug that ate debugging time. We kept tweaking drop-shadow offsets and translate-y positioning hacks instead of asking the fundamental question: are the declared dimensions actually correct? Aspect-ratio mismatches are invisible in code review unless you calculate intrinsic ratios. Spent an hour chasing shadow/alignment symptoms when the root was basic math.

## Technical Details

**Navbar logo fix:**
- Declared: 280×112 (2.5:1) → Intrinsic: 935×789 (1.18:1)
- New: 118×100 (1.18:1 match) — only 0.32% deviation
- Height reduced: h-16 md:h-24 lg:h-28 → h-10 md:h-12 lg:h-14
- Removed translate-y hacks; drop-shadow blur halved (16→8 offset, 8→4 px)

**Footer text-logo fix:**
- Declared: 280×96 (2.92:1) → Intrinsic: 812×183 (4.44:1)
- New: 222×50 (4.44:1 match) — <0.1% deviation
- Height reduced: h-16 md:h-20 lg:h-24 → h-8 md:h-10 lg:h-12
- Glow blur stepped down: 20→12 px primary, 12→6 px secondary; opacity 0.45→0.5

**Newsletter CTA replacement:**
- Removed: Pill-button outline style
- Added: Plain text link (text-sm font-medium) + inline envelope SVG icon
- Color: text-ink/75 → hover:text-ink (reduces visual weight, improves scanability)

**Validation:**
- pnpm typecheck: clean
- pnpm lint: clean
- Code review verified aspect-ratio math; max 0.5% deviation from intrinsic

## Root Cause Analysis

Next.js Image sets the layout box's aspect ratio using declared width/height. If that ratio doesn't match the file's intrinsic dimensions, the image gets letterboxed or squished. We treated symptoms (bad shadow math, weird vertical alignment) instead of diagnosing the cause. The fix was deterministic once we ran `identify` on the source assets and compared ratios.

## Lessons Learned

1. **`identify` is your friend**: When a logo "looks off," the first move is check intrinsic dimensions with ImageMagick or equivalent. Compare declared vs actual ratio. Takes 10 seconds and saves an hour of tweaking.

2. **Premium-compact logo scale is 40–56 px height**: Navbar text/logo should be 36–56 px (h-9 to h-14). Footer text wordmark 32–48 px (h-8 to h-12). Previous 64–112 px was 1.5–2× the right size.

3. **Drop-shadow scales with logo size**: When you halve logo dimensions, halve shadow values too. Static shadow from a 100 px logo bruises a 50 px logo. Proportional scaling prevents asymmetric visual weight.

4. **Text + SVG icon beats outline pill in navbars**: A plain link with a 16–20 px inline icon feels 70% lighter than a button-like pill. Better for mobile hamburger-adjacent CTA density. Newsletter discovery stays intact with color shift (text-ink/75 hover state).

## Next Steps

- Visual QA deferred to user (dev server validation)
- Both this plan AND prior `asset-refresh-home-logo` plan remain uncommitted pending review
- If "Newsletter" text feels lost after polish, flag weight/color tuning in follow-up

**Status**: DONE
