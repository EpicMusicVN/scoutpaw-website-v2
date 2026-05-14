# Brainstorm — R2 Asset Migration (Centralized Asset URL Helper)

**Date:** 2026-05-15 01:12 (Asia/Saigon)
**Scope:** Migrate all asset references from local `/assets/...` paths to Cloudflare R2 via a centralized helper. Bucket already populated (`images.scoutpaw.tv` custom domain).
**Status:** Design agreed — awaiting plan decision.

This is a NEW cycle, parallel to the deferred cycles 2-5 (responsive audit, SEO audit, fixes, YouTube API). It can run before or after them — independent.

---

## 1. Problem Statement

Local assets currently live in `public/assets/*` (54 MB, 35 files across 8 subdirs). Components reference them via hardcoded paths like `/assets/banner/banner.png`. Goal: route all images through Cloudflare R2 via a single `assetUrl()` helper, fed by environment configuration. No hardcoded R2 URLs. Local fallback when env is missing (dev convenience). Bucket already populated by user.

**Inventory:**
- 75 `/assets/...` references across 21 files (components, pages, content JSON, lib).
- R2 provisioned: bucket `scoutpaw`, custom domain `images.scoutpaw.tv`, S3 API keys in `.env` (gitignored ✓).
- Next.js Image `remotePatterns` currently allows cdn.shopify.com + i.ytimg.com + img.youtube.com — needs `images.scoutpaw.tv` added.

---

## 2. Current State

| File | Asset usage |
|------|-------------|
| `components/home/full-bleed-hero.tsx` | default `image = "/assets/banner/banner.png"` |
| `components/home/menu-cards.tsx` | per-card `image` paths + paw pattern SVG `/assets/patterns/paw-tile.svg` |
| `components/home/featured-pup-spotlight.tsx`, character-showcase, newsletter-cta, feature-banner, etc. | character images, banner promotion |
| `components/shop/explore-products.tsx`, shop-empty-state | tile images, plush bg |
| `components/watch/*` (8 files) | thumbnails, character flank poses, video poster, hero video src |
| `app/page.tsx`, `app/shop/page.tsx`, `app/layout.tsx` | OG/metadata images, banner overrides |
| `content/*.json` (characters, playlists, site-config, videos) | string asset paths in data |
| `lib/content/schemas.ts` | default asset path fallback in Zod default |
| `lib/shopify/mock-products.ts` | mock product image paths |

**Env state:**
- `.env` has `R2_PUBLIC_URL=https://images.scoutpaw.tv/` — server-only (no `NEXT_PUBLIC_` prefix → invisible to client bundle).
- `.env.local.example` MISSING R2 vars (drift).

---

## 3. Decisions Locked

| Question | Choice |
|----------|--------|
| R2 bucket | **Already populated by user** — no upload phase needed |
| JSON value format | **Shortened keys** — `banner/banner.png`, NOT `/assets/banner/banner.png` |
| Fallback | **Local `/assets/<key>`** when `NEXT_PUBLIC_R2_BASE_URL` empty |
| Local public/assets/ | **Keep** for dev fallback |
| Env var name | **Rename `R2_PUBLIC_URL` → `NEXT_PUBLIC_R2_BASE_URL`** (client-accessible) |

---

## 4. Final Design

### 4.1 Env var rename + new helper

**`.env`** — rename `R2_PUBLIC_URL` → `NEXT_PUBLIC_R2_BASE_URL`. Keep S3 access keys server-only (no rename) since they're for backend usage only.

**`.env.local.example`** — add `NEXT_PUBLIC_R2_BASE_URL=https://images.scoutpaw.tv/` line (commented or empty placeholder) so devs know it exists.

**`lib/utils/asset-url.ts`** (NEW file):

```ts
// Single source of truth for asset URL resolution. All component/JSON asset
// references go through this helper. When NEXT_PUBLIC_R2_BASE_URL is set,
// resolves to the R2 CDN. Otherwise falls back to local /public/assets/ so
// developers without R2 env access can still run the site.
const BASE_URL = process.env.NEXT_PUBLIC_R2_BASE_URL?.replace(/\/+$/, "") ?? "";

export function assetUrl(key: string): string {
  // Tolerate accidental leading slash or "/assets/" prefix in callers/data.
  // Normalizes to a bare key, then prepends base URL or /assets/ fallback.
  const k = key.replace(/^\/+/, "").replace(/^assets\//, "");
  return BASE_URL ? `${BASE_URL}/${k}` : `/assets/${k}`;
}
```

**Rationale:**
- Trim trailing slash from base URL → predictable concat.
- Tolerant input → `assetUrl('banner/banner.png')`, `assetUrl('/assets/banner/banner.png')`, `assetUrl('/banner/banner.png')` all work. Lenient on input, strict on output.
- No throw on empty key — caller responsibility.
- Pure function, no side effects, easy to unit test if desired.

### 4.2 Next.js remote pattern

**`next.config.ts`** — add `images.scoutpaw.tv` to `remotePatterns`. Since the domain is stable, hardcode it (not env-derived) to keep config simple and predictable. If user changes the R2 domain later, they update env + config in lockstep.

```diff
  remotePatterns: [
    { protocol: "https", hostname: "cdn.shopify.com" },
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "img.youtube.com" },
+   { protocol: "https", hostname: "images.scoutpaw.tv" },
  ],
```

### 4.3 Migration — content JSON files

Migrate `/assets/<path>` → `<path>` in:
- `content/characters.json`
- `content/playlists.json`
- `content/site-config.json`
- `content/videos.json` (includes the `videoSrc`/`videoPoster` from cycle 1)
- `content/coming-soon.json` (if it has asset paths — verify during impl)

**Approach:** sed-style global replace per file: `"/assets/` → `"`. Each value goes from `"/assets/banner/banner.png"` → `"banner/banner.png"`. Strings inside `description` or unrelated keys are untouched (the leading `"/assets/` pattern is unique to asset path values).

### 4.4 Migration — component + page .tsx files

For each of the 15 components + 3 pages: replace literal `"/assets/<path>"` with `assetUrl("<path>")`.

**Pattern (example for menu-cards.tsx):**

```diff
- image: "/assets/card/characters.png",
+ image: assetUrl("card/characters.png"),
```

Or in JSX:

```diff
- <Image src="/assets/banner/banner.png" ... />
+ <Image src={assetUrl("banner/banner.png")} ... />
```

For inline `style={{ backgroundImage: "url('/assets/patterns/paw-tile.svg')" }}` — wrap with helper:

```diff
- backgroundImage: "url('/assets/patterns/paw-tile.svg')",
+ backgroundImage: `url('${assetUrl("patterns/paw-tile.svg")}')`,
```

Add `import { assetUrl } from "@/lib/utils/asset-url"` per file.

### 4.5 Migration — lib files

- `lib/content/schemas.ts` — search for `/assets/...` default values (e.g., `thumbnail` fallback). Replace with `assetUrl("...")` or, if the schema can't import at top level due to circular deps, store the bare key and resolve at call site.
- `lib/shopify/mock-products.ts` — same pattern: replace literals with helper calls.

### 4.6 `<Image>` consumer behavior

When `assetUrl()` returns a full HTTPS URL (R2), Next's `<Image>` uses its optimization service to fetch + serve responsive variants. The `images.scoutpaw.tv` hostname in `remotePatterns` allows this. When `assetUrl()` returns `/assets/...` (fallback), Next serves from `public/assets/` directly.

Both paths render correctly. The `sizes` / `priority` / `fill` props are unchanged.

### 4.7 SVG patterns (mask backgrounds)

`backgroundImage: "url('/assets/patterns/paw-tile.svg')"` becomes `url('${assetUrl("patterns/paw-tile.svg")}')`. R2 serves SVG correctly with appropriate content-type. CSS background-image is not affected by Next Image optimization (raw URL).

### 4.8 OG / metadata images

`app/layout.tsx` and per-page metadata may reference `/assets/...` for OG images. Update via `assetUrl()`. The `metadataBase` URL combined with `assetUrl()` output will produce absolute URLs needed for OG tags.

---

## 5. Implementation Notes

### Files touched (exhaustive)

**NEW:**
- `lib/utils/asset-url.ts` — helper

**Config:**
- `.env` — rename `R2_PUBLIC_URL` → `NEXT_PUBLIC_R2_BASE_URL`
- `.env.local.example` — add `NEXT_PUBLIC_R2_BASE_URL=` line
- `next.config.ts` — add R2 hostname

**Content JSON (5 files):**
- `content/characters.json`
- `content/playlists.json`
- `content/site-config.json`
- `content/videos.json`
- `content/coming-soon.json` (if applicable)

**Lib (2 files):**
- `lib/content/schemas.ts`
- `lib/shopify/mock-products.ts`

**Pages (3 files):**
- `app/layout.tsx`
- `app/page.tsx`
- `app/shop/page.tsx`

**Components (~15 files):**
- `components/home/*.tsx` (hero, menu-cards, featured-pup, character-showcase, feature-banner, newsletter-cta, video-grid, etc.)
- `components/shop/*.tsx` (explore-products, shop-empty-state)
- `components/watch/*.tsx` (watch-hero, watch-library, our-channels, explore-videos, featured-video, video-card, subscribe-card, video-rail)

### Out of scope

- Uploading assets to R2 (already done per user).
- Image format optimization (WebP/AVIF conversion) — separate concern.
- Image preloading via `<link rel="preload">` for hero — that's a perf cycle.
- Removing local `public/assets/` (kept as dev fallback per decision).
- Other cycles (responsive audit, SEO, YouTube API).

---

## 6. Risks / Concerns

1. **Asset reference regex misses** — a grep+sed migration won't catch every case (e.g., string-template URLs, dynamically built paths). Mitigation: post-migration grep for `'/assets/` and `"/assets/` should return ZERO hits. Phase 4 verifies this.
2. **`<Image>` requires absolute URL or known remote domain** — handled by adding hostname to `remotePatterns`. If user later changes domain, both env AND next.config must be updated. Documented.
3. **`process.env.NEXT_PUBLIC_R2_BASE_URL` at module load** — Next.js inlines `NEXT_PUBLIC_*` at build time. Means: if env changes, requires rebuild. Acceptable.
4. **Dev workflow without R2 access** — fallback to `/assets/` handles this transparently. Devs who have local `public/assets/` see local images; devs with R2 env see CDN.
5. **R2 caching for new assets** — when user uploads a new asset version with the same key, CDN cache may serve stale. Mitigation: rename keys (e.g., `banner-v2.png`) or use Cloudflare cache purge. Out of cycle scope but document.
6. **CORS for cross-origin images** — `<Image>` may add `crossOrigin` attribute; Cloudflare R2 public buckets serve `Access-Control-Allow-Origin: *` by default for HEAD/GET. Should work without config.
7. **`lib/content/schemas.ts` default value pattern** — if defaults reference assets, importing `assetUrl` here is fine (utility, no circular deps). Verify during impl.
8. **Mass replace risk** — JSON migration must be deterministic. A `sed -i 's|/assets/|/|g'` would also corrupt URL paths in non-asset strings (e.g., docs/links). Better: replace only quoted-string-value patterns. Safest: per-file targeted replace using a node script that parses JSON, walks values, transforms strings matching `/^\/assets\//`.
9. **R2 secret access keys in `.env`** — already there from user. `.env` is gitignored ✓. Don't expose in build output. Helper only uses the PUBLIC base URL, not the keys. Keys are reserved for server-side upload scripts (cycle scope: NOT used here).

---

## 7. Success Criteria

- `lib/utils/asset-url.ts` exists with `assetUrl(key)` helper.
- `NEXT_PUBLIC_R2_BASE_URL` set in `.env` (renamed from `R2_PUBLIC_URL`); `.env.local.example` updated.
- `next.config.ts` includes `images.scoutpaw.tv` in `remotePatterns`.
- Zero hits for `'/assets/` or `"/assets/` in `components/`, `app/`, `content/`, `lib/` (excluding the helper itself and the .env example).
- All pages render correctly when R2 env IS set (images load from CDN).
- All pages render correctly when R2 env is EMPTY (images fall back to local `/assets/`).
- `<Image>` components work for both modes.
- `pnpm typecheck` + `pnpm lint` clean.
- No console errors / 404s in dev with env set.

---

## 8. Open Questions

_None — all locked._

---

## 9. Next Steps

- Decision: `/ck:plan` to convert into phased plan, or direct implement.
- After this cycle: resume deferred cycles (2=responsive audit, 3=SEO audit, 4=fixes, 5=YouTube API).
