---
phase: 3
title: Shop ExploreProducts editorial refactor
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 3: Shop ExploreProducts editorial refactor

## Overview

Refactor `ExploreProducts` tiles from "sticker tile with bottom-overlaid text panel" to editorial layout: image card on top (retains the playful `tile.rotate` and hover-untilt), text card directly below as a separate panel. Products become fully visible; the playful character is preserved on the image only.

## Requirements

**Functional**
- Each tile renders as a single clickable `<Link>` wrapping two stacked cards.
- Top card: square aspect, full-bleed image with `object-contain`, retains tilt at rest, untilts on hover.
- Bottom card: separate panel below image with category title, copy, `Shop →` affordance.
- Whole composition is one click target → preserves current navigation behavior.
- Grid still 2-column on sm+, single-column on mobile.

**Non-functional**
- Reuse existing tokens (`bg-surface`, `shadow-cozy`, `rounded-2rem`, `rounded-2xl`).
- No new design tokens, no new components.
- Focus ring on outer Link wrapper.

## Architecture

`components/shop/explore-products.tsx` — tile block at lines 73-108 is the only thing that changes. The `TILES` array, `VISIBLE_CATEGORIES` filter, `header`, and `<ul>` grid wrapper stay untouched.

**Layout transformation:**

| Element | Current | New |
|---------|---------|-----|
| `<Link>` | wraps single tile, image fills tile, text overlay absolute-positioned bottom | wraps two stacked cards |
| Image card | inside Link, `aspect-square overflow-hidden rounded-[2rem] shadow-cozy`, `tile.rotate` on whole tile | top of Link, `aspect-square rounded-[2rem] shadow-cozy`, `tile.rotate` retained, hover untilt |
| Text panel | absolute overlay (`absolute inset-x-3 bottom-3 rounded-2xl bg-surface/95`) | separate sibling card below image (`mt-5 rounded-2xl bg-surface shadow-cozy`) |
| Hover | rotate-0 + lift + scale image | rotate-0 on image card only; both cards lift slightly via group-hover |

**Pseudo:**

```jsx
<li key={tile.category}>
  <Link
    href={`/shop?cat=${tile.category}#products`}
    data-cat={tile.category}
    aria-label={`Browse ${categoryLabel(tile.category)}`}
    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
  >
    {/* Top: image card with tilt */}
    <div
      className={`relative aspect-square overflow-hidden rounded-[2rem] shadow-cozy transition-all duration-300 ease-gentle ${tile.rotate} group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
      style={{ backgroundColor: tile.bg }}
    >
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

    {/* Bottom: text card */}
    <div className="relative mt-5 rounded-2xl bg-surface p-5 shadow-cozy transition-shadow duration-300 group-hover:shadow-cozy-md md:p-6">
      <h3 className="font-display text-xl font-bold text-ink md:text-2xl">
        {categoryLabel(tile.category)}
      </h3>
      <p className="mt-1 text-sm text-warm-text md:text-base">{tile.copy}</p>
      <span className="mt-2 inline-flex items-center gap-1 font-display text-sm font-semibold text-brand-gold">
        Shop
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </span>
    </div>
  </Link>
</li>
```

## Related Code Files

- Modify: `components/shop/explore-products.tsx` (tile `<li>` block at lines 73-108)

## Implementation Steps

1. In `components/shop/explore-products.tsx`, replace the `<li>` body (lines 74-107) with the pseudo above.
2. Move `focus-visible:*` classes from inner Link to outer Link wrapper (already on Link; ensure they stay there).
3. Increase image padding from `p-4 md:p-6` → `p-6 md:p-8` so the larger image area visually centers product better without overlay clutter.
4. Confirm `tile.rotate` (e.g., `-rotate-2`, `rotate-2`) lives on the image card div, not the Link wrapper — this keeps text card straight for readability.
5. Run `pnpm typecheck`.
6. Boot dev server, navigate to `/shop`, scroll to "Find Your Pup's Favourite":
   - Image card tilts at rest, untilts + lifts on hover.
   - Text card stays straight, lifts subtly with shadow on hover.
   - Products centered, no overlay covering them.
   - 2-col grid on md+, 1-col on mobile.
   - Whole tile (image + text) navigates on click.

## Success Criteria

- [ ] Each tile: image card on top, text card below (no overlay)
- [ ] Image card retains tile-level rotate, untilts on hover
- [ ] Text card stays level, full readability, lifts subtly on hover
- [ ] Single `<Link>` wraps both — full composition clickable
- [ ] `aria-label` + `data-cat` attributes preserved
- [ ] Focus ring visible on tab navigation
- [ ] Products fully visible, no clipping
- [ ] 2-col grid on sm+, 1-col on mobile
- [ ] `pnpm typecheck` clean

## Risk Assessment

- **Vertical rhythm feels "boxy"** — two-card stack may feel less playful than the sticker overlay. Mitigated by retaining tilt on image card. If feel is lost, try `mt-4` instead of `mt-5`, or add a slight negative margin (`-mt-3`) so text card peeks under image card.
- **Tile total height grows** — editorial layout is ~30% taller than current overlay. Verify grid still feels balanced; section padding (`py-24 md:py-32`) should comfortably absorb.
- **Image-only rotation breaks hit target** — the Link wrapper isn't rotated, but the visual image is. Click target should still be correct because Link is rectangular and large. Verify on touch devices.
- **Image padding increase shrinks subject** — `p-6 md:p-8` gives the product more breathing room but if subjects look tiny on mobile, revert to `p-4 md:p-6`.
