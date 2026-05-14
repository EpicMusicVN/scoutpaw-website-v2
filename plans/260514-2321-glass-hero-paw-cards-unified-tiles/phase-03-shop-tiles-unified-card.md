---
phase: 3
title: Shop tiles unified card
status: completed
priority: P2
effort: 45m
dependencies: []
---

# Phase 3: Shop tiles unified card

## Overview

Refactor `ExploreProducts` tiles from iter-1's two-sibling-cards stack (image card + separate text card with `mt-5`) into ONE unified card container. Image area and text area become two regions inside a single rounded card with one shadow, one border, one tilt unit. Whole-card rotation + hover-untilt.

## Requirements

**Functional**
- Each tile is ONE visual card: image area on top (colored bg, square aspect) + text area below (bg-surface, flush, no gap).
- Whole card retains `tile.rotate` at rest, untilts + lifts on hover.
- Whole composition is one click target via outer `<Link>`.
- 2-column grid on sm+, 1-column on mobile.

**Non-functional**
- Reuse existing tokens (`bg-surface`, `shadow-cozy`, `rounded-[2rem]`, `tile.rotate`).
- No new design tokens, no new components.
- Focus ring on outer Link wrapper.

## Architecture

`components/shop/explore-products.tsx` — tile block (post-iter-1 lines ~73-110). Replace the two-cards-stacked structure with one unified `<div>` inside `<Link>`.

**Layout transformation:**

| Element | Iter-1 (current) | Iter-2 (new) |
|---------|------------------|--------------|
| `<Link>` wraps | two siblings (image card + text card) | one unified card |
| Card container | none (siblings inside Link) | single `<div>` with bg-surface, rounded-[2rem], shadow-cozy |
| Tilt | image card only (`${tile.rotate}` on image div) | whole unified card |
| Hover lift | applied to image card | applied to whole card |
| Image area | `aspect-square rounded-[2rem] shadow-cozy` standalone | nested div with `aspect-square` + tile bg color, NO own shadow/radius (parent owns) |
| Text area | separate `mt-5 rounded-2xl bg-surface shadow-cozy` | nested div with `p-5 md:p-6`, NO own shadow/radius/bg (parent owns) |
| Grid gap | `gap-8 md:gap-10` | `gap-6 md:gap-8` (revert to pre-iter-1) |

**Pseudo (final state):**

```jsx
<li key={tile.category}>
  <Link
    href={`/shop?cat=${tile.category}#products`}
    data-cat={tile.category}
    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper rounded-[2rem]"
    aria-label={`Browse ${categoryLabel(tile.category)}`}
  >
    {/* Single unified card */}
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-300 ease-gentle ${tile.rotate} group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
    >
      {/* Image area (top) */}
      <div className="relative aspect-square" style={{ backgroundColor: tile.bg }}>
        <div className="absolute inset-0 p-6 md:p-8">
          <Image
            src={tile.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Text area (bottom, flush) */}
      <div className="p-5 md:p-6">
        <h3 className="font-display text-xl font-bold text-ink md:text-2xl">
          {categoryLabel(tile.category)}
        </h3>
        <p className="mt-1 text-sm text-warm-text md:text-base">{tile.copy}</p>
        <span className="mt-2 inline-flex items-center gap-1 font-display text-sm font-semibold text-brand-gold">
          Shop
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </div>
  </Link>
</li>
```

**Key shifts:**
- `overflow-hidden` on the outer unified card so the image area's tile bg doesn't bleed past the rounded corners.
- `focus-visible:ring-offset-4` on the rounded Link wrapper for keyboard nav.
- Image area still has its tile bg color; text area inherits `bg-surface` from the parent card.
- Sharp visual seam between image bg color and text bg surface is intentional editorial composition.

## Related Code Files

- Modify: `components/shop/explore-products.tsx` (tile `<li>` block + grid gap)

## Implementation Steps

1. In `components/shop/explore-products.tsx`, replace the `<li>` body (current iter-1 lines ~73-110) with the pseudo above.
2. Change grid container `gap-8 md:gap-10` → `gap-6 md:gap-8`.
3. Confirm `focus-visible:*` classes live on the outer Link (they do).
4. Run `pnpm typecheck`. Halt on errors.
5. Boot dev server, navigate to `/shop`, scroll to "Find Your Pup's Favourite":
   - Each tile renders as ONE rounded card.
   - Image area shows colored bg + centered product.
   - Text area sits flush below image area, same card.
   - At rest: card tilts at `tile.rotate`.
   - On hover: card untilts + lifts + shadow grows + image scales.
   - 2-col on sm+, 1-col on mobile.
6. If the seam between image bg and surface bg feels too abrupt, add `border-t border-ink/5` to the text area div.

## Success Criteria

- [ ] Each tile is ONE rounded card with image area + text area inside
- [ ] Whole card rotates at rest, untilts on hover
- [ ] Hover lift + shadow grow + image scale all work
- [ ] `aria-label`, `data-cat`, focus ring preserved
- [ ] 2-col on sm+, 1-col on mobile
- [ ] Grid gap reverted to `gap-6 md:gap-8`
- [ ] `pnpm typecheck` clean
- [ ] No console errors

## Risk Assessment

- **Seam between image area and text area feels jarring** — sharp color transition at the seam (tile.bg → bg-surface). Mitigation: `border-t border-ink/5` divider on text area or a 6px gradient transition. Visual judgment.
- **Whole-card rotation looks heavier than image-only rotation** — bigger element rotating is more visually intense. Per design intent (more cohesive unit). If feels too heavy, can reduce rotation magnitude (e.g., change `-rotate-2` → `-rotate-1` in the tile data — but that's a data-level change outside this phase).
- **`overflow-hidden` clips focus ring** — Tailwind focus-visible ring lives on the outer Link wrapper, not the unified card div. Outer Link has `rounded-[2rem]` so the ring traces the card edge correctly. Verify in keyboard nav.
- **Click on text area doesn't navigate** — both areas are inside the same Link, so any click bubbles to the Link. Verify especially on touch.
- **Tile height balance across the row** — image area is fixed-aspect (square), text area sized by copy length. If "plushes" and "apparel" copies differ in height, the row may look uneven. Mitigation: `<ul>` already uses `grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8`; CSS grid auto-aligns rows (siblings in same row get the taller height). Acceptable.
