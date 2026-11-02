# ScoutPaw TV — SEO/AEO Ops Prep Checklist (Path to 100)

> The code is shipped (Technical SEO 85, On-Page 90, AEO 70). The remaining gap to **100/100/100** is **content, assets, and information only the Ops / content / design team can supply**. Tick each item; each is tagged with the score it lifts and who owns it.
>
> Companion visual: `seo-audit-dashboard.html`. Plan: `260611-0509-seo-aeo-remediation`.

---

## A · Content — copywriting / marketing

| # | Task | Detail | Lifts | Owner |
|---|------|--------|-------|-------|
| A1 | Per-page SEO titles + meta descriptions | Unique, keyword-targeted copy for all ~10 routes (home, characters, shop, watch, top-picks, privacy, terms, character template, coming-soon template). Current values are functional but generic (e.g. "ScoutPaw privacy policy"). Keep titles ≤60 chars, descriptions 140–160 chars. | On-Page | Content |
| A2 | FAQ sign-off + expansion | Approve the 8 drafted Q&A in `content/faq.json` (factual accuracy, **no unverifiable medical claims**). Expand to 12–15 entries from real search queries (see C6). | AEO | Content + Vet/Legal review |
| A3 | Page-body depth | Add substantive factual copy to key pages — what calming audio is, how it helps dogs, brand story, character bios. Answer engines + LLMs reward depth; pages are visual/thin today. | AEO | Content |
| A4 | Per-video descriptions | Real description text per video. `VideoObject` currently echoes the title (low-quality signal). Source from YouTube metadata or hand-author. | AEO | Content |
| A5 | Image alt text | Descriptive alt for every content image + OG image. | On-Page / a11y | Content + Design |

- [ ] A1 · Per-page titles + descriptions
- [ ] A2 · FAQ sign-off + expansion
- [ ] A3 · Page-body depth
- [ ] A4 · Per-video descriptions
- [ ] A5 · Image alt text

---

## B · Assets — design

| # | Task | Detail | Lifts | Owner |
|---|------|--------|-------|-------|
| B1 | OG share images (1200×630) | One per page template: home, characters, shop, watch, top-picks, character, coming-soon. Today reuses `banner.png` (wrong ratio, no width/height declared). Deliver as PNG/JPG, <8MB, text-safe margins. | Social (OG/Twitter) | Design |
| B2 | Square logo | 512×512 **and** 192×192 PNG (transparent + solid) for `Organization.logo`, PWA manifest, and a maskable variant. | Structured Data / PWA | Design |
| B3 | Favicon / apple-touch coverage | Confirm full icon set (16/32/180/512). | Technical | Design |
| B4 | Card render check | Validate OG images in X Card Validator + Facebook Sharing Debugger after deploy. | Social | Design + Ops |

- [ ] B1 · OG share images ×7
- [ ] B2 · Square logo 512 + 192
- [ ] B3 · Favicon / apple-touch set
- [ ] B4 · Card render validation

---

## C · Data & Information — business facts

| # | Task | Detail | Lifts | Owner |
|---|------|--------|-------|-------|
| C1 | X (Twitter) @handle | Account **exists** — provide the handle. Dev wires `twitter:site` (currently omitted) + adds to `content/site-config.json` social array (`sameAs`). | Social + Schema | Marketing → Dev |
| C2 | Verify social URLs live | Confirm YouTube `@ScoutPaw`, IG `scoutpawtv`, TikTok `@scoutpawtv`, FB `ScoutPawTV` (+ new X) all resolve. No dead/placeholder links in `sameAs`. | Structured Data | Marketing |
| C3 | Organization details | Founding date, contact point (support email or URL), optional postal address / locale for richer `Organization` schema (enables knowledge-panel signals). | Structured Data | Ops / Business |
| C4 | Live product data | Confirm `SHOPIFY_MODE=live` in prod; every product has description, image, and availability. Optional: aggregate rating / reviews to unlock Product rich results. | Structured Data | Ops + Shopify |
| C5 | Content last-modified dates | Provide real "updated" dates per character / video / page so sitemap `lastmod` is accurate (currently build-time `now`). | Technical | Content + Dev |
| C6 | Target keyword list | Keyword research per page (search volume + intent). Feeds A1, A2, A3. The upstream dependency for most On-Page/AEO gains. | On-Page + AEO | SEO / Marketing |

- [ ] C1 · X @handle provided
- [ ] C2 · Social URLs verified
- [ ] C3 · Organization details
- [ ] C4 · Live product data confirmed
- [ ] C5 · Content last-modified dates
- [ ] C6 · Target keyword list

---

## D · Config & Access — ops / devops

| # | Task | Detail | Lifts | Owner |
|---|------|--------|-------|-------|
| D1 | Prod site URL | Set `NEXT_PUBLIC_SITE_URL=https://www.scoutpaw.tv` in Vercel (prod). Local uses apex; prod must be the www canonical so canonical/sitemap/robots/schema/llms.txt all align. **Code throws in prod if unset.** | Technical | Ops / DevOps |
| D2 | apex → www 308 redirect | Currently 307 (temporary). Set permanent 308 in Vercel dashboard (no middleware/`vercel.json` in repo). | Technical | DevOps |
| D3 | Google Search Console | Verify property, submit `sitemap.xml`, monitor Coverage + Enhancements. | Technical | SEO / Ops |
| D4 | Bing Webmaster Tools | Verify + submit sitemap. Bing powers ChatGPT search — direct AEO value. | AEO | SEO / Ops |
| D5 | Post-deploy validation | Run Google Rich Results Test + Schema.org validator on the live URL for every JSON-LD type. | all | Dev + Ops |

- [ ] D1 · Prod `NEXT_PUBLIC_SITE_URL` = www
- [ ] D2 · apex→www 308 redirect
- [ ] D3 · Google Search Console + sitemap
- [ ] D4 · Bing Webmaster + sitemap
- [ ] D5 · Post-deploy Rich Results validation

---

## Dependency order (suggested)
1. **C6 (keywords)** → unblocks A1/A2/A3 (all copy depends on it).
2. **C1/C2/C3 (entity data)** + **B2 (logo)** → complete the entity graph.
3. **B1/A5 (OG images + alt)** → social/share quality.
4. **A4/C4/C5 (video, product, dates)** → structured-data richness.
5. **D1–D5 (config + submission)** → can run in parallel; D1/D2 before public launch, D3/D4/D5 at/after deploy.

## Reality check
- "100/100" is aspirational — there is no single authoritative SEO/AEO score. Treat 100 as "every controllable signal is maxed." Diminishing returns past ~90; the highest-ROI items are **C6 → A1/A2/A3** (copy) and **B1** (OG images).
- A few items need ongoing upkeep (C5 dates, A2/A3 fresh content), not one-time setup.

## Open questions
- C3: does ScoutPaw have a public contact point / address to expose, or stay digital-only?
- C4: will live Shopify products carry review/rating data, or skip `aggregateRating`?
- A2: who is the approver for dog-wellness claims (vet review) before FAQ ships?
