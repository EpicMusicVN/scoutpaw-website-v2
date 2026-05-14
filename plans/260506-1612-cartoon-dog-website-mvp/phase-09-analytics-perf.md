---
phase: 9
title: Analytics & Perf
status: completed
priority: P2
effort: 3h
dependencies:
  - 4
  - 5
---

# Phase 9: Analytics & Perf

## Overview
Wire analytics (Plausible recommended, GA4 fallback), enforce perf budgets via bundle analyzer, run Lighthouse CI gates, audit images, lazy-load motion deps. Gate the MVP launch on Lighthouse ≥ 90 across Home + Shop.

## Requirements
- Functional: pageviews tracked, Buy Now click tracked as conversion event, newsletter submit tracked
- Non-functional: Lighthouse perf/a11y/SEO ≥ 90; initial JS ≤ 200KB; CLS < 0.1; LCP < 2.5s

## Architecture
- Analytics: single script tag in `app/layout.tsx` (Plausible) OR `next/third-parties` Google Analytics
- Custom events: `plausible('BuyNowClick', { props: { product } })` and `plausible('NewsletterSubmit')`
- Bundle analyzer: `ANALYZE=true pnpm build` outputs `.next/analyze/`
- Lighthouse CI: `@lhci/cli` w/ config asserting min scores; run in CI (Phase 10) and pre-deploy

## Related Code Files
- Modify: `app/layout.tsx` — analytics script
- Modify: `components/shop/product-card.tsx` — Buy Now event
- Modify: `components/coming-soon/email-capture-form.tsx`, `components/home/newsletter-cta.tsx` — submit events
- Create: `lib/analytics/track.ts` — typed wrapper around `window.plausible` w/ no-op SSR fallback
- Create: `.lighthouserc.json` — Lighthouse CI config
- Create: `.github/workflows/lighthouse.yml` (or Vercel monitoring) — optional

## Implementation Steps
1. Use **GA4** (decision locked). Use `@next/third-parties/google` for `<GoogleAnalytics gaId={...}>` — handles loading + correct strategy automatically
2. **Cookie consent**: GA4 requires consent in EU. Implement minimal banner gating GA load (Vercel `geolocation` headers OR universal opt-in banner). Document in `docs/deployment.md`. Skipping legal pages does NOT skip this banner
3. Build `track()` helper — typed event names, SSR-safe (no-op if `window` undefined)
4. Instrument:
   - Home: `Hero CTA Click`, `Character Card Click`, `YouTube Play`
   - Shop: `BuyNowClick` w/ product handle prop
   - Forms: `NewsletterSubmit`, `ComingSoonSubmit` w/ slug prop
5. Run `ANALYZE=true pnpm build` — review bundle map, identify > 50KB chunks
6. Optimize:
   - Lazy-load Lottie via `dynamic(() => import(...), { ssr: false })`
   - Verify Framer Motion code-split
   - Check `next/image` config covers all remote sources
7. Add `.lighthouserc.json` w/ asserts: perf ≥ 90, a11y ≥ 95, seo ≥ 90, best-practices ≥ 90
8. Run Lighthouse CI locally, fix violations
9. Document perf budget + how to view bundle analyzer in `docs/code-standards.md` (per documentation-management.md)

## Success Criteria
- [ ] Plausible/GA4 dashboard shows pageview after deploy
- [ ] Buy Now click event recorded
- [ ] Newsletter submit event recorded
- [ ] `ANALYZE=true pnpm build` produces report; initial JS ≤ 200KB
- [ ] Lighthouse Home perf ≥ 90, a11y ≥ 95
- [ ] Lighthouse Shop perf ≥ 90, a11y ≥ 95
- [ ] CLS < 0.1, LCP < 2.5s on both pages

## Risk Assessment
- Plausible script blocked by some adblockers — acceptable; use proxy via `/api/event` if measurement loss is critical (post-MVP)
- Lighthouse CI flakiness (network variance) — run 3x median in CI
- Lottie lazy-load creates layout shift — reserve fixed dimensions on placeholder
- GA4 cookie banner / consent — only required in EU; gate via geo-IP if EU traffic significant (post-MVP)
