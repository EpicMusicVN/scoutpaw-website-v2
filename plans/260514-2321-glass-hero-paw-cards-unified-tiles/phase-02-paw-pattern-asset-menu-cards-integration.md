---
phase: 2
title: Paw-pattern asset + menu cards integration
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 2: Paw-pattern asset + menu cards integration

## Overview

Create a reusable repeating paw-print SVG asset and integrate it as a subtle background pattern layer inside each Home menu card (Characters, Shop, Watch). The pattern sits BEHIND the existing accent glow and product image so card subjects stay visually dominant. Section-level scattered decor is left untouched (per user decision — both layers coexist).

## Requirements

**Functional**
- New asset `public/assets/patterns/paw-tile.svg` — single centered paw silhouette in a 48×48 viewBox, fill="#2b1d10" (ink family).
- Each menu card (Characters, Shop, Watch) renders a repeating paw pattern at ~12% opacity behind the product image.
- Pattern is decorative only (aria-hidden, pointer-events-none).
- Section-level scattered decor (DecorPaw/DecorBone/DecorBall) remains unchanged.
- Card images, hover effects, accent glow, focus rings — all unchanged.

**Non-functional**
- No new components, no new design tokens.
- Reuse the existing DecorPaw shape (paw silhouette built from one ellipse + four toe ellipses).
- Use `<svg>` file (cached, swappable), NOT inline data URI in className.

## Architecture

### Asset

`public/assets/patterns/paw-tile.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="#2b1d10">
  <ellipse cx="24" cy="30" rx="9" ry="7.5"/>
  <ellipse cx="11" cy="18" rx="3.5" ry="4.5"/>
  <ellipse cx="19" cy="13" rx="3.5" ry="4.5"/>
  <ellipse cx="29" cy="13" rx="3.5" ry="4.5"/>
  <ellipse cx="37" cy="18" rx="3.5" ry="4.5"/>
</svg>
```

48×48 viewBox is the tile unit. The paw silhouette occupies ~60% of the tile, leaving negative space for `background-repeat: repeat` to render cleanly.

### Component change

`components/home/menu-cards.tsx` — `MenuCard` component's image card div (current lines ~111-128). Add a new aria-hidden pattern layer BEFORE the accent glow div, AFTER the card-bg color is set.

**Pseudo (current → new):**

```jsx
<div
  className="relative z-10 mx-auto h-40 w-40 overflow-hidden rounded-3xl shadow-cozy-md transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg md:h-44 md:w-44 lg:h-48 lg:w-48"
  style={{ background: card.bg }}
>
  {/* NEW: paw-print tile pattern layer — sits behind accent glow + image */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 opacity-[0.12]"
    style={{
      backgroundImage: "url('/assets/patterns/paw-tile.svg')",
      backgroundSize: "48px 48px",
      backgroundRepeat: "repeat",
    }}
  />
  {/* existing: accent glow */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-1/4 top-1/4 h-1/2 rounded-full opacity-40 blur-2xl"
    style={{ backgroundColor: card.accentGlow }}
  />
  <Image ... />
</div>
```

### Why opacity 12%

- Section-level decor uses 10% on `text-warm-text`. Card-level is 12% which is just-perceptible against varying card backgrounds (soft-sky, peach, warm-tan).
- The hardcoded fill `#2b1d10` is the ink/warm-text color family; same visual weight on all three card bgs.

## Related Code Files

- Create: `public/assets/patterns/paw-tile.svg`
- Modify: `components/home/menu-cards.tsx` (`MenuCard` component, image card div internals)

## Implementation Steps

1. Create `public/assets/patterns/paw-tile.svg` with the SVG markup above.
2. In `components/home/menu-cards.tsx`, locate the image card div inside `MenuCard` (the div with `className="relative z-10 mx-auto h-40 w-40 overflow-hidden ..."`).
3. Insert the new pattern layer div as the FIRST child of that image card div (before the accent glow div).
4. Run `pnpm typecheck`. Halt on errors.
5. Boot dev server, navigate to `/`, scroll to "Step into the pack's world":
   - All three cards show subtle paw pattern behind the product image.
   - Pattern is visible but not distracting — product images still dominate.
   - Hover/scale on image card still works (pattern scales with parent).
   - Section-level scattered decor still visible behind/around cards.
6. If two paw layers feel busy (section + card), drop section opacity from `opacity-[0.10]` → `opacity-[0.06]` (one-line change at `menu-cards.tsx:65`).
7. If pattern is too prominent on lighter cards (Characters soft-sky bg), drop card pattern opacity from `0.12` → `0.08`.

## Success Criteria

- [ ] `public/assets/patterns/paw-tile.svg` exists, renders correctly when opened in a browser
- [ ] All three menu cards render the repeating paw pattern behind their image
- [ ] Pattern is subtle (~12% opacity), product images remain dominant
- [ ] Hover effects, accent glow, focus rings still work
- [ ] Section-level decor unchanged
- [ ] `pnpm typecheck` clean
- [ ] No console errors on `/`

## Risk Assessment

- **Pattern fills the whole card uniformly** — looks "rubber stamp"-y; not playful. Mitigation: this is a deliberate design choice; if user dislikes, can shift to randomized scattered DecorPaw instances per card (more dev effort, more visual variety).
- **48px tile too dense at small card size (160px)** — that's ~3.3 paws per row. If feels busy, bump tile to 64px (2.5 per row).
- **Two paw layers feel like overload** — mitigation listed (drop section opacity to 6%).
- **Pattern shows through transparent regions of card image** — e.g., duck has transparent margins. Pattern visible there is the intended effect (background showing through). Not a bug.
- **SVG path scaling on retina** — `background-size: 48px 48px` is CSS px; SVG scales crisply because it's vector. No issue.
