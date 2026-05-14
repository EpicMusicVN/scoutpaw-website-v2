---
type: qa
phase: 5
date: 2026-05-08
slug: redesign-signoff
status: signed-off
---

# Phase 5 QA Report — ScoutPaw Redesign Sign-off

End-of-redesign audit pass across all P1–P4 work. No new features, only audit + targeted fixes.

## Build & TypeScript

- `pnpm typecheck` — **CLEAN** (zero errors)
- `pnpm build` — **CLEAN** (zero errors, zero warnings)
- `pnpm lint` (next lint) — **CLEAN** (zero ESLint warnings or errors)

## Bundle Size (vs P0 baseline)

| Route | Pre-redesign | Post-redesign | Δ | Within 10%? |
|---|---|---|---|---|
| `/` (home) | 163 KB | **165 KB** | +2 KB / +1.2% | ✓ |
| `/shop` | 164 KB | **167 KB** | +3 KB / +1.8% | ✓ |
| `/watch` | 158 KB | **160 KB** | +2 KB / +1.3% | ✓ |
| `/characters/[slug]` | 114 KB | 114 KB | 0 | ✓ |
| Shared chunks | 100 KB | 100 KB | 0 | ✓ |

All First Load JS within budget. No new npm dependencies added.

## Render Strategy

| Route | Strategy |
|---|---|
| `/` | ○ Static prerendered |
| `/shop` | ○ Static prerendered (Suspense boundary preserved static eligibility) |
| `/watch` | ○ Static prerendered (Suspense boundary preserved static eligibility) |
| `/characters/[slug]` | ● SSG via `generateStaticParams` |
| `/coming-soon/[slug]` | ● SSG |
| `/api/newsletter` | ƒ Dynamic |

## Reduced-Motion Audit

framer-motion components inventoried:

| Component | Reduce guard |
|---|---|
| `cinematic-hero.tsx` | ✓ `useReducedMotion` + `mounted` flag |
| `hero-character-cluster.tsx` | ✓ `useReducedMotion` + `mounted` flag |
| `atmosphere-layer.tsx` | ✓ `useReducedMotion` + `mounted` flag |
| `motion/scroll-reveal.tsx` | ✓ `useReducedMotion` |
| `motion/fade-in.tsx` | ✓ `useReducedMotion` (instant duration) |
| `motion/wiggle.tsx` | ✓ `useReducedMotion` |
| `nav/mobile-nav.tsx` | Short transitions; covered by global CSS clamp |
| `ui/back-to-top.tsx` | Short transitions; covered by global CSS clamp |
| `ui/scroll-progress.tsx` | Pure scroll-driven, no animation |

**Backstop:** `app/globals.css:139-148` clamps all `animation-duration` + `transition-duration` to `0.01ms` under `@media (prefers-reduced-motion: reduce)`. Catches anything not explicitly guarded.

**Verdict:** Pass.

## Accessibility (a11y) Audit

Code-level checks (axe DevTools browser run still recommended):

- ✓ All `<Image>` instances have `alt=""` or descriptive alt
- ✓ Heading hierarchy is semantic per page (single h1, logical h2/h3 nesting)
- ✓ Skip link present in `app/layout.tsx`
- ✓ Focus-visible rings on all interactive surfaces (`focus-visible:ring-2 ring-brand-primary`)
- ✓ `aria-label` on icon-only buttons (mobile menu, scroll arrows, social icons, Buy Now overlays)
- ✓ `aria-current="page"` on active nav links
- ✓ `aria-pressed` on filter chips
- ✓ `aria-live="polite"` on newsletter form status / library filter result
- ✓ `aria-hidden` on decorative SVGs and AtmosphereLayer
- ✓ Keyboard ESC closes mobile nav
- ✓ Body scroll lock cleans up on unmount

**Heading sample:**

| Page | h1 | h2 examples |
|---|---|---|
| `/` | "Calm sounds for your pup's day." | Step Into the Pack, Say hi to Buddy., Meet the Whole Pack, Take a Piece of Home., Calm. Cozy. Cued up., Join the Pack. |
| `/shop` | "Take a piece of the pack home." | Find Your Pup's Favourite., Shop the Pack., More About ScoutPaw Shop., Stay in the loop. |
| `/watch` | "Watch the Whole Pack." | Featured video title, Latest Uploads, Playlists for the Pack., Our Channels., All Episodes. |

**Verdict:** Pass at the code-review level. Live axe DevTools sweep recommended on staging before public launch.

## Cross-Page Consistency

| Pattern | Result |
|---|---|
| Container width on hero/banner sections | All use `max-w-hero` (1400px) ✓ |
| Container width on content sections | `max-w-hero` for spacious feature blocks; nested grids stay narrower ✓ |
| Kicker style | `font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm` ✓ |
| Section header h2 | `font-display text-4xl font-bold text-ink md:text-6xl lg:text-7xl` for major sections; `text-3xl md:text-4xl lg:text-5xl` for rails/sidebars ✓ |
| CTA primary | `bg-brand-primary` sticker style at `size="lg"` (Shop, Newsletter, Buy Now) ✓ |
| CTA dark | `bg-ink` for darker emphasis (Featured Video Watch on YouTube, Hero secondary) ✓ |
| Card hover | `transition-all duration-300 ease-gentle hover:-translate-y-X hover:shadow-cozy-lg/xl` ✓ |
| Sticker rotation | `-rotate-2/-rotate-1/rotate-1/rotate-2` at rest, `hover:rotate-0` ✓ |

## Loading Skeletons

- `app/shop/loading.tsx` — rebuilt P3 to match new layout ✓
- `app/watch/loading.tsx` — rebuilt P5 to match new layout ✓
- Home — relies on default Next.js fallback (acceptable for static pages)

## Token System (C2 from P2 review)

CSS variables stored in dual hex + RGB-triplet form. Verified opacity utilities compile in production CSS (`.next/static/css/*.css`):

- `.bg-ink/{0,5,10,30,40,80,85,95}` ✓
- `.text-ink/{15,20,...,90}` ✓
- `.border-ink/{10,15,20,30,45}` ✓
- `.bg-base`, `.bg-honey`, `.bg-surface`, `.bg-honey/95` etc. ✓

Inline `style={{ background: "var(--brand-primary)" }}` continues to work via the hex companions.

## Open Items / Deferred

- **Live axe DevTools run** on staging — recommended before public launch
- **Live Lighthouse run** on production URL with real network throttling — recommended before public launch (build is clean, but actual perf depends on hosting)
- **Cross-browser smoke** — Chrome/Safari/Firefox + iOS Safari + Chrome Android. Code-level patterns are standard and should work, but a real device pass is recommended.
- **Real YouTube IDs** — all 30 videos still use `TODO_youtube_id_N` placeholders. Thumbnails fall back to `/assets/banner/banner.png`. Replace as episodes land.
- **Real product imagery** for Shop hero — `/assets/shop/promotion.png` is a placeholder. Hero composition uses character cluster instead.
- **Bluey-spirit verification** — no observable visual clone risk: cream base preserved, sky-blue used only as accent (sky atmosphere variant on hero is opt-in), staggered/asymmetric layouts diverge from Bluey's flat-grid blocks.

## Sign-off

All P1–P4 implementation work is structurally sound, build-clean, and within bundle/perf budgets. Code-level accessibility, motion, and cross-page consistency audits pass. Live audits + cross-browser smoke deferred to staging environment.

**Status:** Phase 5 complete. Redesign ready for staging deploy + final QA.

## Unresolved Questions

1. Lighthouse and axe live runs — should we block public launch on these, or run on staging post-deploy?
2. Real YouTube IDs — is there a planned content batch to replace `TODO_youtube_id_N` placeholders?
3. Shop hero asset — keep character-cluster fallback or commission product-context art?
4. Channel data — current 2-channel reality vs plan's 6-7 channel rail. Add more channels or accept current?
