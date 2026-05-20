# ScoutPaw Codebase Overview

ScoutPaw TV — visual + musical companion brand for dogs (and pet-parents). Next.js 15 marketing site with Home + Shop MVP, themed Coming Soon placeholders, and a CMS-ready content layer.

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript strict + React 19
- **Styling**: Tailwind 3.4 + CSS variables (palette in `content/site-config.json`)
- **Motion**: Framer Motion 12 (lazy-loaded), `prefers-reduced-motion` respected
- **Content**: JSON files via Content Adapter pattern (Sanity-swap-ready)
- **Commerce**: Shopify Storefront API w/ mock-mode fallback
- **Newsletter**: Resend w/ stub-mode fallback
- **Analytics**: GA4 gated by cookie consent banner
- **Hosting**: Vercel (default `*.vercel.app` URL for MVP)

## Folder Structure

```
scoutpaw-v2/
├── app/
│   ├── api/newsletter/route.ts      # POST handler (stub or live Resend team-notification)
│   ├── characters/[slug]/           # SSG one page per character
│   ├── coming-soon/[slug]/          # SSG one page per disabled nav item
│   ├── shop/page.tsx                # ISR 5min, Shopify or mock
│   ├── layout.tsx                   # Root layout, fonts, nav, footer, consent
│   └── page.tsx                     # Home — hero + characters + videos + newsletter
├── components/
│   ├── analytics/cookie-consent.tsx # Banner + GA loader (post-consent only)
│   ├── characters/                  # CharacterCard, CharacterHero, FunFactsList
│   ├── coming-soon/                 # ComingSoonHero
│   ├── home/                        # Hero, CharacterShowcase, VideoGrid, NewsletterCTA
│   ├── motion/                      # FadeIn, Stagger, Wiggle (Framer wrappers)
│   ├── nav/                         # TopNav (w/ disabled-state), Footer
│   ├── shop/                        # ProductGrid, ProductCard, BuyNowButton, EmptyState
│   └── ui/                          # Button, Card primitives
├── content/                         # Source-of-truth JSON (Zod-validated)
│   ├── site-config.json             # Brand, palette, nav, social
│   ├── characters.json              # 5 characters
│   ├── coming-soon.json             # 4 placeholder pages
│   └── videos.json                  # Featured YouTube IDs (TODO placeholders)
├── lib/
│   ├── analytics/track.ts           # SSR-safe gtag wrapper
│   ├── content/                     # Adapter pattern (json → sanity swap)
│   ├── newsletter/                  # Stub + Resend transactional + rate limit
│   ├── shopify/                     # Storefront client + mock fallback
│   ├── theme/tokens.ts              # Animation easings/durations
│   └── utils/cn.ts                  # Tiny class joiner
└── public/assets/                   # Banner, character PNGs, logo, shop promo
```

## Content Adapter Pattern (Critical)

Components import from `@/lib/content` only — never from JSON or Sanity directly. Migration path:

1. Today: `CONTENT_SOURCE=json` → reads `content/*.json`, validates via Zod.
2. Tomorrow: implement `lib/content/sources/sanity-source.ts`, set `CONTENT_SOURCE=sanity`. Components do not change.

Zod schemas in `lib/content/schemas.ts` are the single source of truth — they convert mechanically into Sanity schema definitions.

## Mode Flags

External services aren't provisioned yet. Each one has a swap flag:

| Flag | Default | Live value |
|---|---|---|
| `SHOPIFY_MODE` | `mock` | `live` (when store + token ready) |
| `NEWSLETTER_MODE` | `stub` | `live` (when Resend ready) |
| `CONTENT_SOURCE` | `json` | `sanity` (post-MVP) |

## Audience Note

ScoutPaw targets **dogs viewing + pet-parents reading**. This drives:
- Dog-vision palette (blues, yellows, warm browns; avoids red/green pairings)
- Calm motion (long durations, soft easing — NOT bouncy/Bluey)
- Buyer = adult; Buy Now opens Shopify in new tab
- AA+ contrast for parent readability

## Outstanding TODOs

In `content/*.json`:
- Character bios + taglines + funFacts (15 fields)
- YouTube channel URL + 3 featured video IDs

Pre-public-launch:
- Privacy/Terms pages (compliance for email collection)
- Real Shopify store + Storefront token
- Real Resend API key + team notification inbox
