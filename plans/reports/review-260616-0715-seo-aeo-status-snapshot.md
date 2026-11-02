# SEO / AEO Status Snapshot — scoutpaw.tv

**Date:** 2026-06-16 · **Branch:** `feat/seo-aeo-remediation` · **Type:** status review (report only)
**Scope:** code + ops/content readiness · **Method:** snapshot vs documented plans (claims taken at face value, key facts spot-verified)

> TL;DR — **All code-controllable SEO/AEO work is shipped and wired.** Both plans (`260611-0509-seo-aeo-remediation`, `260611-0724-seo-aeo-code-max`) are `completed`. The entire remaining gap to "maxed" is **non-code**: copy, OG/logo assets, business facts, and ops config/submission. Nothing is code-blocked.

---

## 1 · Self-reported scores

| Surface | Pre-work | Now (claimed) | Ceiling w/o ops |
|---|---|---|---|
| Technical SEO | 62 | ~85–90 | ~90 |
| On-Page | 70 | ~90–92 | ~92 |
| AEO | 28 | ~70–82 | ~82 |

Remaining headroom to ~100 is content/ops, not code (per `ops-prep-checklist.md`).

---

## 2 · Shipped & verified (code)

**Technical foundation**
- `app/robots.ts` — allow all, disallow `/admin` + `/api/`, sitemap pointer, dynamic origin ✔
- `app/sitemap.ts` — static routes + dynamic characters/coming-soon from `lib/content` adapter; doubles as image sitemap ✔
- `app/manifest.ts` present ✔ (memory note: metadata routes must stay at app/ root, not in `(frontend)` group)
- `lib/seo/site-url.ts` — single origin source; **throws in prod if `NEXT_PUBLIC_SITE_URL` unset** (kills wrong-domain canonicals) ✔
- `metadataBase` + canonicals via `alternates` set in root layout and per-page ✔

**Structured data** (`lib/seo/structured-data.ts` + `components/seo/json-ld.tsx`)
- Organization, WebSite (no SearchAction by design), VideoObject, Product+Offer, FAQPage, BreadcrumbList
- Cross-block `@id` entity linking (`#organization` / `#website`) — graph references byte-identical via helpers ✔
- Guards: VideoObject returns `null` w/o `uploadDate`; FAQ `null` on empty; ISO-8601 duration parser; absolute asset URLs
- Product schema gated to live Shopify mode (never ships mock prices) ✔
- Wired into: layout (Org+WebSite), home, watch, shop, characters, characters/[slug], coming-soon/[slug], top-picks

**AEO**
- `content/faq.json` (8 Q&A) + FAQ section + FAQPage schema ✔
- `public/llms.txt` present (1.2 KB) — **not tracked in either checklist; an extra AEO win already live**
- Visible breadcrumbs on detail pages + BreadcrumbList schema ✔

---

## 3 · Code observations (minor — found during snapshot, not blockers)

| # | Observation | Impact | Note |
|---|---|---|---|
| O1 | `public/llms.txt` is **static** — origin/links hardcoded, won't track `NEXT_PUBLIC_SITE_URL` like the generated routes do | Low | Risk of stale URL if domain/handle changes; consider generating it (`app/llms.txt/route.ts`) for DRY parity with robots/sitemap |
| O2 | `twitter:site` **omitted** (only `creator` set); X handle absent from `sameAs` | Med (social/entity) | Pure data gap — unblocks the moment Marketing supplies the handle (C1) |
| O3 | OG image reuses `banner.png` via `bannerOgImage()` — wrong 1200×630 ratio, no width/height declared | Med (share cards) | Code is ready; needs real assets (B1) |
| O4 | VideoObject `description` is templated (`"<title> — a calming video…"`) | Low-Med (AEO quality) | Google treats title≈description as thin; needs real per-video copy (A4) |
| O5 | Sitemap `lastModified` = build-time `now()` for all routes | Low | Real per-entity updated dates would improve freshness signals (C5) |

None of these are defects — each is a code-ready hook waiting on external data/assets.

---

## 4 · Remaining gaps (ops / content / config — the real backlog)

From `ops-prep-checklist.md`, grouped by owner. **All non-code.**

**A · Content (Copywriting/Marketing)** — highest ROI
- A1 Per-page unique titles + meta descriptions (current generic)
- A2 FAQ sign-off + expand 8 → 12–15 (needs vet/legal review for wellness claims)
- A3 Page-body depth (pages visual/thin; answer engines reward substance)
- A4 Real per-video descriptions
- A5 Image alt text coverage

**B · Assets (Design)**
- B1 OG share images ×7 (1200×630)
- B2 Square logo 512 + 192 (Org.logo / PWA / maskable)
- B3 Favicon/apple-touch full set confirm
- B4 Card render validation (X / FB debuggers) post-deploy

**C · Business facts (Ops/Marketing)**
- C1 X @handle → wires `twitter:site` + `sameAs` (O2)
- C2 Verify all social URLs resolve
- C3 Org details (founding date, contact point, address)
- C4 Confirm `SHOPIFY_MODE=live` + complete product data (optional aggregateRating)
- C5 Real content last-modified dates (O5)
- C6 **Target keyword list — upstream dependency for A1/A2/A3**

**D · Config/Access (DevOps/SEO)**
- D1 Prod `NEXT_PUBLIC_SITE_URL=https://www.scoutpaw.tv` (code throws if unset)
- D2 apex→www **308** permanent redirect (currently 307, lives in Vercel dashboard)
- D3 Google Search Console verify + submit sitemap
- D4 Bing Webmaster verify + submit (Bing powers ChatGPT search → direct AEO)
- D5 Post-deploy Rich Results + Schema validation on live URL

---

## 5 · Recommended sequence (no new code required)

1. **C6 keyword list** → unblocks all copy (A1/A2/A3). Single highest-leverage item.
2. **C1/C2/C3 + B2** → complete the entity graph (handle, verified socials, org facts, logo).
3. **B1 + A5** → share-card + a11y quality.
4. **A4/C4/C5** → structured-data richness.
5. **D1–D5** → config + submission; D1/D2 **before** public launch, D3/D4/D5 at/after deploy.

Diminishing returns past ~90. Two clusters move the needle most: **C6 → A1/A2/A3** (copy) and **B1** (OG images).

---

## 6 · Verdict

- **Code:** done, coherent, DRY (all SEO surfaces read the content adapter; survives the future Payload migration). No remediation needed; only optional polish (O1 generate llms.txt; O2–O5 are data-gated).
- **Launch-readiness blockers (must clear before public launch):** **D1** (prod site URL — hard throw) and **D2** (308 redirect). Everything else is quality/optimization, not blocking.
- **Biggest score lever:** the content track (C6 → A1–A3), owned outside engineering.

---

## Open questions
1. C3 — does ScoutPaw expose a public contact point/address, or stay digital-only?
2. C4 — will live products carry review/rating data (unlocks Product rich results) or skip `aggregateRating`?
3. A2 — who signs off dog-wellness FAQ claims (vet review) before ship?
4. O1 — worth converting `public/llms.txt` to a generated route for origin/DRY parity, or leave static?
