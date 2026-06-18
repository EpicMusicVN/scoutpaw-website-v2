---
phase: 2
title: Headers & Freshness Schema
status: completed
priority: P1
effort: 1-2h
dependencies: []
---

# Phase 2: Headers & Freshness Schema

## Overview
Two independent quick wins: stop sending the `X-Powered-By` header, and add a build-time
`dateModified`/`datePublished` to the site JSON-LD so the AEO freshness check passes.

## Requirements
- Functional: response headers no longer include `X-Powered-By`; homepage JSON-LD carries a
  `dateModified` (and `datePublished`) within the last 6 months.
- Non-functional: date must refresh automatically on each deploy (no manual bump); no extra
  runtime fetch.

## Architecture
**X-Powered-By:** Next.js sends `X-Powered-By: Next.js` by default. Disable via
`poweredByHeader: false` in `next.config.ts`. The config is wrapped
(`withPayload(withBundleAnalyzer(nextConfig))`) — add the flag to the `nextConfig` object so it
survives the wrappers.

**Freshness:** no JSON-LD currently emits any date (verified — zero `dateModified`/
`datePublished` in the codebase). The site graph is built in `app/(frontend)/layout.tsx` via
`organizationSchema` + `websiteSchema` from `lib/seo/structured-data.ts`.
- Add a build-time constant for the deploy date. Options (pick simplest that works on Vercel):
  - inline `new Date().toISOString()` evaluated at module load (server build), or
  - an env-injected `NEXT_PUBLIC_BUILD_DATE` / Vercel's build timestamp.
  Prefer a single shared helper (e.g. `lib/seo/build-date.ts`) so the value is DRY across
  builders and the sitemap if reused.
- Add `dateModified` (and `datePublished`) to the `WebSite` node (and/or a `WebPage` node for
  the homepage). Keep `@id` graph references intact.
- Leave existing sitemap `lastmod` behavior unchanged (already present in `app/sitemap.ts`).

## Related Code Files
- Modify: `next.config.ts` (add `poweredByHeader: false`)
- Modify: `lib/seo/structured-data.ts` (add date fields to `websiteSchema` / new WebPage builder)
- Create (optional): `lib/seo/build-date.ts` (shared build-time date constant)
- Modify if helper added: `app/(frontend)/layout.tsx` (pass date into schema)

## Implementation Steps
1. Add `poweredByHeader: false` to the `nextConfig` object in `next.config.ts`.
2. Add a build-date source (constant/helper) resolving to an ISO string at build time.
3. Wire `dateModified` (+ `datePublished`) into the `WebSite`/`WebPage` JSON-LD node.
4. Verify: `curl -I` the running site → no `X-Powered-By`.
5. Verify: view-source homepage → JSON-LD contains a recent `dateModified`.

## Success Criteria
- [ ] `curl -I <home>` shows no `X-Powered-By` header.
- [ ] Homepage JSON-LD contains a valid `dateModified` (and `datePublished`) within 6 months.
- [ ] Date refreshes automatically on rebuild (no hardcoded literal that goes stale).
- [ ] Existing security headers (`X-Content-Type-Options` etc.) and Payload wrappers unaffected.

## Risk Assessment
- **Stale hardcoded date** — must derive from build time, not a committed literal, or the
  freshness check silently fails in 6 months. Mitigate by computing at build.
- **Schema validity** — keep `@context`/`@type`/`@id` correct; validate in Google Rich Results.
