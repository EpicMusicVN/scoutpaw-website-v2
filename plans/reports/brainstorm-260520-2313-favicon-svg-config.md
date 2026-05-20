# Brainstorm — Favicon SVG Configuration

**Date:** 2026-05-20 23:13 | **Status:** Agreed (Approach A) | **Scope:** 1 new file

## Problem Statement

Make the browser-tab favicon use the paw SVG (`https://images.scoutpaw.tv/assets/favicon-source/paw.svg`), loading correctly across all browsers/devices, with caching handled.

## Verification (scout result)

- Current favicon: `app/icon.png` (14.7 KB raster) + `app/apple-icon.png` — Next.js file convention.
- `app/icon.png` was generated *from* `assets/favicon-source/paw.svg` (ImageMagick, per `.claude/settings.local.json`).
- R2 file `https://images.scoutpaw.tv/assets/favicon-source/paw.svg` → 200 OK, `image/svg+xml`.
- R2 SVG vs local `assets/favicon-source/paw.svg` → **byte-identical artwork** (only CRLF/LF line-ending diff).
- **Verdict:** favicon is the correct paw artwork already — but delivered as PNG, not SVG. Not stale, not broken. Request = change *format* to SVG.

## Key Constraint (brutal honesty)

**Safari (desktop + iOS) does not support SVG favicons.** SVG-only ⇒ Safari users get a blank favicon ⇒ fails the "all browsers/devices" requirement. SVG must ship **with a PNG fallback**.

## Evaluated Approaches

| | Approach | Cross-browser | External dep | Cache-bust | Verdict |
|---|---|---|---|---|---|
| **A** | `app/icon.svg` primary + keep `app/icon.png` fallback | ✅ All | None | Auto (content-hash) | **Chosen** |
| B | SVG only (replace PNG) | ❌ Safari blank | None | Auto | Rejected |
| C | Reference remote R2 URL in `<link rel=icon>` | ❌ Safari blank | ❌ R2 outage breaks favicon | ❌ stale risk | Rejected |

## Final Solution — Approach A (as implemented)

**Next.js *numbered* file convention** (no `layout.tsx` change needed):

1. `app/icon1.png` — PNG fallback (renamed from `app/icon.png`).
2. `app/icon2.svg` — paw SVG, primary (content identical to `assets/favicon-source/paw.svg`).
3. `app/apple-icon.png` — iOS home screen (unchanged).

**Why numbered:** un-numbered `icon.png` + `icon.svg` together — Next emits only ONE `<link>` (it picked the PNG; SVG route served but never referenced). Next's documented multi-icon mechanism is numeric suffixes — `iconN.*` — which emits a `<link>` per file. Lexical sort `icon1.png` < `icon2.svg` ⇒ PNG first, SVG last (canonical favicon order: Chrome/Firefox/Edge select the SVG, Safari ignores it and uses the PNG).

**Why file convention over `metadata.icons`:** file-convention icons are content-hashed by Next (`/icon2.svg?<hash>`) with immutable cache headers. `metadata.icons` pointing at `public/` loses hashing. KISS — no layout edit.

**Verified emitted `<head>`:**
```html
<link rel="icon" href="/icon1.png?94338ddf43fe096d" type="image/png" sizes="64x64"/>
<link rel="icon" href="/icon2.svg?dc49734549258519" type="image/svg+xml" sizes="any"/>
<link rel="apple-touch-icon" href="/apple-icon.png?ce2b3635866314dd" type="image/png" sizes="180x180"/>
```

**Caching / force-refresh (bullet #4):** solved automatically. Content hash changes when the file changes ⇒ browsers refetch on next deploy. No manual cache-busting / no "force refresh" action required.

## Risks

- Low. If Next emits only one icon link, verify ordering (`icon.png` then `icon.svg`) so browsers select correctly — confirmed via `next build` + emitted HTML inspection.

## Success Criteria

- `app/icon.svg` served at `/icon.svg` with content hash.
- Emitted HTML has both `<link rel="icon">` (svg + png) tags.
- `pnpm build` clean; `/icon.svg` route present.
- SVG artwork identical to the R2 paw.svg.

## Next Steps

- Create `app/icon.svg`, run `pnpm build`, verify emitted link tags. Trivial scope — no multi-phase plan.

## Unresolved

- Live production URL still unknown (`scoutpaw.vercel.app` → 404 from prior audit) — can't verify favicon in a real prod browser tab. Local build verification only.
