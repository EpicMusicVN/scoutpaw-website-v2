---
phase: 7
title: Coming Soon Pages
status: completed
priority: P2
effort: 3h
dependencies:
  - 3
---

# Phase 7: Coming Soon Pages

## Overview
Themed placeholder pages for disabled nav items (e.g. `/coming-soon/watch`, `/coming-soon/games`, `/coming-soon/activities`, `/coming-soon/about`). Each has character art + tagline + email capture (writes to ConvertKit via Phase 8 API). Slugs configured in `coming-soon.json`, mechanically generate routes.

## Requirements
- Functional: SSG one route per coming-soon entry, email capture submits successfully, success/error states
- Non-functional: themed by `characterSlug` field (which character art shown), no orphaned/dead-end pages

## Architecture
- `app/(marketing)/coming-soon/[slug]/page.tsx` — server component, SSG
- `generateStaticParams` from `getComingSoonPages()` filtered by `enabled === true` (or `enabled === false` since these are "coming soon")
- Email form is client component, posts to `/api/newsletter` w/ tag `coming-soon-{slug}` (segments signups)
- 404 for unknown slugs

## Related Code Files
- Create: `app/(marketing)/coming-soon/[slug]/page.tsx`
- Create: `app/(marketing)/coming-soon/[slug]/not-found.tsx`
- Create: `components/coming-soon/coming-soon-hero.tsx`, `components/coming-soon/email-capture-form.tsx`
- Modify: `content/coming-soon.json` (Phase 2 stub) — finalize copy

## Implementation Steps
1. `generateStaticParams`: read coming-soon entries, return slugs
2. `generateMetadata({ params })`: per-slug title, description, OG image
3. Page renders `ComingSoonHero` (character art via `characterSlug` lookup, title, tagline)
4. `EmailCaptureForm`: email input, submit → POST `/api/newsletter` w/ tag = `coming-soon-{slug}`
5. Form states: idle / submitting / success ("You're on the list!") / error ("Something went wrong, try again")
6. Themed background (CSS vars from character accent)
7. Footer link to "Back to home"
8. Test: each coming-soon route loads, form submits, ConvertKit receives tagged contact

## Success Criteria
- [ ] All coming-soon routes statically built
- [ ] Each page shows correct themed character art
- [ ] Email form submits and shows success state
- [ ] ConvertKit receives email w/ correct `coming-soon-{slug}` tag
- [ ] Invalid email rejected client-side + server-side (Zod)
- [ ] 404 for unknown slugs
- [ ] Lighthouse perf ≥ 90

## Risk Assessment
- ConvertKit tag taxonomy sprawl — document tagging convention in `lib/content/schemas.ts` comments
- Form spam — add basic rate limit (Phase 8 concern) + honeypot field
- Email validation client-only is bypassable — server (Phase 8) re-validates with Zod
- Slug collision w/ real future routes — namespace under `/coming-soon/` so safe
