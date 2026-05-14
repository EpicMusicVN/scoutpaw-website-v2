---
type: brainstorm
date: 2026-05-06
slug: cartoon-dog-website-mvp
status: approved
---

# Brainstorm Report: Cartoon Dog Character Website (MVP)

## Problem Statement

Build a Bluey.tv-style brand website for cartoon dog characters from existing YouTube channel. MVP = Home + Shop. Other nav items = themed "Coming Soon" pages. Architecture must be CMS-ready for later expansion without rewrite.

## Requirements

**Functional**
- Home page: hero/banner, 5 character showcase, curated YouTube videos, newsletter capture
- Shop page: live Shopify products via Storefront API → Buy Now redirect to Shopify product URL
- Character detail pages (5x): bio, art, future-proofing schema
- "Coming Soon" themed placeholder pages per disabled nav item, with email capture
- Newsletter signup (ConvertKit)
- Analytics (Plausible or GA4)

**Non-functional**
- Bluey-level playful motion (parallax, character wiggles, Lottie idle loops)
- CMS-ready content layer (JSON now → Sanity/Payload later, no rewrite)
- Vercel deploy, ISR caching
- Initial JS budget < 200KB
- Kids/family-safe (no PII collection without parental gate)

**Assets provided**
- Banner, logo, 5 character PNGs

## Decisions Made

| Topic | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 + App Router + TS | Native Vercel, ISR, SSC, mature ecosystem |
| Styling | Tailwind + CSS vars | Fast iteration, themeable per character |
| Animation | Framer Motion + Lottie (lazy) | Bluey-level motion w/ perf budget |
| Content | JSON files via Content Adapter | KISS now, swap to CMS later w/o rewrite |
| Commerce | Shopify Storefront API (live) | Always synced, ISR every 5min |
| Newsletter | ConvertKit | Better DX than Mailchimp, free tier covers MVP |
| YouTube | Manually curated IDs in JSON | Editorial control, no API quota concerns |
| Hosting | Vercel | Native Next.js, edge cache |
| Coming Soon | Themed pages per nav item | Better engagement, captures launch emails |

## Approaches Evaluated

### A. Pure no-code (Webflow/Framer) — REJECTED
Pros: fastest launch, non-dev edits.
Cons: Shopify integration shallow, hard to extend, vendor lock, no real CMS adapter.

### B. Next.js + Sanity from day 1 — REJECTED for MVP
Pros: real CMS immediately, no migration later.
Cons: Sanity setup overhead, schema design adds 1-2 days, user explicitly wanted JSON-first.

### C. Next.js + JSON w/ Adapter Pattern — SELECTED
Pros: ships fast, zero infra cost for content, CMS-swap is mechanical (one file).
Cons: editor cannot edit content yet (acceptable for MVP).

## Architecture: Content Adapter Pattern (Critical Decision)

```
lib/content/
  adapter.ts          # interface ContentSource { getCharacters, getVideos, ... }
  schemas.ts          # Zod schemas — single source of truth
  sources/
    json.ts           # MVP: reads /content/*.json
    sanity.ts         # Future: drop-in (same interface)
  index.ts            # exports configured adapter via env
```

Components import only from `lib/content` — never JSON directly. Migration to Sanity = implement `sanity.ts` + flip env flag. Zod schemas convert mechanically to Sanity schema definitions.

## Folder Structure

```
scoutpaw-v2/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                     # Home
│   │   ├── characters/[slug]/page.tsx   # Detail
│   │   └── coming-soon/[slug]/page.tsx  # Placeholders
│   ├── shop/page.tsx                    # Shopify
│   ├── api/
│   │   ├── newsletter/route.ts          # ConvertKit proxy
│   │   └── revalidate/route.ts          # Shopify webhook
│   └── layout.tsx
├── components/
│   ├── characters/   # CharacterCard, Showcase, FloatingPaws
│   ├── home/         # Hero, VideoGrid, NewsletterCTA
│   ├── shop/         # ProductGrid, ProductCard
│   ├── nav/          # TopNav (Coming Soon disabled state)
│   └── ui/           # primitives
├── content/          # JSON (characters, videos, coming-soon, site-config)
├── lib/
│   ├── content/      # adapter
│   ├── shopify/      # Storefront client
│   └── analytics/
└── public/assets/    # banner, logo, character PNGs
```

## Page Scope

**Home `/`**
Hero (banner + animated character intro) → 5 character showcase (hover wiggle) → curated YouTube grid (3–6 vids via lite-youtube-embed) → newsletter CTA → footer

**Shop `/shop`**
Storefront API products → ProductCard (image, title, price, **Buy Now → Shopify product URL** target=_blank) → ISR 5min revalidate

**Characters `/characters/[slug]`** (5 routes, SSG)
Big art → bio → fun facts → "see in videos" → home link

**Coming Soon `/coming-soon/[slug]`**
Themed placeholder (character art + tagline + email capture). Slugs configured in `coming-soon.json`.

## Animation Strategy

- Hero: Framer stagger entrance, Lottie paws background loop
- Character cards: hover tilt + wiggle (Framer)
- Scroll: parallax background layers (CSS scroll-driven, Framer fallback)
- Page transitions: Next.js `loading.tsx` + soft fade
- Lazy-load Framer + Lottie chunks; CSS-first where viable

## Integrations

| Service | Purpose | Method |
|---|---|---|
| Shopify | Live products | Storefront API (read-only token in env) |
| YouTube | Embeds | Static IDs in JSON, `lite-youtube-embed` |
| ConvertKit | Newsletter | API proxy via `/api/newsletter` (server-side key) |
| Plausible/GA4 | Analytics | Script tag in root layout |

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Heavy motion = bundle bloat | Perf budget in CI, lazy-load Framer/Lottie, CSS-first |
| Shopify API downtime/rate limit | ISR 5min cache + last-good fallback, "loading" skeletons |
| Content sprawl pre-CMS | Strict Zod schemas day 1 (become Sanity schemas later) |
| YouTube iframe perf | `lite-youtube-embed` (defers iframe until click) |
| Kids/COPPA | No PII collection, age-gate newsletter, privacy page post-MVP |
| Shopify product URL changes | Use product handle, not ID — handles are stable |

## YAGNI — Explicitly Excluded from MVP

- Auth / accounts
- Cart / checkout (Shopify owns)
- Admin panel (no CMS yet)
- Search
- i18n
- Blog / posts
- Server-side cart sync

## Success Metrics

- Lighthouse score ≥ 90 (perf, a11y, SEO) on Home + Shop
- Initial JS bundle ≤ 200KB
- Shop page TTFB < 800ms (ISR cache hit)
- Newsletter signup flow < 3 clicks
- Buy Now → Shopify redirect < 200ms
- Zero CMS migration code rewrite (validate via mock `sanity.ts` adapter)

## Implementation Considerations

- Define Zod schemas FIRST — drives both JSON shape and future CMS schema
- Component library independent of content source (props in, no `getStaticProps` inside leaves)
- All Shopify calls server-side (Storefront token never in client bundle)
- Image optimization via `next/image` with proper `sizes` for character PNGs
- Set up perf budget (`@next/bundle-analyzer`) in CI from start
- Coming Soon slugs configurable in JSON — flip to real route by enabling flag

## Next Steps

1. Run `/ck:plan` to break MVP into phases (env setup → content layer → shared UI → Home → Shop → Coming Soon → analytics → deploy)
2. Drop banner/logo/character PNGs into `public/assets/`
3. Get Shopify Storefront API token + ConvertKit form ID
4. Decide Plausible vs GA4 before deploy

## Unresolved Questions

1. Domain name + DNS — registrar already chosen?
2. Final list of "Coming Soon" nav items (Watch, Games, Activities, About, …)?
3. Character names + bios — provided or write placeholder copy?
4. Shopify store URL + Storefront access token availability for build?
5. Plausible (paid, privacy) vs GA4 (free, less private) — which?
6. Email-gated Coming Soon: single global list in ConvertKit, or per-section tags?
7. Brand color palette / typography — locked or to be defined?
8. Legal pages (Privacy, Terms) — copy source or boilerplate-ok for MVP?
