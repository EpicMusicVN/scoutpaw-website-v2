# Brainstorm — Hero Center-Left + Larger Image Cards + Decorative Section

**Date:** 2026-05-13
**Status:** Approved, ready for `/ck:plan`
**Scope:** Three coordinated home-page refinements (2 files):
1. Hero — vertically anchor card to upper-30% (top-third visual center) + strict true-stack on mobile
2. Pack cards — image card upsize (medium bump, h-40/44/48) + force exact equal text-card heights via flex
3. Step Into the Pack section — add 6 scattered SVG decorations (paw / bone / ball) at ~10% opacity behind cards

---

## Problem Statement

User wants the home page to feel "playful, modern, layered, cinematic, premium, dog-themed". Three coordinated tweaks on top of the prior plan (260513-0054):
- Hero card position moves to upper-center (was upper-left top-12) for cinematic balance
- Pack image cards bigger; all text cards visually identical size
- Section gets dog-themed decorative pattern

## Concerns Surfaced + Resolved

1. **"Vertically centered" interpretation**: literal center puts card bottom at 76% of viewport — too low. User confirmed top-third visual center (canonical cinematic position). Translates to `md:top-24 lg:top-32`.
2. **Pack image "half size of text card"**: user said image should be LARGER but only roughly half text-card size. Picked medium bump (h-40/44/48 = 160/176/192 px) — bigger than current, still smaller than text card.
3. **"All text cards exact same size"**: `auto-rows-fr` already equalizes outer Link wrapper heights. To make TEXT CARD interiors identical, add `flex-1` to text card inside a `flex-col` Link wrapper. Text cards then stretch to fill.
4. **Decoration "subtle" requirement**: rejected tiled-pattern approach (kids-party-flyer risk). Curated scattered SVGs at 10% opacity is the premium move.

## User-Locked Decisions

- Hero desktop position: top-third visual center via `md:top-24 lg:top-32`
- Hero mobile: strict true-stack — drop `-mt-8`, replace with `mt-8` (32px gap)
- Pack image size: medium bump `h-40/md:h-44/lg:h-48` (160/176/192 px)
- Decorations: 6 inline SVG icons (paw/bone/ball) scattered, 10% opacity, `text-warm-text` currentColor

## Approaches Evaluated

### Hero centering

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Top-third visual center** | Cinematic poster position; well-anchored | None | **Chosen** |
| True vertical center | Mathematically centered | Reads as 'floating low'; weak hero anchor | Rejected |
| Slight shift from current | Minimal change | Doesn't honor "centered" direction | Rejected |

### Pack image size

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Medium bump h-40/44/48** | Larger than current; still smaller than text card; honors "approximately half" | None | **Chosen** |
| Larger h-44/48/52 | More image presence | Closer to old layout we just moved away from | Rejected |
| Big h-48/52/60 | Image becomes equal partner | Defeats Pinterest pin pattern | Rejected |

### Decorations

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Curated scattered SVGs** | Hand-crafted premium feel; controlled density; no tiling | More code per icon | **Chosen** |
| Tiled SVG pattern | Cheap; scales infinitely | "Kids party flyer" risk | Rejected |
| Skip | Defer | Leaves section flat | Rejected |

## Final Solution

### Hero (`components/home/full-bleed-hero.tsx`)

Class diff on glass card:
```diff
- relative mx-4 -mt-8 max-w-md ... md:absolute md:left-12 md:top-12 ... lg:left-16 lg:top-16
+ relative mx-4 mt-8 max-w-md ... md:absolute md:left-12 md:top-24 ... lg:left-16 lg:top-32
```

Everything else identical.

### Pack cards (`components/home/menu-cards.tsx`)

**Image card:** `h-32 w-32 → h-40 w-40 / md:h-36 → md:h-44 / lg:h-40 → lg:h-48`

**Wrapper:** `"group relative block h-full"` → `"group relative flex h-full flex-col"`

**Text card:**
- Add `flex flex-1 flex-col` for height-fill
- Update overlap: `-mt-16/md:-mt-[72px]/lg:-mt-20` → `-mt-20/md:-mt-[88px]/lg:-mt-24`
- Update top padding: `pt-24/md:pt-28/lg:pt-32` → `pt-28/md:pt-32/lg:pt-36`

Math verified: each breakpoint leaves 32-48 px gap between image bottom and text content.

### Decorations (`components/home/menu-cards.tsx`)

Section gets `relative overflow-hidden` and a new decoration layer:

```tsx
<div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.10] text-warm-text">
  <DecorPaw className="absolute left-[5%] top-[8%] h-10 w-10 -rotate-12" />
  <DecorBone className="absolute right-[8%] top-[14%] h-12 w-12 rotate-[18deg]" />
  <DecorBall className="absolute left-[10%] top-[48%] h-8 w-8 rotate-[8deg]" />
  <DecorPaw className="absolute right-[6%] top-[52%] h-9 w-9 -rotate-[20deg]" />
  <DecorBone className="absolute left-[8%] bottom-[12%] h-10 w-10 -rotate-[8deg]" />
  <DecorPaw className="absolute right-[14%] bottom-[10%] h-12 w-12 rotate-[12deg]" />
</div>
```

Three inline SVG components added at file bottom: `DecorPaw`, `DecorBone`, `DecorBall`. ~30 lines total.

## Implementation Considerations

**Order:**
1. Hero changes (full-bleed-hero.tsx)
2. Pack cards size + flex restructure (menu-cards.tsx MenuCard function)
3. Section decorations (menu-cards.tsx MenuCards section wrapper + 3 SVG components)
4. `pnpm typecheck` + `pnpm lint`

**Risks:**
- Hero card vertical at md exactly (768px wide, 1024px tall): card top at 96px + ~450px height = bottom at 546px = 53% of viewport. OK.
- Mobile 32px gap between banner and card might feel too separated. Mitigation: drop to mt-4 (16px) if visual QA says so.
- Image card at h-48 lg (192px) inside ~400px column = 48% of column width. Stays smaller than text card.
- Decorations on narrow mobile: `overflow-hidden` clips out-of-bounds icons; % positions scale.
- Ball icon's white stroke at 10% opacity over cream bg — might be invisible. Use stroke-currentColor instead.

## Files Touched

```
components/home/full-bleed-hero.tsx       (hero position + mobile stack)
components/home/menu-cards.tsx            (image upsize + text flex-1 + section decorations + 3 SVG components)
```

## Out of Scope

- Hero copy/styling unchanged
- Pack cards section header h2/intro unchanged
- Other home sections, banner asset, navbar, footer

## Success Criteria

- Hero card visually anchored at upper-third on md+
- Hero mobile: clean stack with gap below banner, no overlay
- Pack image cards visibly larger (~25% bigger than prior round)
- All 3 text cards exact same height + width + padding across the row
- Section bg shows 6 subtle dog-themed decorations behind cards
- `pnpm typecheck` + `pnpm lint` clean

## Next Steps

1. `/ck:plan` — phased plan (likely 3-4 phases)
2. Cook against plan
3. User spot-check on dev server

## Unresolved Questions

- Ball icon stroke color (white vs currentColor) — defer to QA.
- Decoration density (6 icons) might be too sparse or too crowded depending on viewport. Adjustable via positions array.
- Hero mobile gap (32px) — may want to reduce to 16px after seeing it.
