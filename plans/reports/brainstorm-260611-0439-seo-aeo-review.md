# Brainstorm Report — SEO & AEO Review: scoutpaw.tv

Date: 2026-06-11 | Source: live audit + codebase review | Outcome: plan `260611-0509-seo-aeo-remediation`

## Problem
Assess SEO + AEO (answer-engine optimization) of https://scoutpaw.tv and define remediation.

## Method
- Live rendered `<head>` (apex→www follow), endpoint probes (`/robots.txt`, `/sitemap.xml`, `/llms.txt`).
- Source review: `app/(frontend)/` metadata, `lib/content` adapter, `lib/shopify`, `next.config.ts`.

## Scores
| Dimension | Score |
|---|---|
| Technical SEO | 62/100 |
| On-page SEO | 70/100 |
| AEO | 28/100 |

## Findings
**Working:** SSR (crawlable HTML), `lang="en"`, title+template, meta description, OG, Twitter
card, per-page metadata on most routes, semantic headings, skip-link, `next/image`, font preload.

**Critical gaps:**
1. No `robots.txt` (404).
2. No `sitemap.xml` (404).
3. **Zero JSON-LD structured data** — biggest AEO miss.
4. No canonical tags → apex/www + trailing-slash duplication risk.
5. apex→www is 307 (should be 308 permanent).

**AEO weaknesses:** no schema.org entities (Organization/WebSite/VideoObject/Product/Breadcrumb/
FAQ), no `llms.txt`, no FAQ/Q&A content, no `sameAs`, text-thin pages.

**Fragility:** `layout.tsx:28` falls back to `scoutpaw.vercel.app` if `NEXT_PUBLIC_SITE_URL` unset.

## Approach chosen
P0+P1+P2 remediation, all dynamic surfaces reading the `lib/content` adapter (works for
json-source now + payload-source later). 5-phase plan.

## Key constraints surfaced
- Shop Product schema gated to `SHOPIFY_MODE !== "mock"` (no fake prices).
- `/top-picks` = Amazon Associates → no price-bearing schema (ToS, prices need PA-API).
- WebSite schema omits SearchAction (no query-URL search).
- 308 redirect = Vercel dashboard ops task (no middleware/`vercel.json` in repo).
- FAQ copy drafted by plan, user reviews before merge.

## Targets after remediation
SEO ~85, AEO ~70.

## Unresolved questions
- Vercel dashboard access for the 308 change? (else ship `vercel.json`).
- Exact `twitter:site` handle (pull from site-config social or confirm).
