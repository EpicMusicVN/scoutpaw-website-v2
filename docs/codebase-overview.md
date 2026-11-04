# ScoutPaw Codebase Overview

ScoutPaw TV — visual + musical companion brand for dogs (and pet-parents). Next.js 15 marketing site with Home + Shop MVP, themed Coming Soon placeholders, and a CMS-ready content layer.

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript strict + React 19
- **Styling**: Tailwind 3.4 + CSS variables (palette in `content/site-config.json`); heading typography utilities (`.heading-gradient-cool|warm|tri`, `.text-shadow-soft|warm-glow`) defined in `app/globals.css`
- **Motion**: Framer Motion 12 (lazy-loaded), `prefers-reduced-motion` respected
- **Content**: JSON files via Content Adapter pattern (Sanity-swap-ready)
- **Commerce**: Shopify Storefront GraphQL API via raw `fetch` (server-only) w/ mock-mode fallback; ISR via `revalidate` tag `shopify-products`
- **Newsletter**: Resend w/ stub-mode fallback
- **Analytics**: GA4 gated by cookie consent banner
- **Hosting**: Vercel (default `*.vercel.app` URL for MVP)

## Folder Structure

```
scoutpaw-v2/
├── app/
│   ├── api/newsletter/route.ts      # POST handler (stub or live Resend team-notification)
│   ├── characters/page.tsx          # Static index page (FullBleedHero + character map wrapped in zig-zag card grid `space-y-12 md:space-y-20` + NewsletterCTA)
│   ├── characters/[slug]/           # SSG one page per character
│   ├── coming-soon/[slug]/          # SSG one page per disabled nav item
│   ├── shop/page.tsx                # async RSC — ExploreProducts tiles + ProductGrid (live Shopify Storefront) + AboutShop
│   ├── top-picks/page.tsx           # SSG, FullBleedHero + TopPicksBoard (8 Amazon affiliate products + disclosure) + CloudDivider + NewsletterCTA
│   ├── layout.tsx                   # Root layout, fonts, nav, footer, consent
│   └── page.tsx                     # Home — hero + characters + videos + newsletter
├── components/
│   ├── analytics/cookie-consent.tsx # Banner + GA loader (post-consent only)
│   ├── characters/                  # CharacterCarousel + CharacterCarouselTrack (Embla carousel, 3 visible + peeking 4th with CSS mask dissolve), CharacterCarouselCard (white content card + pose overflow), CharacterCarouselArrows (nav), CharacterCarouselAmbient (faint decor), CharacterDetailCard (art-dominant split), CharacterSceneBackdrop, CharacterSceneDecor, CharacterAtmosphere, CharacterMotif, CharacterQuote
│   ├── coming-soon/                 # ComingSoonHero
│   ├── home/                        # Hero, CharacterShowcase, VideoGrid, NewsletterCTA
│   ├── motion/                      # FadeIn, Stagger, Wiggle (Framer wrappers)
│   ├── nav/                         # TopNav (w/ disabled-state), Footer
│   ├── shop/                        # ProductGrid, ProductCard, BuyNowButton, EmptyState
│   ├── top-picks/                   # TopPicksBoard (category filter + deal blocks + accordion offer grid), DealBlock (featured spotlight + toggle), OfferCard (discount badge + rating + popularity + CTA)
│   └── ui/                          # Button, Card, FilterChip primitives
├── content/                         # Source-of-truth JSON (Zod-validated)
│   ├── site-config.json             # Brand, palette, nav (now with Top Picks enabled), social
│   ├── characters.json              # 5 characters (with atmosphere field)
│   ├── coming-soon.json             # Remaining placeholder pages
│   ├── top-picks.json               # Curated picks: deal + picks by 5 categories
│   └── videos.json                  # Featured YouTube IDs
├── lib/
│   ├── analytics/track.ts           # SSR-safe gtag wrapper
│   ├── content/                     # Adapter pattern (json → sanity swap); includes getTopPicks(), TOP_PICK_CATEGORIES, TOP_PICK_CATEGORY_LABELS, TopPickSchema, DealBlockSchema, TopPicksContentSchema
│   ├── newsletter/                  # Stub + Resend transactional + rate limit
│   ├── shopify/                     # Storefront GraphQL fetch (server-only) + mock fallback; SHOPIFY_MODE + SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN
│   ├── theme/tokens.ts              # Animation easings/durations
│   └── utils/cn.ts                  # Tiny class joiner
├── public/assets/                   # Web assets mirrored to the R2 CDN (shop photos, top picks)
│   └── brand/                       # 2D brand art (pups, noses, logos, scene, props, app icon) — served from the deployment, not R2
└── scripts/export-brand-art.sh      # Rebuilds public/assets/brand + favicons from the original design pack
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

## Typography Contract (2026-05-26)

**Headings:** Landmark h1s use gradient utility chosen by context:
  - `.heading-gradient-tri` (general section h1s): deep navy `#0f2540` → medium navy → brand yellow → warm cream → white on desktop; deep navy → brand yellow mobile
  - `.heading-gradient-gold` (hero text containers only): yellow-only 5-stop `#b8862e → #d4a833 → #ffd70c → #fff5cc → #ffffff` on navy bg for AA-safe depth
- Section h2s use `text-navy` (#397fc5). Both receive `.text-shadow-soft` for legibility; hero titles additionally use `.text-shadow-bold` (dark shadow + golden glow on navy).

**Body:** All body text, sub-headings, and captions use `text-ink-blue` (#1a3a5c, deep navy) or opacity variants (`text-ink-blue/70`, etc.). Chosen for AA-safe contrast (9:1 white, 6:1 cyan/warm-tan). Opacity hierarchy: 100% body, ~70% kickers, ~45% disabled, ~10–15% decorative (paw prints).

**Hero Surface Contract:** All hero text containers (5 hero components: `CinematicHero`, `FullBleedHero`, `WatchHero`, `ComingSoonHero`, and hero text block in `CharacterDetailHero`) use `bg-navy` background. Exception: `CharacterDetailHero` reserves themed `surfaceTint` bg per per-character design intent. White body text + yellow title gradient ensures AA everywhere.

**Dark anchors reserved:** `--ink` token, `bg-ink` (button fills), `border-ink` (form inputs), `ring-ink` (focus rings) remain dark brown (#2b1d10) for contrast points against the blue/yellow/white palette. See `project-changelog.md` [2026-05-26] for full rationale and validation.

## Character Schema & Themes (Updated 2026-05-22)

**CharacterSchema** (`lib/content/schemas.ts`):
- `slug`, `name`, `breed`, `image`, `accentColor`, `order` — core identity + styling
- `tagline` — all-caps subtitle/epithet (e.g., "THE SOULFUL, GOLDEN HEART OF SCOUTPAW")
- `bio` — full character description
- `quote` — personality statement (unified from old `funFacts` array)
- `poses` — array of character pose PNG paths (first pose used by carousel + detail hero)

**CharacterTheme** (`lib/content/character-themes.ts`):
- `heroGradient` — full-bleed hero backdrop (per-pup, distinct color palette)
- `surfaceTint` — soft tint behind story block
- `decor` — mid-tone decorative color for motifs
- `motif` — scatter animation type (`notes|bursts|sparkles|geo|mountains`)
- `atmosphere` — signature full-bleed mood layer (`nightlight|motion|ribbons|blueprint|ridge`)

All 5 characters (`rocky`, `max`, `oscar`, `buddy`, `bella`) fully themed. Used by:
- `/characters` index page (Plan B cinematic cards: one large standalone card per character, zig-zag layout, on cyan canvas with generous gaps `space-y-12 md:space-y-20`)
- `/characters/[slug]` detail pages (per-character atmosphere layer + YouTube badge, SSG'd for SEO)
- Home `featured-pup-spotlight` component
- Home `menu-cards` character links

**Plan E Design (Stacked 100vh Scroll Scenes, 2026-05-26):**
- **Sticky scenes (md+)**: Each character `<motion.div>` is `md:sticky md:top-0 md:h-screen` with `z-index: index` for deterministic stacking. As the section scrolls past the viewport, framer-motion `useScroll()` drives scale (1→0.96) + opacity (1→0.85) on inner div — reads as previous scene receding.
- **Mobile plain stack**: Below `md`, scenes are `min-h-screen` stacked blocks with no sticky. Transforms still apply for smooth scroll motion but harmless since not pinned.
- **Art + content layout**: Pose image max-width enlarged to `max-w-[520px] lg:max-w-[560px]` (full-bleed scene). Content uses Plan D `text-ink-blue` body + Plan A `text-navy` heading.
- **Atmosphere/Motif clipping**: Full-bleed behind content in `overflow-hidden` inner `<motion.div>`.
- **`prefers-reduced-motion` opt-out**: `useReducedMotion` guard skips transforms for accessibility.
- **Retired plans**: Plan B (cinematic cards) and Plan C (dividers) no longer used on `/characters`. CloudDivider component remains for `/top-picks`, `/shop`, and `/watch` consumers.

## Outstanding TODOs

In `content/*.json`:
- YouTube channel URL + 3 featured video IDs

Pre-public-launch:
- Privacy/Terms pages (compliance for email collection)
- Real Shopify store + Storefront API access token (generated in Partners Dev Dashboard → app → Storefront API access tokens)
- Real Resend API key + team notification inbox
