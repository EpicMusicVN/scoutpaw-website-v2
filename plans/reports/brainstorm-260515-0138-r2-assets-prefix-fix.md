# Brainstorm — R2 `/assets/` Prefix Fix

**Date:** 2026-05-15 01:38 (Asia/Saigon)
**Scope:** One-line fix to the `assetUrl()` helper so URLs include `/assets/` in the path (R2 keys live under `assets/` folder).
**Status:** Design agreed — awaiting implementation decision.

This is a hotfix follow-up to the R2 migration (`plans/260515-0112-r2-asset-migration`) shipped 30 min earlier. The shipped helper produces `https://images.scoutpaw.tv/<key>` but R2 keys actually live at `https://images.scoutpaw.tv/assets/<key>` — current production URLs 404.

---

## 1. Problem Statement

R2 bucket has `assets/` prefix on all keys (mirrored from `public/assets/`). My shipped helper strips that prefix and produces URLs without it → 404 on every CDN-resolved image.

Need: helper prepends `assets/` to the resolved URL.

---

## 2. Current State

`lib/utils/asset-url.ts` (shipped 30 min ago):

```ts
const BASE_URL = process.env.NEXT_PUBLIC_R2_BASE_URL?.replace(/\/+$/, "") ?? "";

export function assetUrl(key: string): string {
  const k = key.replace(/^\/+/, "").replace(/^assets\//, "");
  return BASE_URL ? `${BASE_URL}/${k}` : `/assets/${k}`;
}
```

Result: `assetUrl("banner/banner.png")` → `https://images.scoutpaw.tv/banner/banner.png` ❌ (404).

---

## 3. Decisions Locked

| Question | Choice |
|----------|--------|
| R2 key structure | Keys live under `assets/` prefix in R2 |
| Prefix location | **Helper prepends** automatically. Callers and JSON values stay unchanged (bare keys like `banner/banner.png`). |

---

## 4. Final Design

Single one-line change to the helper:

```diff
- return BASE_URL ? `${BASE_URL}/${k}` : `/assets/${k}`;
+ return BASE_URL ? `${BASE_URL}/assets/${k}` : `/assets/${k}`;
```

**Net behavior:**
- `assetUrl("banner/banner.png")` → `https://images.scoutpaw.tv/assets/banner/banner.png` ✓ (matches R2 key structure)
- Fallback when env empty: `/assets/banner/banner.png` ✓ (matches local `public/assets/` structure — unchanged)
- Input normalization preserved (still strips accidental leading `/` or `assets/` prefix from key).

That's it. No JSON re-migration, no caller changes, no schema changes.

---

## 5. Implementation Notes

### Files touched

- Modify: `lib/utils/asset-url.ts` (one line)

### Out of scope

- JSON re-migration (values stay as bare keys)
- Caller changes (zero touched)
- Helper input contract (tolerant prefix-strip stays)
- All other R2 migration work (already shipped)

### Optional cosmetic touch-up

The helper's inline-comment "fallback to `/public/assets/`" still accurately describes the fallback branch. No comment edits needed.

---

## 6. Risks / Concerns

1. **R2 actually has flat keys (no `assets/` prefix)** — would 404 with this fix. User answered: keys ARE under `assets/`. Trusting that. Validation step verifies.
2. **`<Image>` `remotePatterns` already allows `images.scoutpaw.tv`** — no config change needed (the hostname is the same, only the path changes).
3. **CDN cache** — Cloudflare may cache the failing URLs. After fix, browser/CDN may serve stale 404s briefly. Cache purge if needed.

---

## 7. Success Criteria

- `lib/utils/asset-url.ts` produces URLs with `/assets/` in path when env set.
- Local fallback unchanged (still `/assets/<key>`).
- `pnpm typecheck` + `pnpm lint` clean.
- Visual check: Network panel shows `images.scoutpaw.tv/assets/...` requests returning 200.

---

## 8. Next Steps

Direct implementation (single 1-line Edit). No plan ceremony needed — scope is one line + verify.
