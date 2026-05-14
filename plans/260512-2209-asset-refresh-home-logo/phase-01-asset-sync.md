---
phase: 1
title: Asset Sync
status: completed
priority: P1
effort: 15m
dependencies: []
---

# Phase 1: Asset Sync

## Overview

Copy 10 updated PNGs from source `/assets/` to runtime `/public/assets/`. Verify and handle stale `banner.webp` (regen or delete based on usage).

## Requirements

- Functional: New assets visible at runtime via `<Image src="/assets/...">` calls.
- Non-functional: No orphan files left behind. `banner.webp` decision is conclusive (regen OR delete, not "leave stale").

## Architecture

Source: `D:\works\emvn\scoutpaw-v2\assets\` (working/source).
Runtime: `D:\works\emvn\scoutpaw-v2\public\assets\` (served by Next.js).

10 files in scope:
- `banner/banner.png`
- `card/{blog,characters,events,make,music,shop,watch}.png` (7)
- `logo/{full-logo,text-logo}.png` (2)

Stale concern: `public/assets/banner/banner.webp` exists but `full-bleed-hero.tsx` references `.png` directly via `next/image` (which transcodes on demand). The webp is likely orphan code.

## Related Code Files

- Modify (copy): `public/assets/banner/banner.png`
- Modify (copy): `public/assets/card/*.png` (7 files)
- Modify (copy): `public/assets/logo/*.png` (2 files)
- Possibly delete: `public/assets/banner/banner.webp`

## Implementation Steps

1. Grep codebase for `banner.webp` references:
   ```
   Grep pattern="banner\.webp" output_mode="files_with_matches"
   ```
   - If 0 matches → delete `public/assets/banner/banner.webp`.
   - If matches found → regen via `sharp`:
     ```
     pnpx sharp -i public/assets/banner/banner.png -o public/assets/banner/banner.webp -f webp -- --quality 85
     ```
     (or equivalent one-liner; `sharp` is already a dep).

2. Copy 10 PNGs (PowerShell):
   ```
   Copy-Item -Force assets/banner/banner.png public/assets/banner/banner.png
   Copy-Item -Force assets/card/*.png public/assets/card/
   Copy-Item -Force assets/logo/*.png public/assets/logo/
   ```

3. Verify file sizes / dates match source.

## Success Criteria

- [x] All 10 PNGs in `public/assets/` are byte-identical to source `/assets/` versions.
- [x] `banner.webp` either regenerated from new banner.png OR deleted (no stale).
- [x] No orphan or duplicate files under `public/assets/{banner,card,logo}/`.

## Risk Assessment

- **Risk:** Copy-Item fails on locked file (if dev server is running and Next.js has the file open).
  - **Mitigation:** Stop dev server before copy; restart after.
- **Risk:** Regen with wrong dimensions / quality.
  - **Mitigation:** Match prior webp dimensions; quality 85 is industry default.
