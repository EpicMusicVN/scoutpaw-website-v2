---
phase: 5
title: Validation & QA
status: completed
priority: P2
effort: 2h
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Validation & QA

## Overview
End-to-end verification that all SEO/AEO surfaces are live and valid, plus the one ops task
that can't be done in-repo: converting the apex→www 307 to a 308 permanent redirect.

## Requirements
- All endpoints return 200 with valid bodies; all JSON-LD validates with 0 errors.
- Apex→www redirect is 308 permanent.
- Re-score against the original audit to confirm targets (SEO ~85, AEO ~70).

## Architecture
Validation only — no new app code. Uses curl, Google Rich Results Test, Schema.org validator.
The 308 redirect is a **Vercel dashboard** change (Project → Domains → redirect config), since
the repo has no `middleware.ts`/`vercel.json` controlling it.

## Related Code Files
- None (verification). Optionally add a `vercel.json` redirect **only if** the team prefers
  repo-managed redirects over dashboard config — decide with user.

## Implementation Steps
1. Build/serve and curl: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/llms.txt` → all 200.
2. Grep rendered HTML for `application/ld+json`; paste each block into Schema.org validator.
3. Google Rich Results Test on: home (Organization/WebSite/FAQPage), a watch page (VideoObject),
   shop in live mode (Product), a character page (BreadcrumbList).
4. Verify canonical tags resolve to `www.scoutpaw.tv` on every route; check apex and trailing-slash variants.
5. **Ops:** in Vercel dashboard, set apex `scoutpaw.tv` → `www.scoutpaw.tv` as **308 permanent**
   (currently 307). Re-check with `curl -sI https://scoutpaw.tv/`.
6. Confirm OG/Twitter render correctly (e.g. social debugger or manual head inspection).
7. Update `docs/project-changelog.md` with the SEO/AEO additions.

## Success Criteria
- [ ] All 4 endpoints 200 + valid.
- [ ] Every JSON-LD type passes Google Rich Results Test (0 errors).
- [ ] Canonicals correct sitewide; no apex/www or trailing-slash duplication.
- [ ] `curl -sI https://scoutpaw.tv/` shows **308** to www.
- [ ] No mock prices in any shipped Product schema; `/top-picks` has no Offer.
- [ ] Changelog updated.

## Risk Assessment
- **Risk:** 308 redirect change requires Vercel access. *Mitigation:* if user lacks dashboard
  access, ship `vercel.json` redirect instead (`permanent: true`) and document.
- **Risk:** Rich Results Test needs a public URL; local changes not yet deployed. *Mitigation:*
  validate JSON-LD locally with Schema.org validator (accepts pasted markup) pre-deploy; run
  Rich Results Test post-deploy.

## Next Steps
- After merge + deploy: submit `sitemap.xml` in Google Search Console; request re-index of home.
- Monitor Search Console coverage + AI Overview appearance over following weeks.
