---
name: seo-schema-env-coupling
description: SEO/schema.org output correctness in scoutpaw-v2 is coupled to env vars (R2 base, SITE_URL, SHOPIFY_MODE) and canonical host consistency
metadata:
  type: project
---

scoutpaw-v2 SEO/AEO implementation (lib/seo/, app/robots|sitemap|manifest.ts).

**Fact:** schema.org `logo`/`image` and PWA manifest icon resolve via `assetUrl()`,
which returns a RELATIVE `/assets/...` path when `NEXT_PUBLIC_R2_BASE_URL` is unset.
Google requires ABSOLUTE URLs for Organization.logo. In the working env R2 base is
set so output is absolute (`https://images.scoutpaw.tv/...`) — correctness is
env-dependent, not guaranteed by code.

**Fact:** `getSiteUrl()` (lib/seo/site-url.ts) throws in prod (`VERCEL_ENV=production`)
if `NEXT_PUBLIC_SITE_URL` unset. Intended fail-fast. Locally falls back to
`http://localhost:3000`. Does not break local build/lint.

**Fact:** Shop Product schema gate is `(SHOPIFY_MODE ?? "mock") !== "mock"` in
shop/page.tsx, complement of `mode === "mock"` in lib/shopify/get-products.ts —
consistent. Live-mode fetch failure returns `[]`, so no broken/empty Product schema.

**Why:** these are the load-bearing correctness conditions for the SEO work — bugs
here are invisible in CI (tsc/lint pass) and only surface as invalid schema in prod.

**How to apply:** when reviewing SEO/schema changes here, check (1) every schema URL
field is absolute, (2) canonical host is consistent across NEXT_PUBLIC_SITE_URL,
llms.txt, and any hardcoded URLs — currently llms.txt uses `www.scoutpaw.tv` while
sitemap/canonical resolve to apex `scoutpaw.tv` (mismatch). See [[build-verification-gate]].
