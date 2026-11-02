---
phase: 2
title: Core Structured Data
status: completed
priority: P1
effort: 3h
dependencies:
  - 1
---

# Phase 2: Core Structured Data

## Overview
Establish the reusable JSON-LD plumbing and inject site-wide `Organization` + `WebSite`
schema. This is the single highest-leverage AEO change — gives answer engines a canonical
entity for "ScoutPaw" with logo, description, and social `sameAs` links.

## Requirements
- Functional: every page renders `Organization` + `WebSite` JSON-LD in `<head>`/body.
- Non-functional: one reusable component + pure builder functions (DRY, typed, testable).
- Non-functional: schema content sourced from `getSiteConfig()` — no duplicated strings.

## Architecture
- `components/seo/json-ld.tsx`: minimal client-agnostic server component rendering
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.
  Accepts a typed object (or array). XSS-safe because input is our own structured data; still
  escape `<` to `<` per Google guidance.
- `lib/seo/structured-data.ts`: pure builder functions returning plain objects:
  - `organizationSchema(config, siteUrl)` → `@type: Organization`, `name`, `url`, `logo`
    (absolute), `description`, `sameAs: config.social.map(s => s.url)`.
  - `websiteSchema(config, siteUrl)` → `@type: WebSite`, `name`, `url`. **No `potentialAction`/
    SearchAction** (no on-site search URL).
  - (builders for VideoObject/Product/Breadcrumb/FAQ added in Phase 3–4; same file.)
- Inject both in `app/(frontend)/layout.tsx` body via `<JsonLd data={[org, website]} />`.

## Related Code Files
- Create: `components/seo/json-ld.tsx`
- Create: `lib/seo/structured-data.ts` (Organization + WebSite builders this phase)
- Modify: `app/(frontend)/layout.tsx` — fetch config, render `<JsonLd>`.

## Implementation Steps
1. Create `JsonLd` component with `<` escaping.
2. Create `structured-data.ts` with `organizationSchema` + `websiteSchema` (typed against `SiteConfig`).
3. In `layout.tsx`, build both from existing `config` + `getSiteUrl()`, render `<JsonLd>` once.
4. Verify `sameAs` array is populated from `config.social[]` (skip entries with empty url).
5. Typecheck + lint; curl home, grep for `application/ld+json`, paste into Schema.org validator.

## Success Criteria
- [ ] Home + all routes contain valid `Organization` and `WebSite` JSON-LD.
- [ ] `sameAs` lists every social URL from site config.
- [ ] `logo`/`url` are absolute (`www.scoutpaw.tv`).
- [ ] Schema.org validator: 0 errors. Google Rich Results: Organization detected.
- [ ] `tsc --noEmit` + lint clean.

## Risk Assessment
- **Risk:** double-injection if a child route also renders WebSite. *Mitigation:* Org/WebSite
  live ONLY in layout; per-page schema (Phase 3) uses different `@type`s.
- **Risk:** `social` may be empty in config. *Mitigation:* omit `sameAs` when array empty.
