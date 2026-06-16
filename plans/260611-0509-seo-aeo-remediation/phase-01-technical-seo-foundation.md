---
phase: 1
title: Technical SEO Foundation
status: completed
priority: P1
effort: 3h
dependencies: []
---

# Phase 1: Technical SEO Foundation

## Overview
Add the crawl-discovery surfaces and fix metadata gaps: `robots.ts`, `sitemap.ts`,
`manifest.ts`, canonical URLs, hardened `metadataBase`, and OG/Twitter completeness.
This alone moves the site from "must crawl every link" to "fully discoverable + de-duplicated".

## Requirements
- Functional: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` return 200 with valid bodies.
- Functional: every route emits a `<link rel="canonical">`; sitemap enumerates all static + dynamic routes.
- Non-functional: dynamic routes read from `lib/content` adapter (works for json + payload).
- Non-functional: no hardcoded domain — single source of truth for site URL.

## Architecture
Next.js App Router native metadata file conventions (no extra deps):
- `app/(frontend)/robots.ts` → `MetadataRoute.Robots`. Allow `/`, disallow `/admin`,
  declare `sitemap` URL. Build absolute URL from resolved site URL.
- `app/(frontend)/sitemap.ts` → `MetadataRoute.Sitemap`. Static routes (`/`, `/characters`,
  `/shop`, `/watch`, `/top-picks`, `/privacy`, `/terms`) + dynamic from adapter:
  `getCharacters()` → `/characters/{slug}`, `getComingSoonPages()` → `/coming-soon/{slug}`.
  `lastModified` from content where available; `changeFrequency`/`priority` sensible defaults.
- `app/(frontend)/manifest.ts` → `MetadataRoute.Manifest`. name/short_name/description from
  `getSiteConfig().brand`, `theme_color`/`background_color` from `palette`, icons from existing
  `app/(frontend)/icon*.png|svg` + `apple-icon.png`.
- **Site URL helper** `lib/seo/site-url.ts`: single resolver. In production, **throw** if
  `NEXT_PUBLIC_SITE_URL` is unset (kills the silent `scoutpaw.vercel.app` fallback in
  `layout.tsx:28`); in dev, fall back to `http://localhost:3000`. Default prod value `https://www.scoutpaw.tv`.

## Related Code Files
- Create: `lib/seo/site-url.ts`
- Create: `app/(frontend)/robots.ts`
- Create: `app/(frontend)/sitemap.ts`
- Create: `app/(frontend)/manifest.ts`
- Modify: `app/(frontend)/layout.tsx` — use `site-url.ts`; add `alternates.canonical`,
  `openGraph.siteName`, OG image `width/height/alt`, `twitter.site`; fix OG `title` to include tagline.
- Modify: `app/(frontend)/{shop,characters,watch,top-picks,privacy,terms}/page.tsx` and
  `characters/[slug]`, `coming-soon/[slug]` — add per-route `alternates.canonical` (relative path).

## Implementation Steps
1. Create `lib/seo/site-url.ts` with `getSiteUrl(): string` (prod throws on missing env; dev localhost).
2. Refactor `layout.tsx` `generateMetadata` to use `getSiteUrl()` for `metadataBase`.
3. Enrich root metadata: `alternates.canonical: "/"`, `openGraph.siteName`, image `{ width:1200, height:630, alt }`, `twitter.site` (handle from `getSiteConfig().social` if present, else omit).
4. Create `robots.ts` (allow all, disallow `/admin`, sitemap URL).
5. Create `sitemap.ts` reading adapter for character + coming-soon slugs; include static routes.
6. Create `manifest.ts` from brand + palette + existing icons.
7. Add `alternates.canonical` (relative) to each route's metadata export / `generateMetadata`.
8. Typecheck + lint; `curl` the three endpoints against `pnpm dev`.

## Success Criteria
- [ ] `/robots.txt` 200, references sitemap, disallows `/admin`.
- [ ] `/sitemap.xml` 200, lists all static routes + every character & coming-soon slug.
- [ ] `/manifest.webmanifest` 200 with name/icons/theme color.
- [ ] Every page has exactly one `rel="canonical"` resolving to `www.scoutpaw.tv`.
- [ ] Unsetting `NEXT_PUBLIC_SITE_URL` in a prod build fails loudly (no vercel.app leak).
- [ ] `tsc --noEmit` and lint clean.

## Risk Assessment
- **Risk:** `(frontend)` route group — confirm Next.js serves `robots.ts`/`sitemap.ts` from
  inside the group at root paths. *Mitigation:* if not, place files at `app/` root; verify via curl.
- **Risk:** throwing on missing env could break preview deploys. *Mitigation:* gate throw on
  `NODE_ENV === "production" && process.env.VERCEL_ENV === "production"`.
