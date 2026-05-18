# Brainstorm: Website Content & Asset Refresh

**Date:** 2026-05-18 06:45
**Branch:** main
**Status:** Design approved, ready for /ck:plan

---

## Problem Statement

Refresh home + shop pages with new copy, new imagery, and corrected character data. Five distinct changes across 4 files + 1 JSON data file, plus an operational CDN cache purge. Surface a pre-existing data inconsistency in `content/characters.json` (slug/name shuffle for max ↔ buddy).

## Requirements

### Home Page
1. **MenuCards** — strip colored card backdrop behind each icon (keep rounded floating box, transparent fill).
2. **FeaturedPupSpotlight** — show a Golden Retriever for "Max" by fixing swapped character data.
3. **FeatureBanner ("Shop the Pack")** — point to new `shop/promotion.jpg` (already uploaded to R2).

### Shop Page
4. **ExploreProducts** — replace tile titles + copy for `plushes` and `apparel` (visible labels only; category slugs/routing untouched). Update section subtitle to match.
5. **Cache refresh** — purge R2/CDN cache for `shop/1.png`, `shop/2.png`, `shop/banner.png`, `shop/promotion.jpg`. Verify no stale Next.js image cache or browser cache pinning.

---

## Evaluated Approaches

### 1. MenuCards background removal

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Strip colored fill, keep rounded box | Preserves float/lift hover + two-card overlap silhouette | Minor — none | ✅ Chosen |
| Strip box entirely | More minimal | Flattens signature design; loses hover affordance | ✗ |
| Process source PNGs via RMBG | Cleans up artwork at source | Card PNGs already transparent; misreads intent | ✗ |

### 2. Max identity fix

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Fix character data in JSON | Resolves swap globally, future-proof | Touches data layer (low risk — only spotlight references max today) | ✅ Chosen |
| Patch spotlight component to read slug "buddy" | Smallest code diff | Leaves data swap; future readers confused | ✗ |
| Swap image path only | Quickest hack | Breeds rot — name/slug/breed remain wrong | ✗ |

### 3. Promotion image

`shop/promotion.jpg` already in R2. One-line code change in `app/page.tsx`. No alternatives worth weighing.

### 4. Shop tile labels

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Tile-only override (add `title?` field) | Zero blast radius; routing/filter logic untouched | Slight divergence between visible label and slug | ✅ Chosen |
| Rename CATEGORY_LABELS globally | Single source of truth | Affects every future surface using categoryLabel() — over-reach for tile copy refresh | ✗ |
| Introduce new category slugs | Cleanest data model | Requires re-tagging products + filter logic; YAGNI for now | ✗ |

### 5. Cache strategy

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Purge R2/CDN cache | No code change; granular | Depends on Cloudflare access; can recur | ✅ Chosen |
| Version query param | Bulletproof per-file bust | Needs version-bump mechanism; ongoing maintenance | Deferred |
| Rename files w/ suffix | Bulletproof | Pollutes filenames; tedious for many files | ✗ |

---

## Recommended Solution

### File-by-file plan

**A. `components/home/menu-cards.tsx`**
- Remove `bg`, `accentGlow` fields from `Card` type.
- In `MenuCard`:
  - Remove `style={{ background: card.bg }}` from the floating image card div. Keep all other classes (rounded, shadow, hover transitions).
  - Delete the paw-tile pattern overlay `<div>` and the radial accent-glow `<div>`.
- Verify three `allCards` entries still type-check after dropping `bg`/`accentGlow`.

**B. `content/characters.json`** — swap contents of slug `"max"` and slug `"buddy"`:
- `slug: "max"` → `name: "Max"`, `breed: "Golden Retriever"`, `image: "characters/golden-2.png"`, `accentColor: "#FFB627"`, bio + funFacts from current "buddy" entry, `order: 2` preserved.
- `slug: "buddy"` → `name: "Buddy"`, `breed: "Husky"`, `image: "characters/husky-bg.png"`, `accentColor: "#5BC0EB"`, bio + funFacts from current "max" entry, `order: 1` preserved.
- Bios reference dog-specific traits — swap them with the slug to keep narrative integrity (Golden = "first to the door"; Husky = "Welcome Wag-on").
- No code changes needed; `featured-pup-spotlight.tsx` already reads slug "max".

**C. `app/page.tsx`** — change line 49:
```diff
- image={assetUrl("shop/promotion.png")}
+ image={assetUrl("shop/promotion.jpg")}
```

**D. `components/shop/explore-products.tsx`**
- Add `title?: string` to `Tile` type.
- Update `plushes` tile: `title: "Dog Calming & Essentials Collection"`, `copy: "Shop our curated collection for pet anxiety, comfort, and wellness. Free your pup from stress today!"`.
- Update `apparel` tile: `title: "Dog owner gifts"`, `copy: "Keep your pup close to your heart with essentials designed to celebrate your unbreakable bond."`.
- In render: `<h3>{tile.title ?? categoryLabel(tile.category)}</h3>`.
- Update `aria-label` to also prefer `tile.title` so screen readers get the new label.
- Update section subtitle to: "Curated picks for the whole pack — calming essentials for pups + gifts for the humans who love them."

**E. Cache purge (operational, run after deploy)**
1. Cloudflare dashboard → Caching → Purge Cache → Custom Purge by URL:
   - `<R2_BASE>/assets/shop/1.png`
   - `<R2_BASE>/assets/shop/2.png`
   - `<R2_BASE>/assets/shop/banner.png`
   - `<R2_BASE>/assets/shop/promotion.jpg`
   - `<R2_BASE>/assets/shop/promotion.png` (purge old too if still referenced anywhere)
2. Verify with `curl -I <url>` → expect `cf-cache-status: MISS` (first hit) then `HIT` on subsequent.
3. Hard-reload shop page + home page; DevTools Network → confirm 200 (fresh) not 304 (revalidated stale).
4. Audit R2 object Cache-Control headers — if `immutable`, browser cache will hold past purge; recommend changing to `public, max-age=300, s-maxage=86400` or similar so future swaps invalidate naturally.

---

## Implementation Considerations & Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Character data swap breaks `/characters/[slug]` pages | Low | Only references are by slug; slugs preserved. Visit `/characters/max` and `/characters/buddy` post-change to verify. |
| Removing card backdrop changes visual hierarchy | Low | Hover lift + drop-shadow + text card remain; designed-in. Eyeball check post-build. |
| Old `promotion.png` still cached at CDN | Low | Purge it explicitly even though no longer referenced. |
| `next/image` cache holds stale upstream | Low-Med | next/image revalidates per Cache-Control. If sticky, force a deploy to clear runtime image cache. |
| Subtitle change loses brand voice match | Low | Copy provided is consistent in tone; if user dislikes, swap is one-line. |

---

## Out of Scope (flagged)

- **Other character slug/name swaps** (`bella`/`oscar`/`rocky` show the same Caesar-shift pattern as max/buddy). Same root cause; user didn't request. Note in changelog as known data oddity.
- **Long-term cache invalidation strategy** (versioned filenames or query-param hashing). Recurring asset swaps suggest this is worth revisiting, but YAGNI for now.
- **MenuCards copy review** post-background-removal — visual flatten may make copy stand out more; check if it still reads right after design changes.

---

## Success Criteria

1. Home page renders: 3 MenuCards with no colored backdrop behind icons; FeaturedPupSpotlight shows the Golden Retriever artwork with copy "Say hi to Max"; FeatureBanner shows new `promotion.jpg`.
2. Shop page renders: ExploreProducts tiles show "Dog Calming & Essentials Collection" + "Dog owner gifts" as titles; new section subtitle aligns; routing to `/shop?cat=plushes` and `?cat=apparel` still works.
3. `pnpm build` passes typecheck.
4. CDN purge verified via `cf-cache-status: MISS` then `HIT`; hard-reload shows fresh images.
5. `/characters/max` page resolves to Golden Retriever data; `/characters/buddy` resolves to Husky data.

---

## Next Steps

- Create implementation plan via `/ck:plan` with this report as context.
- Suggested plan phases: (1) JSON data swap, (2) component edits (menu-cards, explore-products, app/page.tsx), (3) build verify, (4) deploy + CDN purge, (5) post-deploy visual smoke test.

## Unresolved Questions

- None at design time. Confirm character bio swap is acceptable when implementing (bios reference dog-specific traits and should travel with the slug, not stay frozen).
