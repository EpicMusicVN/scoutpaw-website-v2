# Brainstorm — Hover Polish + No-CTA Hero

**Date:** 2026-05-14 23:41 (Asia/Saigon)
**Scope:** Iteration 3 on Home + Shop UI. Remove Hero CTAs both pages, unify Home menu card hover behavior, fix Shop tile hover layout instability.
**Status:** Design agreed — awaiting plan decision.
**Prior iterations:**
- `plans/reports/brainstorm-260514-2243-hero-cards-shop-layout-polish.md` (iter-1, shipped)
- `plans/reports/brainstorm-260514-2321-glass-hero-paw-cards-unified-tiles.md` (iter-2, shipped)

---

## 1. Problem Statement

User reviewed shipped iter-2 and is requesting four interaction polish items:

1. **Home Hero** — remove the `Watch Now` + `Meet the Pack` buttons. Hero should feel cinematic, focused on artwork/messaging.
2. **Home menu cards** — current hover affects image, text card, and pill separately with mismatched timings (300ms / 300ms / 200ms). Feels disconnected. User wants the whole card to move as one cohesive unit.
3. **Shop Hero** — remove the `Explore Collections` button.
4. **Shop "Find Your Pup's Favourite"** — hover causes layout shift / "text block becomes larger." Root cause: `group-hover:rotate-0` un-tilts the card, changing its visual bounding box. User wants stable layout dimensions.

---

## 2. Current State (post-iter-2)

| Area | File | Current state |
|------|------|---------------|
| Hero CardBody | `full-bleed-hero.tsx:28-52` | Has `<div className="mt-6 flex flex-wrap gap-3">{actions ?? (default <Button>s)}</div>` |
| Home Hero call | `app/page.tsx:14-18` | No `actions` prop → uses defaults (Watch Now + Meet the Pack) |
| Shop Hero call | `app/shop/page.tsx:18-29` | Passes `actions={<Button>Explore Collections</Button>}` |
| MenuCard image card | `menu-cards.tsx:111-114` | `transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg` |
| MenuCard text card | `menu-cards.tsx:143` | `transition-shadow duration-300 group-hover:shadow-cozy-md` |
| MenuCard pill | `menu-cards.tsx:147` | `transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md` |
| MenuCard outer Link | `menu-cards.tsx:159` | `group relative flex h-full flex-col` (no transform) |
| Shop tile card | `explore-products.tsx` unified card | `transition-all duration-300 ease-gentle ${tile.rotate} group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl` |
| Shop tile image | `explore-products.tsx` inner image | `transition-transform duration-500 ease-out group-hover:scale-105` |

---

## 3. Decisions Locked

| Question | Choice |
|----------|--------|
| Shop tile hover fix | **Keep tilt at rest, drop `group-hover:rotate-0`** — only translate + shadow animate. Layout stable. |
| Menu card hover unification | **Synchronize timings + add outer-Link lift** — all transitions match (`duration-500 ease-gentle`); outer Link gets subtle `group-hover:-translate-y-1`. Two-card design preserved. |
| Hero CTA removal | **Remove `actions` prop + default block entirely** — clean API, KISS. |

---

## 4. Final Design

### 4.1 FullBleedHero — remove CTAs

**Changes** (`components/home/full-bleed-hero.tsx`):

1. Remove `actions?: React.ReactNode` from props interface.
2. Remove `actions` destructured arg.
3. Inside `CardBody`, delete the entire `<div className="mt-6 flex flex-wrap gap-3">{actions ?? (...)}</div>` block.
4. Remove the `Button` import if it's no longer used elsewhere in this file.

**Pseudo (final CardBody):**

```jsx
const CardBody = () => (
  <>
    <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">{kicker}</p>
    <h1 className="mt-3 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl xl:text-[3.5rem]">{title}</h1>
    <p className="mt-4 text-base leading-relaxed text-warm-text lg:text-lg">{description}</p>
  </>
);
```

**Caller cleanup:**
- `app/page.tsx` — no change (didn't pass `actions`).
- `app/shop/page.tsx` — remove the `actions={<Button href="#explore" ...>Explore Collections</Button>}` prop. Remove the `Button` import if unused elsewhere in this file.

**Spacing rebalance:** The `mt-4` margin on the description paragraph already provides bottom breathing room. The glass card's `py-5 lg:py-6` padding still gives the card balanced top/bottom space. No additional padding tweaks needed; the card will simply be more compact, which matches the cinematic intent.

### 4.2 MenuCard hover unification

**Strategy:** match all hover transitions to the same easing curve (`ease-gentle`, a custom Tailwind token already in use) and same duration (`duration-500`). Add a subtle whole-composition lift to the outer Link wrapper so the card breathes upward as ONE unit. Differential motion magnitudes preserved (image lifts more than text) but tempo is synchronized.

**Changes** (`components/home/menu-cards.tsx`):

| Element | Current | New |
|---------|---------|-----|
| Outer Link wrapper (line 144 / 159) | `group relative flex h-full flex-col` | `group relative flex h-full flex-col transition-transform duration-500 ease-gentle group-hover:-translate-y-1` ❌ wait — that's wrong, group-hover doesn't work on the group itself. Use `hover:` instead. Final: `group relative flex h-full flex-col transition-transform duration-500 ease-gentle hover:-translate-y-1` |
| Image card | `transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg` | `transition-all duration-500 ease-gentle group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-cozy-lg` (bumped to -2 so it still lifts MORE than the wrapper's -1) |
| Text card | `transition-shadow duration-300 group-hover:shadow-cozy-md` | `transition-all duration-500 ease-gentle group-hover:shadow-cozy-md` |
| Pill | `transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md` | `transition-all duration-500 ease-gentle group-hover:-translate-y-0.5 group-hover:shadow-md` |

**Net behavior on hover:**
- Whole card lifts `-translate-y-1` smoothly over 500ms (outer wrapper).
- Image card lifts an ADDITIONAL `-translate-y-2` over 500ms (combined: -3px relative to start).
- Image card scales 105% over 500ms.
- Text card's shadow deepens to `shadow-cozy-md` over 500ms.
- Pill shifts up `-translate-y-0.5` and shadow grows over 500ms.
- All transitions share `ease-gentle` curve → motion reads cohesive.

**Note on `comingSoon` cards:** they use `<div role="link">` wrapper (line 148-157), not a `<Link>`. Apply the same `transition-transform duration-500 ease-gentle hover:-translate-y-1` to that wrapper too — keeps disabled state visually consistent at rest, no lift on hover (or maintain lift if user wants the disabled cards to still feel responsive). **Decision:** keep them static at hover since they're disabled. The wrapper just keeps the transition class but without `hover:-translate-y-1`. Actually — simpler: only apply the hover lift to live Link cards. The disabled wrapper stays static.

Actually the cleanest implementation: define `wrapperClass` (line 144) with the synchronized transition + hover lift. Both the Link AND the role="link" div use this class. Disabled cards still get the visual hover affordance — which is honestly fine because hover on disabled cards is rare and the subtle 1px lift won't confuse users.

**Final wrapperClass:**
```
"group relative flex h-full flex-col transition-transform duration-500 ease-gentle hover:-translate-y-1"
```

### 4.3 Shop tile — drop un-tilt on hover

**Strategy:** keep `tile.rotate` at rest (preserves sticker identity), remove `group-hover:rotate-0` (so card stays tilted on hover). Only `group-hover:-translate-y-2` and `group-hover:shadow-cozy-xl` fire. No rotation transition = no apparent text/layout shift.

**Changes** (`components/shop/explore-products.tsx`):

```diff
- className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-300 ease-gentle ${tile.rotate} group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
+ className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-500 ease-gentle ${tile.rotate} group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
```

Also bump `duration-300` → `duration-500` to match the new home-page tempo for cohesion across the site.

**Inner image:** keep as-is (`transition-transform duration-500 ease-out group-hover:scale-105`). Already 500ms; ease-out vs ease-gentle is a minor curve difference but acceptable since the image is a nested element with its own motion personality. Optional: change inner image `ease-out` → `ease-gentle` for full site-wide consistency. **Decision:** change for consistency. Minimal cost.

### 4.4 Cross-cutting timing/easing baseline

After this iteration, all card-level hover transitions across the site use:
- **Duration:** `duration-500` (500ms)
- **Easing:** `ease-gentle`

This becomes the implicit "hover tempo" of the design system. Any new card-style component should follow this baseline.

---

## 5. Implementation Notes

### Files touched (exhaustive)

1. `components/home/full-bleed-hero.tsx` — remove `actions` prop, default block, possibly Button import.
2. `app/shop/page.tsx` — remove `actions={...}` prop on `<FullBleedHero>`, possibly Button import.
3. `components/home/menu-cards.tsx` — synchronize hover transitions on outer wrapper, image card, text card, pill.
4. `components/shop/explore-products.tsx` — drop `group-hover:rotate-0`, bump duration to 500ms, optional inner image easing.

### Verification: no other consumers of `actions` prop

`FullBleedHero` is used only by `app/page.tsx` and `app/shop/page.tsx`. Removing the prop is safe.

### Out of scope

- Watch page.
- Mobile in-flow card path (CardBody refactor will benefit it automatically — no buttons there either now).
- AboutShop, ProductGrid, NewsletterCTA.
- Any structural refactor to cards.
- Any animation library introduction.

---

## 6. Risks / Concerns

1. **Outer-Link `hover:-translate-y-1` AND image card's `group-hover:-translate-y-2` stack** — combined lift = 3px. Visual judgment: should feel "floating," not "leaping." If too much, drop image card to `-translate-y-1` (combined 2px).
2. **`hover:` on the outer Link only fires when cursor enters the Link's visual bounds** — the Link wraps both the image card and text card in a flex column, so the bounding box covers everything. Fine.
3. **`ease-gentle` token availability** — already used in Shop tile (iter-2), so it exists in `tailwind.config.ts`. Verify before merge.
4. **`role="link"` disabled card wrapper gets hover lift** — minor UX inconsistency. Acceptable since disabled cards rarely receive hover. If user objects, branch the wrapperClass.
5. **Shop tile stays tilted on hover** — design departure from iter-2's un-tilt behavior. User explicitly requested this for layout stability; documenting as intended change.
6. **Hero looks "incomplete" without CTAs** — possible if the kicker + title + description don't feel substantial on their own. Mitigation: hero artwork should pull weight. If user pushes back, can re-add a single subtle CTA later — easy to revert.
7. **Pill `View All` is now slower (200ms → 500ms)** — risk: feels sluggish on its own. But since it's now synchronized with parent card motion, the perceived speed is the COMPOSITION speed, not the pill speed. Should feel natural.

---

## 7. Success Criteria

- Home hero renders with kicker + title + description only (no buttons).
- Shop hero same.
- Home menu cards: hovering any card lifts the whole composition cohesively, all elements moving in sync.
- Shop tiles: hover lifts + shadow grows; card stays tilted; no layout shift / no apparent text scaling.
- `pnpm typecheck` + `pnpm lint` clean.

---

## 8. Open Questions

_None — all decisions locked._

---

## 9. Next Steps

- Decision: run `/ck:plan` to convert into phased plan, or direct single-pass implementation.
- After implementation: visual QA at 4 viewports + interaction smoothness check.
