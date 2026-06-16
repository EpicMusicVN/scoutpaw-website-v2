---
phase: 3
title: OG Sitemap Metadata
status: completed
priority: P2
effort: 2.5h
dependencies:
  - 1
---

# Phase 3: OG Sitemap Metadata

## Overview
Complete the social/discovery signals: declare OG image dimensions + alt (via a shared helper),
add image entries to the sitemap, and enrich root metadata with the remaining standard fields.

## Requirements
- Functional: every OG image declares `width`/`height`/`alt`.
- Functional: sitemap entries carry representative `images`.
- Functional: root metadata adds `applicationName`, `authors`/`creator`/`publisher`, `category`,
  `formatDetection`.
- Non-functional: OG image meta centralized (DRY — one helper, no per-page dim drift).

## Architecture
- Measure `public/assets/banner/banner.png` real pixel dimensions (Node: read PNG IHDR bytes, or
  `sharp`/`image-size` if available; else a one-off script). Hardcode the measured `width`/`height`
  as constants.
- `lib/seo/og-image.ts` (new): `bannerOgImage(assetUrlFn)` → `{ url, width, height, alt }` for the
  default banner; small + reusable. Pages with custom OG images (characters, top-picks, character/[slug])
  keep their image but gain `width`/`height`/`alt` — accept that character art dims differ; either
  measure representative dims or omit width/height for those and keep `alt` (don't assert wrong dims).
- `app/(frontend)/layout.tsx`: OG image via `bannerOgImage`; add `applicationName: brand.fullName`,
  `authors: [{ name: brand.fullName }]`, `creator`/`publisher: brand.fullName`, `category: "Pets"`,
  `formatDetection: { telephone: false }`.
- `app/sitemap.ts`: add `images: [ogUrl]` to home + section entries; character entries → character image.

## Related Code Files
- Create: `lib/seo/og-image.ts`
- Modify: `app/(frontend)/layout.tsx` — OG dims/alt + richer metadata
- Modify: `app/(frontend)/{characters,top-picks,characters/[slug]}/page.tsx` — OG `alt` (+ dims if known)
- Modify: `app/sitemap.ts` — image entries
- Reference: `public/assets/banner/banner.png` (measure dimensions)

## Implementation Steps
1. Measure banner.png dimensions; record as constants in `og-image.ts`.
2. Create `bannerOgImage` helper; use in layout OG.
3. Add richer metadata fields to root `generateMetadata`.
4. Add `alt` (+ known dims) to page-level OG images.
5. Add `images` to sitemap entries (home/section → og; character → character image).
6. `tsc`/lint; curl `/` + `/sitemap.xml`; verify `og:image:width/height/alt` + sitemap `<image:image>`.

## Success Criteria
- [ ] OG images expose `width`/`height`/`alt` (at least the banner/default).
- [ ] Sitemap includes `<image:image>` entries.
- [ ] Root metadata shows applicationName/author/publisher/category.
- [ ] `tsc`/lint clean; endpoints 200.

## Risk Assessment
- **Wrong OG dims** worse than none → only declare dims we actually measured; omit for unknown
  custom images, keep `alt`.
- **Image sitemap namespace** — Next adds the `image` namespace automatically when `images` set; verify output.
