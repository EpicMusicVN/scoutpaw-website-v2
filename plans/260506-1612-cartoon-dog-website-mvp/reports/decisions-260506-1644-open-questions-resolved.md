---
type: decisions
date: 2026-05-06
slug: open-questions-resolved
status: locked
---

# Decisions Log — Open Questions Resolved

Round of clarifications after plan was scaffolded. All architectural blockers cleared. Build can start with mocks/stubs.

## Brand Identity (from `assets/banner/content.docx`)

| Field | Value |
|---|---|
| Name | ScoutPaw |
| Full | ScoutPaw TV |
| Tagline | "We're here to keep the pack company" |
| Mission | Visual + musical companions for dogs ("your pup's day") — gentle sounds, colorful stories |
| Audience | DUAL — dogs viewing + pet-parents reading/buying |

## Audience Pivot (Critical)

Originally framed Bluey-style (kids). Banner copy reveals **dogs** are the primary viewer. Drives:
- Palette: dog-vision-friendly (blues/yellows/warm browns, no red/green pairings)
- Motion: calm/soothing (long durations, soft easing) — NOT bouncy Bluey-frenetic
- Audio: future ambient layer; reserve UI slot now (toggle, persist mute)
- Buyer = pet-parent → Shop CTA targets adults; Home is dog-watchable + parent-readable
- Contrast AA+ for parent readability, layered atop dog-friendly hues

## Character Mapping Locked

| Name | Breed | Image | Accent |
|---|---|---|---|
| Buddy | Golden Retriever | `golden-2.png` | `#FFB627` marigold |
| Max | Husky | `husky-bg.png` | `#5BC0EB` ice blue |
| Bella | Collie | `collie-bg.png` | `#9C6644` rust |
| Oscar | Corgi | `corgi-bg.png` | `#F4A261` peach |
| Rocky | Poodle | `poodle-bg.png` | `#B8A1D9` lavender |

Saved to `content/characters.json`. Bios/taglines/funFacts marked TODO — placeholder copy generated at implementation time.

## Coming Soon Pages Locked

`watch`, `games`, `activities`, `about` — saved to `content/coming-soon.json` w/ themed character per slug.

## Decision Matrix

| Topic | Decision | Notes |
|---|---|---|
| Analytics | GA4 | Free; cookie banner required (EU compliance) |
| Newsletter strategy | Single ConvertKit list, tags per source | Tags: `home-newsletter`, `coming-soon-{slug}` |
| Brand colors | Derived (dog-vision palette) | Saved in `content/site-config.json`; user can swap |
| Legal pages | Skipped MVP | RISK: collecting emails w/o privacy policy is non-compliant in EU/CA — flag before public launch |
| Shopify | Not set up → mock mode | `SHOPIFY_MODE=mock` env, fixture data, swap to `live` later |
| ConvertKit | Not set up → stub mode | `NEWSLETTER_MODE=stub` env, log + 200, swap to `live` later |
| Domain | Vercel default URL | Custom domain = post-MVP; DNS step removed from Phase 10 |

## Asset Inventory (Confirmed)

```
D:\works\emvn\scoutpaw-v2\assets\
├── banner\banner.png            5.8MB  (needs web optimization)
├── banner\content.docx          banner copy (consumed → site-config.json)
├── characters\
│   ├── golden-2.png             2.2MB → Buddy
│   ├── husky-bg.png             3.9MB → Max
│   ├── collie-bg.png            2.2MB → Bella
│   ├── corgi-bg.png             2.4MB → Oscar
│   └── poodle-bg.png            1.8MB → Rocky
├── logo\full-logo.png           1.6MB
├── logo\text-logo.png           265KB
└── shop\promotion.png           2.2MB  (use as mock product hero)
```

**Action item for Phase 1:** copy `assets/` into `public/assets/` (or symlink); run image optimization pass (next/image will handle sizing/format, but originals can be 50%+ smaller via lossy WebP pre-conversion).

## Plan Updates Applied

- `plan.md` → Overview rewritten (audience, brand), External Services table replaces Dependencies
- `phase-03-shared-ui.md` → Audience-Driven Design block added, full palette specified
- `phase-05-shop-page.md` → Mock-mode env flag, `mock-products.json` fixture
- `phase-08-newsletter-api.md` → Stub-mode wrapper, `NEWSLETTER_MODE` env flag
- `phase-09-analytics-perf.md` → GA4 locked, cookie banner step added
- `phase-10-deploy.md` → Custom domain step removed, env vars updated to mode flags

## Remaining Placeholders (Non-Blocking)

User can fill these directly in `content/*.json` whenever ready:

1. **Character bios + taglines + funFacts** — `content/characters.json` (15 TODO fields total)
2. **YouTube channel URL** — `content/site-config.json#social[0].url`
3. **3 featured video IDs + titles** — `content/videos.json`
4. **Optional**: brand colors override if existing brand guide exists

## Outstanding Compliance Risk

Per "skip legal pages" decision, collecting newsletter emails w/o:
- Privacy policy URL
- Cookie consent banner
- Clear data-handling disclosure

…is non-compliant in EU (GDPR), UK, and California (CCPA). Acceptable for soft/closed launch. **Block public launch on adding privacy page + cookie banner.** Captured in `phase-09` (cookie banner) and as a Phase 10 manual gate.
