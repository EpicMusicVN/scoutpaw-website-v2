---
type: code-review
cycle: r2-asset-migration
reviewer: code-reviewer
date: 2026-05-15
---

# R2 Asset Migration — Code Review

## Scope
- Helper: `lib/utils/asset-url.ts`
- next.config.ts (remotePatterns)
- Env: `.env`, `.env.local.example`
- Content JSON: characters / playlists / videos / site-config
- Schemas: `lib/content/schemas.ts`
- Lib: `lib/shopify/mock-products.ts`
- UI: ~22 components + 4 app pages

## Overall Assessment
Migration is largely sound. Helper is correct, JSON shape is consistent, callers wrap at render sites. Two real bugs and two doc/inventory discrepancies found. Recommend fix before landing.

---

## Critical Issues

### C1. `mobile-nav.tsx` renders unwrapped `logoText` — broken when R2 set, broken in fallback
**Files:** `components/nav/top-nav.tsx:78`, `components/nav/mobile-nav.tsx:74`

`top-nav.tsx` wraps `spotlight.image` correctly (line 20) but passes `logoText` to `MobileNav` **without wrapping**:

```ts
// top-nav.tsx
<MobileNav
  navItems={config.navItems}
  spotlight={spotlight}
  logoText={config.brand.logoText}   // ← RAW bare key, e.g. "logo/text-logo.png"
/>
```

`mobile-nav.tsx:74` then renders directly:
```ts
<Image src={logoText} ... />   // src = "logo/text-logo.png"
```

Effect with current `.env` (`NEXT_PUBLIC_R2_BASE_URL=https://images.scoutpaw.tv/`): mobile drawer top-bar logo is broken — Next/Image receives a relative non-public path. With fallback (env empty): same break — should be `/assets/logo/text-logo.png` but renders `logo/text-logo.png`.

Inconsistent with `footer.tsx:76`, which correctly wraps the same field: `assetUrl(config.brand.logoText)`.

Symmetric to the `spotlight.image` wrap-at-parent decision documented in the brainstorm. Two viable fixes — pick one and apply consistently:

**Option A (consistent with spotlight):** wrap in `top-nav.tsx`:
```ts
<MobileNav
  ...
  logoText={assetUrl(config.brand.logoText)}
/>
```

**Option B:** wrap in `mobile-nav.tsx`. Requires `mobile-nav.tsx` to import `assetUrl` and apply it to `logoText`. Also requires changing `spotlight.image` to bare key + wrapping inside the drawer (parallel handling for both props). More invasive.

Recommend **A** — preserves the "wrap at parent" pattern already chosen for `spotlight.image`.

### C2. `.env.local.example` does NOT document `NEXT_PUBLIC_R2_BASE_URL`
**File:** `.env.local.example` (full file inspected)

Claim in summary + phase-01 doc: "added/documents the new var." Actual file contains no `NEXT_PUBLIC_R2_BASE_URL` line. New devs cloning the repo and copying `.env.local.example` → `.env.local` will run in fallback mode and miss the R2 toggle.

Fix: append
```
# Public Cloudflare R2 CDN base URL (e.g. https://images.scoutpaw.tv/).
# Leave empty to serve from local public/assets/ during dev.
NEXT_PUBLIC_R2_BASE_URL=
```

---

## High Priority

### H1. Audit claim "ZERO `/assets/` hits across content" is incorrect
**Files:** `content/playlists.json:2`, `content/videos.json:2`

Both files still contain `/assets/banner/banner.png` inside the `_note` documentation string. These are stripped by Zod (`PlaylistsFileSchema` has no `.passthrough()`; `VideosFileSchema` uses `.passthrough()` but `_note` is not a `Playlist`/`Video` field — at top level of the file object, passthrough preserves `_note`, but it's never consumed). Functionally harmless today.

However: the strict grep audit in the phase-4 plan explicitly states zero `/assets/` hits in content. Either the audit grep pattern was scoped (e.g. only string values matching `^/assets/`) and the report should disclose that, or these notes should be updated to use bare keys to stay consistent. Recommend the latter — it removes lingering stale docs and lets future audits stay strict.

### H2. `assetUrl("")` produces a broken bucket-root URL
**File:** `lib/utils/asset-url.ts`

Edge case test result:
- BASE_URL set + key `""` → `"https://images.scoutpaw.tv/"`
- BASE_URL empty + key `""` → `"/assets/"`

Neither resolves to a real asset. Today's schemas use `z.string().min(1)` on `image` / `logo` / `coverImage`, so JSON-fed values can't be empty. But helper accepts any string and will silently emit a malformed URL.

Not blocking. If you want defense-in-depth, add `if (!key) throw new Error(...)` or return empty string and let Image error visibly. YAGNI argument also valid given the schema guard.

---

## Medium Priority

### M1. `featured-video.tsx` deprecated — still wired with `assetUrl()` but unused
JSDoc says `@deprecated Folded into WatchHero`. File still consumes `assetUrl` and remains exported. If truly dormant, deletion would shrink surface area. If kept for safety, no action — but note: future env/helper changes still have to consider it.

### M2. `watch-library.tsx` deprecated — same status
JSDoc: `@deprecated Removed from /watch in the 260511 polish pass.` Still maintained with `assetUrl` calls. Same recommendation as M1.

---

## Low Priority

### L1. JSDoc on `schemas.ts` references `lib/utils/asset-url` — accurate, but could be terser
Line 81: `// Store as a bare key (e.g. "watch/intro.mp4"); UI resolves via lib/utils/asset-url.` Good guidance. No change.

### L2. `next.config.ts` lists `images.scoutpaw.tv` as `protocol: "https"` only
Correct for prod. Note: if R2 ever serves over HTTP (dev/staging mirror), Next's image optimizer will refuse to fetch. Not an issue today — production R2 CDN is HTTPS-only.

---

## Edge Cases Verified (Helper Correctness)

Ran behavioral test of `assetUrl` across inputs. All pass except empty-string case (H2):

| Input | BASE_URL set | BASE_URL empty |
|---|---|---|
| `"foo"` | `https://.../foo` | `/assets/foo` |
| `"/foo"` | `https://.../foo` | `/assets/foo` |
| `"///foo"` | `https://.../foo` | `/assets/foo` |
| `"/assets/foo"` | `https://.../foo` | `/assets/foo` |
| `"assets/foo"` | `https://.../foo` | `/assets/foo` |
| `"watch/intro.mp4"` | `https://.../watch/intro.mp4` | `/assets/watch/intro.mp4` |
| `"some/assets/foo"` | `https://.../some/assets/foo` | `/assets/some/assets/foo` |
| `""` | `https://.../` ⚠ | `/assets/` ⚠ |

`^assets/` anchor correctly leaves mid-path `assets/` substrings intact. Trailing slash on BASE_URL handled (`/+$` strip). Leading slash(es) on key handled. Idempotent on already-stripped input.

---

## Build / Runtime Verification

- `assetUrl()` is pure module-level — `BASE_URL` const captured at module init. For server components evaluating at request time, this is fine (server bundle has full `process.env` at runtime). For client components, Next inlines `NEXT_PUBLIC_*` at build → const replaced with literal. Both paths produce identical URLs given identical env at build time. ✅
- Env change → rebuild required. Documented in phase-01. ✅
- No `assetUrl(assetUrl(...))` (grep verified). ✅
- No `assetUrl("http...")` or wrapping of full URLs (grep verified). ✅
- TypeScript narrows `featured.videoPoster` correctly in `watch-hero.tsx:49` (`featured.videoPoster ? assetUrl(featured.videoPoster) : undefined`). ✅
- `public/assets/` directory present (banner, card, characters, characters-position, logo, patterns, shop, watch). Fallback works. ✅

---

## Positive Observations

- Helper is 5 lines + comment header. Stays well within YAGNI/KISS.
- Tolerant-input design (strips `/`, strips `assets/` prefix) prevents partial-migration breakage.
- Pattern consistency: bare keys in JSON, wrap at render site. Only one wrap-at-parent exception (`spotlight.image`) and it's documented.
- `next.config.ts` hostname allowlist is minimal and correct.
- `mock-products.ts` migration is uniform.
- CSS `backgroundImage` template-literal swap (`menu-cards.tsx`, `watch-library.tsx`) correctly produces valid `url(...)` syntax in both R2 and fallback modes.
- `.passthrough()` on `VideosFileSchema` retains `_note` without crashing Zod parse — good defensive posture for content metadata.

---

## Recommended Actions (Priority Order)

1. **Fix C1** — wrap `logoText` in `top-nav.tsx` (Option A) before `MobileNav` consumes it. Verify mobile drawer logo renders correctly with R2 set AND in fallback (comment env out, restart dev).
2. **Fix C2** — add `NEXT_PUBLIC_R2_BASE_URL=` line to `.env.local.example`.
3. **H1** — update `_note` strings in `playlists.json` and `videos.json` to reference bare keys (or update audit doc to disclose pattern scope).
4. **H2 (optional)** — consider hardening helper against empty string, or accept current YAGNI posture.
5. **M1/M2 (post-cycle)** — schedule deletion of deprecated `featured-video.tsx` and `watch-library.tsx`.

---

## Metrics

- Files inspected: helper, next.config, env, 4 JSON, schemas, mock-products, ~22 component/app files.
- `assetUrl()` call sites: 36 (grep across `app/`, `components/`, `lib/`).
- Files importing `assetUrl`: 22 components + 4 app pages + 1 lib (mock-products).
- Double-wrap / full-URL-into-helper: 0 (grep verified).
- Remaining `/assets/` literal in app/components/lib/content: 2 (both in `_note` doc strings — see H1).

---

## Unresolved Questions

1. Is `featured-video.tsx` / `watch-library.tsx` safe to delete this cycle, or kept dormant for a reason not in the brainstorm doc?
2. Should `.env` (with the actual R2 URL) be in git? If so, intentional — if not, separate concern.
3. The phase-4 strict-grep audit pattern wasn't quoted in the summary — did it use `^/assets/` (value start) or any-substring `/assets/`? The two `_note` hits land differently depending on the pattern, which affects whether the "ZERO hits" claim was accurate or pattern-scoped.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Migration architecturally clean and helper-correct. Two real bugs: `mobile-nav.tsx` logo is broken (unwrapped `logoText` from `top-nav.tsx`), and `.env.local.example` doesn't document `NEXT_PUBLIC_R2_BASE_URL` (claim mismatch). One inventory mismatch with `_note` strings in two content JSON files. Recommend C1 + C2 before merging.
**Concerns/Blockers:** Mobile nav logo broken in both R2 and fallback modes until C1 is fixed. New devs won't discover R2 env var until C2 is fixed.
