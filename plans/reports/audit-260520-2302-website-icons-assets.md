# Audit — Website Icons & Assets

**Date:** 2026-05-20 23:02 | **Scope:** favicon, UI icons, image assets, caching | **Result:** 1 bug found + fixed

## Summary

Static analysis + R2 CDN HEAD checks + production build. One real rendering bug found (`.jpg`/`.png` asset mismatch) and fixed. Favicon and UI icons are sound; two minor favicon gaps noted but out of fix scope by decision.

## Findings

### 1. Favicon — OK (minor gaps)

- `app/icon.png` (14.7 KB) + `app/apple-icon.png` (59 KB, 180×180) — Next.js file-convention. Source: `assets/favicon-source/paw.svg`.
- Build confirms `/icon.png` + `/apple-icon.png` routes generated; Next auto-injects `<link rel="icon">` / `apple-touch-icon` with a content hash → automatic cache-busting.
- Covers all modern desktop + mobile browsers (tab favicon) + iOS Safari home-screen.
- ⚠️ Gaps (not fixed — scope decision):
  - No `app/favicon.ico` → bare `/favicon.ico` requests 404. Tab/bookmark icon still works via link tag; only affects legacy clients / tools hard-fetching `/favicon.ico`.
  - No web manifest (`app/manifest.ts`) → no Android "add to home screen" maskable icon, no `theme-color`.

### 2. UI icons — OK, no action

- No icon library. All icons inline `<svg>` across ~22 components + `components/ui/paw-icon.tsx`.
- Inline SVG compiles into the JS bundle → no URL path, no separate cache entry. "Broken icon paths" and "icon caching issues" are structurally impossible here — that part of the request is a non-issue.

### 3. Content image assets — BUG FOUND & FIXED

**Root cause:** half-finished "jpg image swap" — R2 CDN updated to `.jpg`, local `public/assets/shop/` left as stale `.png`.

**Evidence (R2 CDN `images.scoutpaw.tv` HEAD checks):**

| Asset | `.jpg` | `.png` |
|---|---|---|
| `shop/1`, `shop/2`, `shop/banner`, `shop/promotion` | 200 ✅ | 404 ❌ |
| `banner/banner` (control) | — | 200 ✅ |

- Code referenced `.jpg` in `explore-products.tsx` ×2, `shop/page.tsx`, `page.tsx` — correct for prod, **broken in local dev** (local had only `.png`).
- `lib/shopify/mock-products.ts` referenced `shop/promotion.png` ×3 — **404 on R2**, broken in prod if rendered.

**Fix applied:**
1. Downloaded real `.jpg` from R2 → `public/assets/shop/{1,2,banner,promotion}.jpg`. Bonus perf win — far smaller: 5.16 MB→749 KB, 5.66 MB→629 KB, 1.18 MB→161 KB, 2.24 MB→628 KB.
2. Removed stale `public/assets/shop/{1,2,banner,promotion}.png`.
3. `lib/shopify/mock-products.ts`: `shop/promotion.png` → `.jpg` (×3).
4. Verified `pnpm build` ✓ 22/22 pages.

Side benefit: local `public/` now matches R2, so prod renders correctly whether or not `NEXT_PUBLIC_R2_BASE_URL` is set in the deployment.

### 4. Other assets — clean

- All 30 `assetUrl()` calls cross-referenced vs local `public/assets/` + R2 — every non-shop ref (`banner/`, `card/`, `characters/`, `characters-position/`) resolves.
- Dead local assets (no code refs, no action): `card/{blog,events,make,music}.png`.

### 5. Caching — no issue

- `app/icon.png` content-hashed by Next → auto cache-bust.
- Local `/assets/*` served from `public/` by Next.
- Operational note: R2 CDN edge cache may serve **stale** content after an *in-place* file overwrite. When updating an R2 asset, use a new filename or purge CDN cache.

## Validation

- ✅ R2 CDN HEAD checks (source-of-truth determination)
- ✅ `pnpm build` — 22/22 static pages, no errors
- ✅ All `shop/*` refs now consistently `.jpg`, local + R2 in sync
- ❌ Live-browser favicon render — not tested (no browser automation chosen; see unresolved)

## Files Changed

- `lib/shopify/mock-products.ts` — `promotion.png` → `.jpg` ×3
- `public/assets/shop/` — added `{1,2,banner,promotion}.jpg`, removed stale `.png`

## Unresolved Questions

1. **Live production URL unknown.** `scoutpaw.vercel.app` (the `NEXT_PUBLIC_SITE_URL` fallback) returns **404** — not the real deployment, or deployment down. Could not verify favicon/icons in a real browser tab. Need the correct prod URL.
2. **Favicon gaps** — add `app/favicon.ico` + `app/manifest.ts`? Deferred by scope decision; low effort if wanted later.
