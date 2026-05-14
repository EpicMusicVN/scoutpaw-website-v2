---
phase: 3
title: Card Cleanup
status: completed
priority: P2
effort: 2h
dependencies:
  - 1
---

# Phase 3: Card Cleanup

## Overview

Three independent component-internal cleanups: (1) home `MenuCards` filtered to only the 3 live destinations (Characters / Shop / Watch), (2) home `CharacterCard` flips bottom label from breed → name and removes the hover name-pill (clean zoom-only interaction), (3) shop `ExploreProducts` reduced from 4 tiles → 2 (Plushes + Apparel — highest-volume retail categories).

## Requirements

**Functional:**
- Home menu intro shows exactly 3 cards: Meet the Pack (large), Shop (medium), Watch Together (medium)
- Home Explore Characters cards show character `name` (not `breed`) at all times below the sticker
- Hover on character card produces gentle image zoom only — no name pill slide-up, no card-level scale doubling
- Shop ExploreProducts shows exactly 2 square aspect tiles (Plushes + Apparel) centered in section
- All existing links/anchors still resolve correctly (`#meet-the-pack`, `/shop`, `/watch`, character `/characters/{slug}` routes)
- Removed-but-not-deleted definitions (Music / Make / Events / Blog cards; Prints / Accessories tiles) survive in code as filtered-out entries — easy to re-enable when data lands

**Non-functional:**
- No new tokens or new components
- No grid-math rewrites — adapt existing column-span logic to fewer items
- Preserve sticker-board rotation aesthetic on the reduced layouts

## Architecture

### Home `MenuCards` — filter array, adapt grid

Current `cards` array has 7 entries with `comingSoon` flags on 4. Strategy: filter at render to 3 live entries with explicit allow-list. Layout shifts from 7-card asymmetric to 3-card asymmetric — keep the Meet-the-Pack large card, Shop and Watch as the two medium companions.

```ts
// Filter logic
const LIVE_HREFS = new Set(["#meet-the-pack", "/shop", "/watch"]);
const visible = cards.filter((c) => LIVE_HREFS.has(c.href));
```

Grid adapts: at `md` breakpoint, large `col-span-3` + 2× medium `col-span-2` won't fill 6 cols. Switch to `md:grid-cols-5`: large `col-span-3` (60%), medium `col-span-2` × 2 stacked (40%). Or simplest — `md:grid-cols-3` with all three at `col-span-1` and slight size tweaks via `min-h-` differences.

**Recommended:** `md:grid-cols-3` flat — equal columns, large card uses `min-h-[360px]`, medium cards `min-h-[300px]`. Cleaner than asymmetric col-span gymnastics for 3 items. Mobile stays single-column.

### Home `CharacterCard` — name not breed, no hover pill

Three changes inside `components/characters/character-card.tsx`:

1. Bottom label changes:
   ```tsx
   // BEFORE (line 53)
   <p ...>{character.breed}</p>
   // AFTER
   <p ...>{character.name}</p>
   ```
   - Update the kebab-case styling? `tracking-[0.18em] uppercase` may feel too "label-y" for a name. Recommend dropping `uppercase` and reducing tracking: `tracking-[0.05em] capitalize`. Names like "Buddy", "Wallace" read more like proper nouns this way.

2. Remove the hover pill block entirely (lines 40-50 — the entire `<div aria-hidden ...>` containing the pill).

3. Tame hover motion. Current group-hover combines `-translate-y-1.5`, `scale-[1.04]` on the card AND `scale-110` on the image — three motions at once. Reduce to ONE motion: keep image `group-hover:scale-105` (was 110), drop `group-hover:scale-[1.04]` from the card. Lift translate stays (`group-hover:-translate-y-1.5`) — that's the "sticker lifting off page" tactile.

4. Update aria-label since pill is gone but label changes too:
   ```tsx
   aria-label={`Meet ${character.name}, the ${character.breed}`}
   ```
   This stays — it's already correct, just verifying.

### Shop `ExploreProducts` — 4 → 2 tiles

Strategy: reduce `TILES` array constant from 4 entries → 2 (Plushes + Apparel). Keep the other two (Prints, Accessories) commented or in a separate constant for easy re-enable.

```ts
// components/shop/explore-products.tsx
const VISIBLE_CATEGORIES: ShopCategory[] = ["plushes", "apparel"];
const TILES: Tile[] = ALL_TILES.filter((t) => VISIBLE_CATEGORIES.includes(t.category));
```

Grid adapts: `lg:grid-cols-4` → `lg:grid-cols-2` with `max-w-3xl mx-auto` to keep the 2 tiles from sprawling across full hero width. Aspect changes from `aspect-[4/5]` → `aspect-square` per user spec.

The dev-warning fallback at line 106-110 (`SHOP_CATEGORIES.length !== TILES.length`) — leave it in place. It will fire (4 categories, 2 tiles) and show a small dev-only message. That's fine — it's a reminder for re-enablement, exactly what we want.

Actually — that warning fires on PRODUCTION too, not just dev. Re-read line 106: it's an unconditional render. We need to either:
- (A) Suppress it entirely (delete the block) — cleanest, since the reduction is intentional
- (B) Gate behind `process.env.NODE_ENV === "development"`
- **(C) Recommended:** Delete it. The original purpose was "if categories grow, tiles outdate" — but here we *deliberately* show fewer than `SHOP_CATEGORIES.length`. The check no longer reflects intent.

## Related Code Files

- Modify: `components/home/menu-cards.tsx`
- Modify: `components/characters/character-card.tsx`
- Modify: `components/shop/explore-products.tsx`

No new files. No deletions.

## Implementation Steps

1. **MenuCards filter + grid adapt**
   - Open `components/home/menu-cards.tsx`
   - At line 96 (after `cards` array), add:
     ```ts
     const LIVE_HREFS = new Set(["#meet-the-pack", "/shop", "/watch"]);
     const visible = cards.filter((c) => LIVE_HREFS.has(c.href));
     ```
   - Change `cards.map(...)` (line 113) → `visible.map(...)`
   - Change grid at line 112 from `grid-cols-1 sm:grid-cols-2 md:grid-cols-6` → `grid-cols-1 md:grid-cols-3`
   - Remove the `col-span-*` ternary inside `<li>` (lines 116-122) — replace with bare `<li key={card.label}>`
   - Adjust `MenuCard` height ternary so size still varies — `lg` keeps `min-h-[360px]`, `md` keeps `min-h-[300px]`, `wide` no longer reachable but leave the case for safety
   - Verify the 3 visible cards render with their assigned `bg` colors and rotations untouched

2. **CharacterCard rewrite**
   - Open `components/characters/character-card.tsx`
   - Delete lines 40-50 entirely (the hover name-pill `<div>`)
   - Change line 53: `{character.breed}` → `{character.name}`
   - Update line 53 className: `tracking-[0.18em] uppercase` → `tracking-[0.05em]` (drop uppercase; names look weird in caps). Keep `font-display font-bold text-ink/70`. Actually — to match Phase 1 contrast pass, bump `text-ink/70` → `text-ink`. Final: `font-display text-sm md:text-base font-bold tracking-[0.05em] text-ink`
   - On the inner `<div>` at line 18, drop `group-hover:scale-[1.04]` (keep `group-hover:-translate-y-1.5` and `group-hover:shadow-cozy-xl`)
   - On the `<Image>` at line 37, change `group-hover:scale-110` → `group-hover:scale-105` (gentler zoom)

3. **ExploreProducts reduce**
   - Open `components/shop/explore-products.tsx`
   - Rename existing `TILES` constant → `ALL_TILES`
   - Add new constant:
     ```ts
     const VISIBLE_CATEGORIES: ShopCategory[] = ["plushes", "apparel"];
     const TILES: Tile[] = ALL_TILES.filter((t) =>
       VISIBLE_CATEGORIES.includes(t.category),
     );
     ```
   - Change ul grid (line 65): `grid-cols-2 gap-5 md:gap-7 lg:grid-cols-4` → `mx-auto max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8`
   - Change tile aspect (line 71): `aspect-[4/5]` → `aspect-square`
   - Delete the dev-warning block at lines 106-110 (the `SHOP_CATEGORIES.length !== TILES.length` `<p>`)

4. **Type-check**
   - `pnpm exec tsc --noEmit` — should pass

5. **Visual smoke**
   - `pnpm dev` → spot-check:
     - Home `#meet-the-pack` section: 3 cards (1 large, 2 medium), all clickable, no "Coming Soon" badges
     - Home `CharacterCard` grid: each card shows e.g. "Buddy" not "Golden Retriever"; hover does ONE thing (gentle image zoom + sticker lift)
     - Shop `#explore` section: 2 square tiles centered, descriptions readable (Phase 1 already bumped color)
   - Save screenshots to `plans/260510-2254-ui-polish-pass/visuals/phase-03-{component}.png`

6. **Cross-reference test**
   - Click each remaining MenuCard → confirms anchor or route works
   - Click character cards → confirms `/characters/{slug}` still loads
   - Click product tiles → confirms `/shop?cat=plushes#products` filter still applies
   - Click filter chips on shop → confirms Phase 1 chip color changes look right next to the new 2-tile layout

## Success Criteria

- [ ] `MenuCards` renders exactly 3 cards on home (Meet the Pack / Shop / Watch)
- [ ] `CharacterCard` shows character name as bottom label; no hover name-pill; hover = single gentle motion (image zoom + sticker lift, no card-level scale)
- [ ] `ExploreProducts` renders exactly 2 square tiles (Plushes + Apparel) centered in section
- [ ] Dev-warning `<p>` removed from `ExploreProducts` (not user-facing)
- [ ] All existing routes/anchors still resolve correctly
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] No regression in shop filter chips (Phase 1) when only 2 tiles are clickable
- [ ] Removed cards/tiles still exist as data in source — easy to re-enable

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Character names with apostrophes ("D'Artagnan") break layout | Names are constrained by `text-sm md:text-base` + parent `text-center` — apostrophe doesn't wrap. Verify by reading character data: `lib/content/characters.json` or similar |
| Long names overflow card width on mobile | Add `truncate` or `line-clamp-1` to the name `<p>` if any character name is >12 chars |
| `MenuCards` `col-span` removal breaks the wide-card variant for future re-enablement | Keep the conditional `col-span` logic in source but commented; or extract `cardSizeClass()` helper for clean re-enable. Recommend: keep current ternary but add `as const` typing — minimal change |
| Removed dev-warning was actually load-bearing for QA visibility | It was a string, not a system check. QA will catch tile-count drift via the visual review. Safe to delete |
| User overrides default tile choice (Plushes + Apparel) | The `VISIBLE_CATEGORIES` constant is one line — trivial swap. Surface this in the implementation handoff |

## Security Considerations

None. Pure presentational filtering of static data.

## Dependencies

Phase 1 must merge first (chip color + description text changes referenced visually).

## Unresolved Questions

- Confirm with user: default 2 product categories are **Plushes + Apparel**. Override before exec if needed.
- Whether to surface "Coming Soon" badge logic to the filtered-out menu cards as a future stub. Out-of-scope this phase.
