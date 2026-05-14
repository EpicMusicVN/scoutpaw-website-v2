---
phase: 1
title: Env + helper + next.config
status: completed
priority: P2
effort: 15m
dependencies: []
---

# Phase 1: Env + helper + next.config

## Overview

Foundation work for the R2 migration: rename the public R2 base URL env var, create the `assetUrl()` helper, add the R2 hostname to Next image remotePatterns, and update `.env.local.example` so the var is discoverable.

## Requirements

**Functional**
- `lib/utils/asset-url.ts` exports `assetUrl(key: string): string`.
- Helper reads `process.env.NEXT_PUBLIC_R2_BASE_URL` at module load.
- When base URL set: returns `${base}/${key}` (trailing slash on base trimmed, leading slash + `assets/` prefix on key trimmed).
- When base URL empty: returns `/assets/${key}` (local fallback).
- `next.config.ts` allows `images.scoutpaw.tv` as an image remote source.
- `.env` and `.env.local.example` use `NEXT_PUBLIC_R2_BASE_URL` (renamed from `R2_PUBLIC_URL`).

**Non-functional**
- Helper is pure (no IO, no side effects). Testable as a unit if desired.
- No new dependencies.
- Env var changes do not affect S3 secret keys (kept server-side).

## Architecture

### Helper file

`lib/utils/asset-url.ts`:

```ts
// Single source of truth for asset URL resolution. When NEXT_PUBLIC_R2_BASE_URL
// is set, resolves to the R2 CDN. When empty, falls back to local /public/assets/
// so developers without R2 env access can still run the site.
const BASE_URL = process.env.NEXT_PUBLIC_R2_BASE_URL?.replace(/\/+$/, "") ?? "";

export function assetUrl(key: string): string {
  // Tolerate accidental leading "/" or "assets/" prefix in callers/data.
  const k = key.replace(/^\/+/, "").replace(/^assets\//, "");
  return BASE_URL ? `${BASE_URL}/${k}` : `/assets/${k}`;
}
```

### `.env` change

Rename `R2_PUBLIC_URL` → `NEXT_PUBLIC_R2_BASE_URL`. Value unchanged: `https://images.scoutpaw.tv/`.

Other R2 vars (`R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) are server-side and stay as-is.

### `.env.local.example` change

Append:

```
# Cloudflare R2 public base URL (e.g., https://images.scoutpaw.tv/).
# Leave empty in dev to fall back to local /public/assets/.
NEXT_PUBLIC_R2_BASE_URL=
```

### `next.config.ts` change

Add R2 hostname to `remotePatterns`:

```diff
  remotePatterns: [
    { protocol: "https", hostname: "cdn.shopify.com" },
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "img.youtube.com" },
+   { protocol: "https", hostname: "images.scoutpaw.tv" },
  ],
```

## Related Code Files

- Create: `lib/utils/asset-url.ts`
- Modify: `.env` (rename var)
- Modify: `.env.local.example` (add var)
- Modify: `next.config.ts` (add hostname to remotePatterns)

## Implementation Steps

1. Create `lib/utils/asset-url.ts` per the architecture above.
2. In `.env`, rename `R2_PUBLIC_URL=https://images.scoutpaw.tv/` to `NEXT_PUBLIC_R2_BASE_URL=https://images.scoutpaw.tv/`.
3. Append `NEXT_PUBLIC_R2_BASE_URL=` line to `.env.local.example` with a brief comment.
4. In `next.config.ts`, add the `images.scoutpaw.tv` entry to `images.remotePatterns`.
5. Run `pnpm typecheck`. Halt on errors (the helper file is the only new TS surface; should be clean).
6. Run `pnpm lint`. Halt on errors.

## Success Criteria

- [ ] `lib/utils/asset-url.ts` exists and exports `assetUrl`
- [ ] `.env` uses `NEXT_PUBLIC_R2_BASE_URL` (no `R2_PUBLIC_URL` remains)
- [ ] `.env.local.example` documents `NEXT_PUBLIC_R2_BASE_URL`
- [ ] `next.config.ts` allows `images.scoutpaw.tv`
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **Env var rename breaks code referencing `R2_PUBLIC_URL`** — grep verifies no consumers exist (server-side uploaders not in scope this cycle).
- **Helper used before env loaded** — Next inlines `NEXT_PUBLIC_*` at build time so it's a baked constant in the bundle. No runtime initialization order issue.
- **Trailing-slash handling** — regex `\/+$` strips ANY trailing slashes; safer than just `/$`.
