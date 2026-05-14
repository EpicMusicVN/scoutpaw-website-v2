# Brainstorm — Hero + Cards + Shop Layout Polish

**Date:** 2026-05-14 22:43 (Asia/Saigon)
**Scope:** Home Hero copy/layout, Home menu cards image swap, Shop Hero layout, Shop "Find Your Pup's Favourite" tile refactor.
**Status:** Design agreed — awaiting plan decision.

---

## 1. Problem Statement

Visual review surfaced four concrete issues:

1. **Home Hero title** — drop trailing `: Scoutpaw TV` so the headline reads cleanly.
2. **Hero text card** (shared component, used by Home + Shop) — currently vertically centered, overlaps the Corgi (Home) and the merch collage (Shop). Character faces / products must remain the focal point.
3. **Home "Step into the pack's world" cards** — images need to be swapped to the new assets in `assets/card/`.
4. **Shop "Find Your Pup's Favourite" tiles** — current overlay text panel covers ~1/3 of each product image. Move to editorial (image-first, text-below) layout.

Final visual goal: cinematic, spacious, emotionally warm, premium — characters/products always visible.

---

## 2. Current State (verified)

| Area | File | Behavior |
|------|------|----------|
| Home Hero | `app/page.tsx:16` | Title hard-coded with `: Scoutpaw TV` suffix |
| Hero component | `components/home/full-bleed-hero.tsx:87-93` | Desktop overlay: vertically centered (`items-center`), `max-w-md`, on left fade |
| Hero image position | `full-bleed-hero.tsx:66` | `objectPosition: "70% 50%"` |
| Menu cards | `components/home/menu-cards.tsx:27-50` | 3 cards with image-on-colored-bg + text card overlap; visible: Characters, Shop, Watch |
| Shop Hero | `app/shop/page.tsx:18-29` | Same `FullBleedHero` component |
| Shop tiles | `components/shop/explore-products.tsx:78-105` | Square tile, image fills tile, text panel absolutely positioned at bottom 1/3 |

Both Hero pages use the **same component** → single source of truth for Hero refactor.

---

## 3. Decisions Locked

| Question | Choice |
|----------|--------|
| Card images | **Set A** — `characters.png` (duck plush), `shop.png` (balls), `watch.png` (paw bed). Note: see §6 risks. |
| Hero text layout | **Tighter card, bottom-left anchor.** `max-w-sm`, `items-end`, bottom padding. |
| Shop tile layout | **Editorial — image on top, text card below.** |
| Hero refactor scope | **Single change** — same layout for Home + Shop. |
| Characters card bg | **`var(--bg-soft-sky)`** — replaces `#fffbe6` to prevent yellow-duck blending. |
| Set A PNG transparency | **Assumed transparent** — verify at implementation; halt swap if any image has solid bg. |

---

## 4. Final Design

### 4.1 Home Hero title

`app/page.tsx:16`:

```
title="Discover a happier world of puppies"
```

(Remove `: Scoutpaw TV` suffix only. Kicker `SCOUTPAW TV` already lives above the title and preserves brand reference.)

### 4.2 FullBleedHero — bottom-left anchor

Refactor `components/home/full-bleed-hero.tsx` desktop overlay block (lines 87-93):

**Changes:**
- `items-center` → `items-end` (vertical alignment to bottom).
- Wrapper adds `pb-10 lg:pb-16` so card lifts off the banner edge.
- Inner card: `max-w-md` → `max-w-sm lg:max-w-md` (narrower default, allow growth on lg).
- Strengthen left fade: extend `w-2/5` left fade with a second small **bottom-up** gradient localized to the bottom-left quadrant for the card backdrop (`from-paper/60` bottom-up, only on md+). This avoids dimming the whole image.
- Image `objectPosition` shift: keep `70% 50%` baseline — verify the Corgi clears the new card region; if not, bump to `75% 45%` (pushes scene right + slightly up).

**Pseudo:**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-end md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pb-10 lg:pb-16">
    <div className="max-w-sm rounded-2xl border border-ink/10 bg-white/85 px-6 py-5 shadow-cozy backdrop-blur-md lg:max-w-md lg:px-7 lg:py-6">
      <CardBody />
    </div>
  </div>
</div>
```

**Mobile (md-): unchanged.** Card already in-flow below banner.

### 4.3 MenuCards — Set A image swap

`components/home/menu-cards.tsx` — no markup changes; only swap card metadata:

- `characters.png` (yellow duck) → cream bg `#fffbe6` causes a **yellow-on-yellow blend**. Recommend bg adjustment: `var(--bg-soft-sky)` or `var(--bg-peach)` so the duck reads as a distinct silhouette.
- `shop.png` (multicolor balls) → keep peach bg, balls have enough internal contrast.
- `watch.png` (pink paw bed) → warm-tan bg works; verify accent glow doesn't clash. If tone clashes, switch accent glow to `var(--bg-blush)`.

The image card uses `object-contain p-3` (line 125) — Set A images are upright/centered, so no cropping issues expected. Set A images have transparent or solid black backgrounds:
- Duck: white/transparent — clean.
- Balls: pure black bg in PNG — **MUST verify**. If non-transparent, will show as black square inside the colored card. Action: confirm PNG transparency before swap; if black, request re-export or apply CSS `mix-blend-mode: multiply` / `mix-blend-mode: lighten` as fallback (suboptimal).
- Watch (paw bed): white bg in PNG — same concern. Verify transparency.

**Hover/scaling/aspect:** existing component handles via `object-contain`, `h-40 w-40` fixed square. No changes needed.

### 4.4 Shop Hero

Inherits §4.2 changes automatically (shared component). The merch collage in `assets/shop/banner.png` is centered → bottom-left card pulls clear of products.

### 4.5 Shop ExploreProducts — editorial refactor

Rewrite `components/shop/explore-products.tsx` tile block (lines 73-108):

**New structure per tile** (one `<li>`, single Link):
- Image card: `aspect-square` (or 4/5 if more breathing room is wanted), full image visible, sticker rotation `${tile.rotate}` retained on the image card (image-tile alone tilts), `hover:rotate-0 hover:-translate-y-2`.
- Text card: separate card directly below the image with `mt-4` (or `-mt-4` overlap if a subtle layered look is preferred). `bg-surface`, `rounded-2xl`, `shadow-cozy`, internal padding `p-5 md:p-6`. Contains category title, copy, `Shop →` link affordance.
- Wrap both in a single anchor `<Link>` so the whole composition is clickable; hover state lifts both subtly.

**Why retain image rotation:** keeps ScoutPaw playfulness (sticker aesthetic) while clearing products. Text card stays straight for readability.

**Pseudo:**

```jsx
<Link href={...} className="group block">
  <div className={`aspect-square rounded-[2rem] shadow-cozy ${tile.rotate} transition-all duration-300 ease-gentle group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
       style={{ backgroundColor: tile.bg }}>
    <Image fill className="object-contain object-center p-6 transition-transform duration-500 group-hover:scale-105" .../>
  </div>
  <div className="relative mt-5 rounded-2xl bg-surface p-5 shadow-cozy md:p-6">
    <h3>{categoryLabel(tile.category)}</h3>
    <p>{tile.copy}</p>
    <span>Shop →</span>
  </div>
</Link>
```

Grid wrapper unchanged (`grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8`).

---

## 5. Implementation Notes

### Files touched (exhaustive)

1. `app/page.tsx` — line 16 title edit.
2. `components/home/full-bleed-hero.tsx` — lines 66 (maybe), 87-93 (overlay block) + add bottom-up gradient div near lines 68-77.
3. `components/home/menu-cards.tsx` — lines 27-50 image paths (+ optional bg/glow tweaks).
4. `components/shop/explore-products.tsx` — lines 72-109 tile markup rewrite.

### Out of scope (verified, do not touch)

- Mobile-only Hero card (already in-flow, not overlapping).
- Cloud dividers, scroll reveals, NewsletterCTA.
- AboutShop, ProductGrid, ProductCard.
- Watch page Hero.

### Token efficiency

All four changes fit in a single phase. No new components needed; no new dependencies; no design tokens added. Pure markup + asset reference changes.

---

## 6. Risks / Concerns

1. **Set A images may have non-transparent backgrounds** — `shop.png` shows a black backdrop when previewed alone. If not transparent, swap will be visually broken. **Mitigation:** verify PNG alpha before merge; if opaque, request re-export with transparency.
2. **Yellow duck for "Characters" card** — semantically weak (duck ≠ character). Set B `characters_bg.png` (cartoon puppy) is a clearer match. Flagging as observation; deferring to user's choice.
3. **Hero bottom-left card may collide with the page below** — `pb-10` reserves clearance; verify on lg viewport that the card doesn't sit on the CloudDivider seam. Tune `pb-16` if seam visible.
4. **Image `objectPosition` adjustment is empirical** — bottom-left card may still nick the Corgi at narrow desktop widths (md). Need visual verification post-implementation; fallback is bumping to `75% 45%` or shrinking card to `max-w-xs` at md and growing at lg.
5. **Editorial tile loses some "stacked sticker" feel** — text card no longer overlaps image. Mitigated by retaining image rotation. If feel is lost, can add `-mt-4` overlap on text card (text card pulled up under image bottom).

---

## 7. Success Criteria

- Home Hero title reads `Discover a happier world of puppies` (no suffix).
- Corgi face on Home banner + every product on Shop banner are unobstructed by text card on md/lg/xl viewports.
- All three menu card images load from `assets/card/` Set A and render without black backdrop artifacts.
- Shop tiles show products fully visible in upper image card; text sits cleanly below in its own card.
- Mobile (≤md): Hero text card still in-flow below banner; tile grid stacks vertically with readable text.
- No regressions: hover states, focus rings, cloud dividers, scroll reveals all functional.

---

## 8. Validation Plan

1. Run dev server (`pnpm dev`), inspect `/` and `/shop` at: mobile (375), md (768), lg (1024), xl (1440), max (1600+).
2. Confirm Corgi face clearance on Home banner at every breakpoint.
3. Confirm product visibility on Shop banner and on each tile.
4. Confirm card image quality (no black backdrop, no distortion, centered).
5. Tab through hero CTAs + tile links — focus rings intact.
6. Run `pnpm typecheck` + `pnpm lint` post-change.

---

## 9. Open Questions

_All resolved at brainstorm close:_
- Characters card bg → `var(--bg-soft-sky)`.
- Set A transparency → assumed clean; verify at implementation, halt swap if opaque bg found.

---

## 10. Next Steps

- Decision: run `/ck:plan` to convert this into a phased implementation plan, or hand directly to a single-pass implementation.
- After implementation: visual QA at 4 viewports + `/ck:code-review`.
