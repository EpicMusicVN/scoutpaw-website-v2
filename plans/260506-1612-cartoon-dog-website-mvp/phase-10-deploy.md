---
phase: 10
title: Deploy
status: completed
priority: P1
effort: 2h
dependencies:
  - 4
  - 5
  - 6
  - 7
  - 8
  - 9
---

# Phase 10: Deploy

## Overview
Ship to Vercel production on default `*.vercel.app` URL (custom domain post-MVP). Configure env vars, smoke-test all routes, verify GA4 + cookie banner, validate Shop mock + Newsletter stub flows. Shopify webhook + custom domain are deferred until services are live.

## Requirements
- Functional: site live on production domain, all 4 main routes (Home, Shop, Character[5], ComingSoon[N]) reachable, Buy Now/Newsletter submits work
- Non-functional: HTTPS, security headers (CSP, X-Frame-Options, Referrer-Policy), 99.9% uptime via Vercel

## Architecture
- Vercel project linked in Phase 1
- Production env vars set via Vercel dashboard (Shopify, ConvertKit, analytics)
- Shopify webhook → `/api/revalidate` triggers `revalidatePath('/shop')` on product update
- Custom domain → DNS A/CNAME records (per Vercel instructions)
- `next.config.ts` security headers config

## Related Code Files
- Create: `app/api/revalidate/route.ts` — receives Shopify webhook, validates HMAC, calls `revalidatePath`
- Modify: `next.config.ts` — security headers (CSP, etc.)
- Create: `docs/deployment.md` — runbook (env vars, DNS, webhook setup)
- Create: `vercel.json` (only if needed for redirects/rewrites)

## Implementation Steps
1. Set production env vars in Vercel: `SHOPIFY_MODE=mock` (until live), `NEWSLETTER_MODE=stub` (until live), `NEXT_PUBLIC_GA_ID` (when GA account exists), `REVALIDATE_SECRET` (placeholder until Shopify webhook needed)
2. Configure security headers in `next.config.ts`:
   - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
   - `X-Frame-Options`: `DENY`
   - `X-Content-Type-Options`: `nosniff`
   - `Referrer-Policy`: `strict-origin-when-cross-origin`
   - CSP: `default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' https://plausible.io; ...`
3. Build `/api/revalidate` route — validates Shopify webhook HMAC, calls `revalidatePath('/shop')`
4. Register Shopify webhook for `products/update`, `products/create`, `products/delete` → POST `https://{site}/api/revalidate`
5. Push to main, Vercel auto-deploys preview, promote to production
6. Configure custom domain + DNS (A or CNAME records per Vercel)
7. Verify HTTPS cert auto-provisioned
8. Smoke-test checklist:
   - Home loads, all images render, motion plays
   - Character cards link correctly
   - Shop products load, Buy Now opens Shopify in new tab
   - Each Character detail page loads
   - Each Coming Soon page loads, email capture submits → ConvertKit confirms
   - Newsletter form on Home submits → ConvertKit confirms
   - Analytics shows pageviews
9. Monitor Vercel + Plausible for 24h post-launch

## Success Criteria
- [ ] Production URL reachable over HTTPS
- [ ] All routes return 200
- [ ] Buy Now → real Shopify URL verified
- [ ] Newsletter signup → real ConvertKit subscriber verified
- [ ] Coming Soon signups → tagged ConvertKit subscribers verified
- [ ] Shopify webhook fires + revalidate works (test by changing a product, refresh after 30s)
- [ ] Lighthouse perf ≥ 90 on production URL
- [ ] Security headers present (verify via `securityheaders.com`)
- [ ] DNS resolves on custom domain

## Risk Assessment
- DNS propagation delay — schedule launch window, lower TTL beforehand
- Webhook HMAC verification fail — test in preview env first, log raw header for debug
- CSP too strict breaks Plausible/YouTube — test thoroughly in preview, allow specific origins
- Production env var typo — use Vercel "Pull" CLI to verify locally before deploying
- Shopify token compromise — store in Vercel encrypted env, rotate immediately if leaked
- Cold start latency — Vercel Edge Functions if `/shop` SSR cold-starts feel slow

## Post-Launch Followups (NOT in MVP)
- Monitor Plausible for high-traffic hours, set perf alerts
- Review Coming Soon signup volume → prioritize which page to build next
- Plan CMS migration (Sanity) — schedule when content edits become frequent
