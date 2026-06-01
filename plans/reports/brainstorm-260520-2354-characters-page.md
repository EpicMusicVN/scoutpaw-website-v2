# Brainstorm — Characters Page

**Date:** 2026-05-20 23:54 | **Status:** Agreed | **Scope:** new page + data-model change (medium feature)

## Problem Statement

Build a `/characters` page: hero banner + per-character storytelling sections (Title / Subtitle / Description / Quote), playful-premium-warm, fully responsive, animated, accessible, SEO-friendly. Reference: Bluey characters page (for *vibe* only).

## Scout Findings

- No `/characters` index page exists — only `/characters/[slug]` detail pages.
- "Characters" nav item is **disabled** in `site-config.json` → points to `/coming-soon/characters`.
- `content/characters.json`: 5 chars — `slug, name, breed, tagline, bio, funFacts[], image, accentColor, order`.
- Reusable design system: `FullBleedHero`, `CloudDivider`, `ScrollReveal`, `PawPrintPattern`, `Button`; Fredoka/Nunito; per-char `accentColor`; sky/cream/peach/sage/tan bg tokens.
- Detail page uses `CharacterHero` + `FunFactsList`.

## Key Decision — Reference vs Content

Bluey ref = dense grid catalog for 30+ characters. Our content = 5 chars with rich per-char copy. A grid would look sparse and can't host the copy. **Decision: adopt Bluey's *vibe* (sky-blue bg, soft gradients, rounded cards, floating decorative shapes, colored per-char zones, cozy storytelling) — NOT its grid.** Use alternating full-width showcase sections.

## Agreed Decisions

| Topic | Decision |
|---|---|
| Data source | Update `characters.json` as single source of truth (+schema fields). Detail pages & home reflect new copy. |
| Detail pages | Refresh `/characters/[slug]` — new description + personality quote pull-quote; drop stale `funFacts`. |
| Navigation | Top quick-nav avatar row (jump-links) + each section links "Meet {Name} →" to its detail page. |
| Page order | Max, Buddy, Bella, Oscar, Rocky (user's numbered order). |

## Final Solution

### Data model (`lib/content/schemas.ts` + `characters.json`)
- `tagline` ← new **Subtitle** (all-caps epithet).
- `bio` ← new **Description**.
- **add** `quote: z.string()` ← new personality Quote.
- **remove** `funFacts: string[]` (no longer in content direction).
- Title "Say hi to {name}" — derived from `name`, not stored.

### Page structure — `app/characters/page.tsx` (server component)
```
FullBleedHero (kicker "The Pack" · "Meet the Characters" · banner/banner.png)
CharacterQuickNav (5 avatar jump-link chips)
for each character (Max→Buddy→Bella→Oscar→Rocky):
  ScrollReveal > CharacterShowcaseSection      + CloudDivider between
NewsletterCTA (reused)
```

### Components
- **`CharacterShowcaseSection`** (new) — *the* reusable per-char section. Props `character` + `index`. Image side alternates `index % 2`. `accentColor` drives soft gradient bg, floating shapes, quote-card accent. Contains: large `next/image` in aspect-ratio box + decor, text block (h2 "Say hi to {name}", subtitle, description, `CharacterQuote`, "Meet {name} →" link). Consistent layout, unique via color + side.
- **`CharacterQuote`** (new) — reusable pull-quote. Used in section AND detail page (DRY; replaces `FunFactsList`).
- **`CharacterQuickNav`** (new) — avatar chip row, smooth-scroll to `#character-{slug}`; horizontally scrollable on mobile.
- **Reused:** `FullBleedHero`, `CloudDivider`, `ScrollReveal`, `PawPrintPattern`, `NewsletterCTA`, `Button`.

### Modified files
- `lib/content/schemas.ts` — Character schema (+`quote`, −`funFacts`).
- `content/characters.json` — all 5 chars' new copy.
- `content/site-config.json` — enable "Characters" nav item, href → `/characters`; footer "Characters" link → `/characters`.
- `app/characters/[slug]/page.tsx` — drop `FunFactsList`, render `CharacterQuote`.
- `components/characters/character-hero.tsx`, `character-card.tsx` — adapt to schema change.
- `components/characters/fun-facts-list.tsx` — removed (replaced by `CharacterQuote`).

## Cross-Cutting Requirements

- **Responsive:** desktop 2-col (image│text), mobile stacked (image→text); quick-nav scrolls on mobile.
- **Animations:** `ScrollReveal` fade-up per section, image hover-scale, subtle floating-shape drift — all gated by `prefers-reduced-motion`.
- **Performance / no CLS:** `next/image` via R2 CDN; fixed aspect-ratio boxes; `priority` on hero + first character image only, lazy rest; correct `sizes`.
- **Accessibility:** `accentColor` used only for *soft tints / decorative*, never as a text background — body text stays `ink` on light `surface` to guarantee WCAG AA contrast (accent colors vary widely in luminance). Semantic `<section aria-labelledby>` per character.
- **SEO:** `metadata` export (title/description/OG banner); `h1` (hero) → `h2` per character; descriptive `alt` text.

## Risks

- Schema change (`funFacts` removal) ripples — plan must grep ALL `funFacts` / `tagline` / `bio` usages before edit.
- All-caps Subtitle is longer than old `tagline` — verify it fits home `character-card` without breaking layout.
- Character image assets (`characters/*-bg.png`) — confirm transparent/clean for floating on gradients.

## Success Criteria

- `/characters` renders 5 alternating sections + hero + quick-nav; nav item enabled.
- New copy single-sourced from `characters.json`; detail pages consistent.
- Responsive desktop/tablet/mobile; reduced-motion respected; no CLS; Lighthouse perf/a11y/SEO healthy.
- `tsc` + `next lint` + `next build` clean.

## Unresolved Questions

- Hero image: reuse `banner/banner.png` (assumed) — swap if a characters-specific banner exists.
- Live prod URL still unknown (`scoutpaw.vercel.app` 404 from earlier sessions) — visual QA limited to local build.
