# Brainstorm — Glass Hero + Paw Cards + Unified Shop Tiles

**Date:** 2026-05-14 23:21 (Asia/Saigon)
**Scope:** Iteration 2 on Home + Shop UI. Replaces bottom-left hero anchor (just shipped) with top-left glass card. Adds per-card paw-print patterns to Home menu cards. Unifies Shop tiles from two sibling cards into one connected container.
**Status:** Design agreed — awaiting plan decision.
**Prior iteration:** `plans/reports/brainstorm-260514-2243-hero-cards-shop-layout-polish.md` (bottom-left + editorial Shop tiles — shipped, now being replaced/extended).

---

## 1. Problem Statement

User reviewed shipped iteration 1 and is redirecting three pieces:

1. **Hero text card** — bottom-left position not desired. Move to **top-left** with **glass styling** (frosted, semi-transparent, blurred backdrop).
2. **Home menu cards** — add **per-card paw-print background pattern**. Keep existing section-level scattered decor.
3. **Shop "Find Your Pup's Favourite"** — current two-sibling-cards stack feels disconnected. Refactor to **one unified card container** (image area + text area within a single visual unit).

Card-image swap from iteration 1 stays (already shipped; user reaffirmed requirement).

---

## 2. Current State (post-iteration 1)

| Area | File | Current state |
|------|------|---------------|
| Hero card | `components/home/full-bleed-hero.tsx:95-99` | `items-end` (bottom), `max-w-sm lg:max-w-md`, `bg-white/85`, `backdrop-blur-md` |
| Hero left fade | `full-bleed-hero.tsx:69-77` | Left horizontal fade + new bottom-up fade (added iter 1) |
| Menu cards image card | `components/home/menu-cards.tsx:111-128` | Square color block hosting transparent PNG, no inner pattern |
| Section decor | `menu-cards.tsx:63-73` | 6 scattered DecorPaw/DecorBone/DecorBall at 10% opacity |
| Shop tiles | `components/shop/explore-products.tsx:72-110` | Two sibling cards stacked: image card (`rounded-[2rem]`) + text card (`mt-5 rounded-2xl bg-surface`) |

---

## 3. Decisions Locked

| Question | Choice |
|----------|--------|
| Hero anchor | **Top-left, tucked under navbar** — `items-start`, `pt-12 lg:pt-16` |
| Glass depth | **Frosted** — `bg-white/45`, `backdrop-blur-xl`, `border-white/40`, `shadow-cozy` |
| Card pattern | **Per-card SVG tile pattern** (repeating paw), **section decor stays** |
| Shop tile unity | **Single unified container** — image area + text area inside one `bg-surface rounded-[2rem] shadow-cozy` card |
| Card images | Already swapped to Set A in iteration 1 — **no change** |

---

## 4. Final Design

### 4.1 FullBleedHero — top-left glass card

Refactor desktop overlay in `components/home/full-bleed-hero.tsx`:

**Changes from current (iter 1):**

| Aspect | Iter 1 (current) | Iter 2 (new) |
|--------|------------------|--------------|
| Vertical anchor | `items-end` | `items-start` |
| Wrapper padding | `pb-10 lg:pb-16` | `pt-12 lg:pt-16` |
| Card max-width | `max-w-sm lg:max-w-md` | `max-w-sm lg:max-w-md` (keep) |
| Background | `bg-white/85` | `bg-white/45` |
| Blur | `backdrop-blur-md` | `backdrop-blur-xl` |
| Border | `border-ink/10` | `border-white/40` |
| Shadow | `shadow-cozy` | `shadow-cozy` (keep) |
| Padding | `px-6 py-5 lg:px-7 lg:py-6` | `px-6 py-5 lg:px-7 lg:py-6` (keep) |

**Pseudo:**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
    <div className="max-w-sm rounded-2xl border border-white/40 bg-white/45 px-6 py-5 shadow-cozy backdrop-blur-xl lg:max-w-md lg:px-7 lg:py-6">
      <CardBody />
    </div>
  </div>
</div>
```

**Bottom-up gradient (added iter 1):** REMOVE. It was a backdrop for the bottom-anchored card; no longer needed. Keep the original left horizontal fade (`w-2/5 from-paper`).

**Text color considerations:** card body uses `text-ink` + `text-warm-text`. With `bg-white/45`, the text needs to stay legible. Ink is dark, so contrast against semi-white glass should be fine. If the banner image bleeds dark colors through the glass and reduces contrast, can add a subtle internal text shadow or bump bg to `bg-white/55`.

### 4.2 Menu cards — per-card paw-print pattern

Add a repeating paw-print SVG background to each image card (the square color block at `menu-cards.tsx:111-128`).

**Strategy:** Inline SVG data URI as Tailwind `bg-[url(...)]` utility, set as a sibling absolute layer behind the image so it doesn't interfere with `object-contain` positioning. Use existing `DecorPaw` SVG shape encoded as a tiny SVG with low opacity.

**Pseudo:**

```jsx
<div
  className="relative z-10 mx-auto h-40 w-40 overflow-hidden rounded-3xl shadow-cozy-md ..."
  style={{ background: card.bg }}
>
  {/* NEW: paw-print tile pattern layer */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 opacity-[0.12]"
    style={{
      backgroundImage: "url('/assets/patterns/paw-tile.svg')",
      backgroundSize: "48px 48px",
      backgroundRepeat: "repeat",
    }}
  />
  {/* existing accent glow + Image stay below */}
  <div aria-hidden="true" className="... blur-2xl" style={{ backgroundColor: card.accentGlow }} />
  <Image ... />
</div>
```

**Asset:** Create `public/assets/patterns/paw-tile.svg` — a single paw silhouette (reuse `DecorPaw` shape) centered in a 48×48 viewBox, `fill="currentColor"` won't work in `background-image` so use a hardcoded `fill="#2b1d10"` (matches `text-warm-text` / `--ink` family). Pattern repeat at 48px gives ~3 paws per 144px image card.

**Why SVG file (not inline data URI):** maintainability + caching. Inline data URIs balloon `className` strings and re-fetch per render. A file at `public/assets/patterns/paw-tile.svg` is HTTP-cached and trivial to swap later.

**Why opacity 12%:** higher than section-level decor (10%) so the in-card pattern reads, but still subtle. May need tuning visually.

**Section decor:** unchanged. Two layers will coexist — section-level at 10% scattered, card-level at 12% repeating. Acceptable per user choice.

### 4.3 Shop ExploreProducts — unified card

Refactor `components/shop/explore-products.tsx` tile block (post-iter-1: lines ~72-110). Replace the two-sibling-cards stack with a single unified `<div>` inside the `<Link>`.

**Structure:**

```jsx
<Link
  href={`/shop?cat=${tile.category}#products`}
  data-cat={tile.category}
  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
  aria-label={`Browse ${categoryLabel(tile.category)}`}
>
  {/* Single unified card — whole thing rotates as one unit */}
  <div
    className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-300 ease-gentle ${tile.rotate} group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
  >
    {/* Image area — colored bg, square aspect */}
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

    {/* Text area — same card, bg-surface, no gap */}
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
```

**Key shifts from iter 1:**
- Outer `<div>` now wraps both areas → one rounded card with one shadow.
- `tile.rotate` moves from image-card-only → whole-card.
- Removed `mt-5` gap and the separate text-card shadow (text area now sits flush below image area inside the same card).
- Grid gap can revert from iter 1's `gap-8 md:gap-10` back to `gap-6 md:gap-8` since rows now feel tighter visually (taller-but-unified > stacked).
- Image area still has its tile bg color; text area uses `bg-surface` from parent card. Sharp edge transition at the seam (image-bg to surface-bg) is intentional — it's an editorial composition cue, not a flaw.

---

## 5. Implementation Notes

### Files touched (exhaustive)

1. `components/home/full-bleed-hero.tsx` — desktop overlay (top-left + glass), remove bottom-up gradient added iter 1.
2. `components/home/menu-cards.tsx` — add paw-pattern layer inside image card; no other changes.
3. `components/shop/explore-products.tsx` — rewrite tile block to single-container layout.
4. `public/assets/patterns/paw-tile.svg` — NEW asset.

### New asset spec

`public/assets/patterns/paw-tile.svg`:
- 48×48 viewBox
- Single paw silhouette (reuse `DecorPaw` ellipse cluster shape)
- Hardcoded `fill="#2b1d10"` (ink/warm-text family)
- Centered, ~60% of viewBox

### Out of scope

- Watch page hero (not touched).
- Mobile in-flow card path (unchanged).
- AboutShop, ProductGrid, NewsletterCTA, dividers.
- Card image swap (already done in iter 1).

---

## 6. Risks / Concerns

1. **Top-left glass card may collide with upside-down dogs at banner top** — looking at the banner image, the upside-down dogs cluster center-top. Left side is mostly clouds/sky. Top-left placement should be clean, but `pt-12 lg:pt-16` is a starting estimate; may need bump to `pt-20`.
2. **Glass contrast over busy banner regions** — Shop banner has busy merch collage; left side has a corgi + duck plush. Top-left glass card on Shop may still sit over a corgi face. **Mitigation:** Shop banner's left side may need `objectPosition` tweak to push merch slightly right, OR accept that some background showing through the glass card is the intended cinematic effect.
3. **Glass readability over varied backgrounds** — `bg-white/45` is light. If text reads poorly over dark regions of the banner, fallback to `bg-white/55` or `bg-white/60`. Won't compromise glass aesthetic significantly.
4. **Per-card paw pattern fights with the image subject** — duck (yellow), balls (multicolor), paw-bed (pink) sit on top via `object-contain`. The pattern layer is BEHIND the image at 12% opacity. Should not conflict, but if the duck's transparent margins reveal too much pattern, tune opacity down to 8%.
5. **Two paw layers may feel "doggy overload"** — section decor (10% scattered) + card decor (12% repeating). Both intentional per choice. Visual judgment call after first render — may want to drop section opacity to 6% to give card pattern the spotlight.
6. **Connected card seam (image bg → surface bg) reads abrupt** — sharp color change at the seam between image area and text area. This is intentional editorial style but if it feels jarring, can soften with a `border-t border-ink/5` divider or a 6px gradient transition.
7. **Whole-card rotation may amplify hit-target offset on touch devices** — but the outer Link is rectangular (unrotated) and hosts the click handler. Rotated child visual ≠ rotated hit area. Safe.

---

## 7. Success Criteria

- Home hero text card sits top-left under navbar, frosted-glass styled, Corgi face fully visible.
- Shop hero text card same treatment; products visible.
- All three menu cards show a subtle repeating paw pattern behind the product image, plus the existing scattered section decor.
- Shop "Find Your Pup's Favourite" tiles render as ONE unified card per category (image area on top + text area below, single shadow, single rounded border).
- No regressions: mobile path unchanged, focus rings intact, hover states work.
- `pnpm typecheck` + `pnpm lint` clean.

---

## 8. Open Questions

_None — all decisions locked in pre-design questionnaire._

---

## 9. Next Steps

- Decision: run `/ck:plan` to convert into phased plan, or direct single-pass implementation.
- After implementation: visual QA at 4 viewports + spot-check glass contrast on Shop banner specifically.
