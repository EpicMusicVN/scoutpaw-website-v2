---
phase: 3
title: UI layer migration (app + components)
status: completed
priority: P2
effort: 1h
dependencies:
  - 1
---

# Phase 3: UI layer migration (app + components)

## Overview

Replace every literal `/assets/...` asset reference in `app/` and `components/` with a call to `assetUrl()`. Also wrap values consumed from content JSON (which after phase 2 are bare keys like `banner/banner.png`) with `assetUrl()` at the render site. Result: zero hardcoded asset URLs in UI code.

## Requirements

**Functional**
- Every `<Image src="/assets/...">` becomes `<Image src={assetUrl("...")}>`.
- Every default prop value like `image = "/assets/banner/banner.png"` becomes `image = assetUrl("banner/banner.png")` (or pass-through with the helper at render).
- Every `style.backgroundImage: "url('/assets/...')"` becomes `url('${assetUrl("...")}')`.
- Every content-JSON value consumed (e.g., `character.image`, `featured.videoSrc`, `featured.videoPoster`, `tile.image`) is wrapped with `assetUrl()` at the point of use.
- All affected files import `{ assetUrl }` from `@/lib/utils/asset-url`.

**Non-functional**
- No new component abstractions — direct edits per file.
- Don't refactor unrelated code.

## Architecture

### Edit pattern A — direct literal

```diff
+ import { assetUrl } from "@/lib/utils/asset-url";

- <Image src="/assets/banner/banner.png" ... />
+ <Image src={assetUrl("banner/banner.png")} ... />
```

### Edit pattern B — default prop value

```diff
- image = "/assets/banner/banner.png",
+ image = assetUrl("banner/banner.png"),
```

(Note: when default values are evaluated at function call time, `assetUrl` is invoked then — fine since both branches return a stable string for the lifetime of the render.)

### Edit pattern C — JSON-fed value at render site

After phase 2, `character.image` in the JSON is `characters/buddy.png` (no leading `/assets/`). UI passes it through helper:

```diff
- <Image src={character.image} ... />
+ <Image src={assetUrl(character.image)} ... />
```

`assetUrl()` is tolerant of accidental `/assets/` prefix in the key, so even if phase 2 left a stray, the helper normalizes it.

### Edit pattern D — CSS backgroundImage

```diff
- backgroundImage: "url('/assets/patterns/paw-tile.svg')",
+ backgroundImage: `url('${assetUrl("patterns/paw-tile.svg")}')`,
```

Switch double-quoted string → template literal so `${...}` works.

## Related Code Files

**Pages (3):**
- `app/layout.tsx`
- `app/page.tsx`
- `app/shop/page.tsx`

**Components (~15):**
- `components/home/full-bleed-hero.tsx`
- `components/home/menu-cards.tsx`
- `components/home/newsletter-cta.tsx`
- `components/home/featured-pup-spotlight.tsx`
- `components/home/character-showcase.tsx`
- `components/home/feature-banner.tsx`
- `components/home/video-grid.tsx`
- `components/home/cinematic-hero.tsx` (if it has asset refs)
- `components/home/hero-character-cluster.tsx` (if applicable)
- `components/shop/explore-products.tsx`
- `components/shop/shop-empty-state.tsx`
- `components/watch/watch-hero.tsx`
- `components/watch/watch-library.tsx`
- `components/watch/our-channels.tsx`
- `components/watch/explore-videos.tsx`
- `components/watch/featured-video.tsx`
- `components/watch/video-card.tsx`
- `components/watch/subscribe-card.tsx`
- `components/watch/video-rail.tsx`

(Final list determined by `grep` during impl — only files with `/assets/` hits actually need edits.)

## Implementation Steps

1. Confirm phase 1 is complete (`lib/utils/asset-url.ts` exists, env renamed, next.config updated).
2. Grep all files in `app/` and `components/` for `"/assets/` and `'/assets/`:
   ```bash
   grep -rln "\"/assets/\|'/assets/" app/ components/
   ```
3. For each file in the grep output:
   - Add `import { assetUrl } from "@/lib/utils/asset-url";` after existing imports.
   - Replace literals: `"/assets/<path>"` → `assetUrl("<path>")`.
   - Replace template `url('/assets/<path>')` → `url('${assetUrl("<path>")}')` (and ensure surrounding string is a backtick template literal).
   - Wrap JSON-fed asset values: `character.image` → `assetUrl(character.image)`, `featured.videoSrc` → `assetUrl(featured.videoSrc)`, `featured.videoPoster` → `assetUrl(featured.videoPoster)`, `tile.image` → `assetUrl(tile.image)`, `channel.avatar` if present, etc.
4. Verify by grep: `grep -rn "/assets/" app/ components/` should return zero hits.
5. Run `pnpm typecheck`. Halt on errors.
6. Run `pnpm lint`. Halt on new errors.

## Success Criteria

- [ ] Zero `/assets/` literal hits in `app/` and `components/`
- [ ] All files using assetUrl have the import
- [ ] JSON-fed asset values wrapped at render site
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **Some files have BOTH literal `/assets/` and JSON-fed paths** — both patterns need handling per file. Don't miss the JSON-fed cases.
- **Template-literal escape gotcha** — when converting `"url('/assets/foo')"` to `\`url('${assetUrl("foo")}')\``, ensure quotes match (single inside backticks). Standard JS template syntax; no escape needed for `'`.
- **Component prop default value that uses `assetUrl()` ** — fine at call time; runs every render. `assetUrl()` is cheap (string concat). Negligible perf.
- **`featured.videoSrc` and `featured.videoPoster` from cycle 1** — these are JSON-fed strings. After phase 2 they're bare keys. Phase 3 wraps with `assetUrl()` at the `<video src={...} poster={...}>` site in `watch-hero.tsx`.
- **OG / metadata image URLs need absolute paths** — Next's `metadataBase` combined with the helper output (which is a full HTTPS URL when env set, or relative `/assets/...` when fallback) handles this. Verify metadata renders absolute URLs in dev with env set.
