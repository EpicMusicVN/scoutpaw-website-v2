---
phase: 4
title: Validation + grep audit
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Validation + grep audit

## Overview

Verify phases 1–3 cleanly. The critical check is the grep audit — zero `/assets/` literals anywhere outside the helper itself and the env example. Beyond that: typecheck, lint, runtime smoke test, dev fallback verification.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0 (no new errors).
- Zero hits for `'/assets/` or `"/assets/` in `components/`, `app/`, `content/`, `lib/` (excluding `lib/utils/asset-url.ts` which contains the fallback string).
- With env set: all images on `/`, `/shop`, `/watch` load from `images.scoutpaw.tv`.
- With env unset (or empty): all images fall back to local `/assets/...`.
- No console errors / 404s in either mode.

## Architecture

Static checks + visual QA walkthrough at 4 viewports + a quick env-flip test.

## Pre-flight

Confirm phases 1, 2, 3 complete. If any phase incomplete, halt.

## Implementation Steps

### Grep audit (CRITICAL)

```bash
# Should return ZERO lines
grep -rn '"/assets/\|'\''/assets/' components/ app/ content/ lib/
# Exception: lib/utils/asset-url.ts contains "/assets/" in the fallback string
# That's the only allowed hit.
```

If any hit found outside `lib/utils/asset-url.ts`, return to phase 3 and migrate that file.

### Static checks

1. `pnpm typecheck` — halt on errors.
2. `pnpm lint` — halt on new errors.

### Runtime (env SET)

3. Confirm `NEXT_PUBLIC_R2_BASE_URL=https://images.scoutpaw.tv/` is set in `.env`.
4. `pnpm dev`.
5. Walkthrough at 375 / 768 / 1024 / 1440:
   - `/`: hero banner, menu cards (Characters/Shop/Watch), featured pup, character showcase, feature banner, video grid, newsletter — all images loaded.
   - `/shop`: hero, explore products tiles, about-shop.
   - `/watch`: hero video (autoplays from `https://images.scoutpaw.tv/watch/intro.mp4`), video rail, explore videos, our channels, subscribe card.
6. Devtools Network panel: all image requests target `images.scoutpaw.tv`. No `/assets/...` requests.
7. Console: no errors, no 404s.

### Runtime (env UNSET — fallback verification)

8. Comment out `NEXT_PUBLIC_R2_BASE_URL` in `.env`. Restart dev server.
9. Reload `/`, `/shop`, `/watch`. All images load from `/assets/...` (Network panel shows local requests).
10. Re-enable env. Restart. Confirm CDN URLs restored.

## Success Criteria

- [ ] Zero `/assets/` literal hits in code paths (excluding `lib/utils/asset-url.ts`)
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0
- [ ] Env-set mode: all images load from R2 CDN
- [ ] Env-unset mode: all images load from local fallback
- [ ] No console errors or 404s
- [ ] No layout shift or visual regression

## Risk Assessment

- **Grep misses string-template constructions** — `\`/assets/${x}\`` would be missed by `'/assets/` and `"/assets/`. Run additional grep for template literal:
  ```bash
  grep -rn '/assets/' components/ app/ content/ lib/
  ```
  Filter out `lib/utils/asset-url.ts`. Zero remaining is the goal.
- **Some images don't appear in walkthrough due to data conditionals** — e.g., a coming-soon page may not render unless slug matches. Spot-check by visiting each page slug if needed.
- **R2 CORS error for some asset types** — Cloudflare R2 public buckets serve cross-origin correctly by default. If unexpected CORS error appears, investigate bucket settings.
- **Mixed-content (HTTPS asset on HTTP page)** — irrelevant locally; production should be HTTPS already.
