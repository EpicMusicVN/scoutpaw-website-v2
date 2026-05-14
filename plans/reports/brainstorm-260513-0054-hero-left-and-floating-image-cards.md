# Brainstorm — Hero Left Swap + Floating-Image Pinterest Cards

**Date:** 2026-05-13
**Status:** Approved, ready for `/ck:plan`
**Scope:** Two iterative refinements (continuing the home-page polish run):
1. Hero — swap glass card position from upper-right → upper-left
2. Pack cards — restructure from "full-width image + smaller text below" → "small centered floating image + full-width text card below" (Pinterest pin pattern)

---

## Problem Statement

Two home-page tweaks following the previous session's restructure:

1. **Hero**: user prefers upper-left card placement. Same content, same glass styling. Pure position swap.
2. **Pack cards**: user wants the *opposite* layout we just shipped. Previous: image card was the large element, text card narrower below. New: text card is the large element, image card is small + centered + floating above.

## Concerns Surfaced + Resolved

1. **Hero upper-left overlap**: corgi at ~28% from left, card max-w-md @ left-12 extends to ~34% of 1440px viewport → overlaps corgi's left side. Same glass-blur softening trade-off as the prior peeker overlap. User accepted.
2. **Pack cards pattern reversal**: not a tweak, a restructure. Surfaced honestly to user that this inverts the proportions we just shipped. User confirmed intent.

## User-Locked Decisions

- Hero: right → left swap, keep `max-w-md / lg:max-w-lg` width, keep all styling and copy
- Pack image card size: fixed `h-32 / md:h-36 / lg:h-40` (128/144/160 px square)
- Pack image style: colored badge (bg + glow + icon), smaller version of current
- Text alignment in pack text card: LEFT-aligned (decision call, not asked — consistent with site editorial style; centered image is decoration)

## Approaches Evaluated

### Hero

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Right → left swap, keep width** | Minimal diff (3 chars); identical trade-off pattern | Slight corgi overlap (acceptable) | **Chosen** |
| Swap + narrow card | Less corgi overlap | Less reading room for 70-word body | Rejected |
| Keep right | Already working | Doesn't honor user direction | Rejected |

### Pack cards image card

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Fixed h-32/36/40** | Crisp predictable proportions across breakpoints | Less responsive flexibility | **Chosen** |
| Fixed h-40/44/48 (medium) | More icon presence | Eats vertical real estate | Rejected |
| Proportional w-1/2 column | Scales with column | Inconsistent visual scale across breakpoints | Rejected |

### Pack cards image style

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Colored badge (bg + glow + icon)** | Maintains layered depth, "platform" for icon | None | **Chosen** |
| Transparent sticker (icon + drop-shadow) | Lighter, playful | Risk of detached/floaty feel | Rejected |
| Circular bg badge | "Avatar/badge" feel | Less "mini card" cohesion w/ text card | Rejected |

## Final Solution

### Hero (`components/home/full-bleed-hero.tsx`)

Single change: `md:right-12 lg:right-16` → `md:left-12 lg:left-16` on the glass card div. All other classes, props, content unchanged.

### Pack cards (`components/home/menu-cards.tsx`)

Restructure `MenuCard` to "Pinterest pin" pattern:

**Image card (top, small, centered, in normal flow w/ z-10):**
```
h-32 w-32 md:h-36 md:w-36 lg:h-40 lg:w-40
rounded-3xl shadow-cozy-md
mx-auto relative z-10
bg per card.bg
glow div (smaller: blur-2xl opacity-40) + transparent icon w/ p-3
hover: -translate-y-1 + scale-105 + shadow-cozy-lg
```

**Text card (full column width, pulled up under image):**
```
-mt-16 md:-mt-[72px] lg:-mt-20
pt-24 md:pt-28 lg:pt-32 px-6 pb-6 md:px-7 md:pb-7
rounded-3xl bg-surface shadow-cozy
hover: shadow-cozy-md
contains: h3 + copy + Explore →
```

**Coming-soon badge:** moved to outer Link wrapper top-right (z-20, above image z-10).

**Removed from previous version:**
- `aspect-square` on image card → fixed dimensions
- `objectPosition: "center 60%"` → no longer needed at small size
- Negative `mx-4` on text card → now full column width
- Image hover `-translate-y-2` → softened to `-translate-y-1`

## Implementation Considerations

**Order:**
1. Hero swap (one-line change in classNames)
2. Pack cards MenuCard restructure
3. `pnpm typecheck` + `pnpm lint`

**Risks:**
- **Z-index**: image needs `relative z-10` so its negative-margin-overlap onto text card renders ABOVE. Text card is `relative` (for absolute coming-soon badge anchor) with default z-auto. Stacking correct.
- **Auto-rows-fr + fixed image height**: outer Link wrappers stretch to match heights. Image card fixed → text card grows. Bottom whitespace in shorter cards acceptable.
- **Mobile 360px**: image 128px on ~328px content area = ~40% width, plenty of margin. Overlap math: 64px image into text card; pt-24 (96px) → 32px buffer. Safe.

## Files Touched

```
components/home/full-bleed-hero.tsx       (right → left in classNames)
components/home/menu-cards.tsx            (MenuCard structure restructure)
```

## Out of Scope

- Hero copy/styling (unchanged — position only)
- Other home sections, banner asset, navbar, footer, newsletter

## Success Criteria

- Hero glass card pinned `md:top-12 md:left-12 lg:top-16 lg:left-16` (was right)
- Pack cards: each item shows small centered image card visually "floating" above larger text card
- Image card extends ~half its height above text card top, half overlaps text card
- `pnpm typecheck` + `pnpm lint` clean
- Visual QA at 360/768/1024/1440 confirms no overlap breakage

## Next Steps

1. `/ck:plan` — phased implementation (likely 3 phases)
2. Cook against plan
3. User spot-check on dev server

## Unresolved Questions

- Text alignment in pack text card was decided unilaterally (left-aligned). If centered would be preferred, easy one-line tune.
- Whether to keep `cta-shimmer` energy across both Shop + Newsletter is unrelated; flagged previously.
