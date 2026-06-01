# Brainstorm — Characters Carousel Page

- **Date:** 2026-05-21
- **Route:** `/characters` (`app/characters/page.tsx`)
- **Status:** Design approved — ready for `/ck:plan`
- **Branch:** main

## Problem Statement

Redesign `/characters` as a premium, cinematic carousel experience. Current route renders an immersive full-screen `CharacterScene` (6 iterations of "fullscreen scene"). User pivots to: Hero Banner + horizontal Focal-Coverflow carousel + click-to-expand inline detail card. Pinterest reference (`pin.it/1AEx2qgAe`) — not accessible during brainstorm; design driven by the detailed written brief + ScoutPaw visual identity.

## Requirements

**Functional**
- Keep a Hero Banner above the carousel.
- Large cinematic horizontal carousel of 5 pups (Max, Buddy, Bella, Oscar, Rocky).
- Custom branded prev/next arrows, bottom-right aligned below carousel.
- Click character → hide others → expand large detail card; selected pup becomes page focus.
- Detail card: big artwork, per-character palette/decor, title + subtitle + description + quote.
- Smooth animated transitions both directions (carousel ⇄ detail, slide ⇄ slide).

**Non-functional**
- Responsive desktop/tablet/mobile; no layout shift; optimized image loading.
- Accessible + readable (AA contrast); `prefers-reduced-motion` respected.

## Decisions (locked via clarifying questions)

| Decision | Choice | Rationale |
|---|---|---|
| `/characters/[slug]` pages | **Keep** | SEO + per-pup shareability; carousel detail can deep-link to them |
| Carousel library | **Embla** (`embla-carousel-react`) | ~6kb headless, accessible, native drag/swipe + snap; pairs with framer-motion |
| Detail open state | **Query param** `?pup=max` | Shareable, back-button closes; shallow routing |
| Hero | **`cinematic-hero` style** | Consistency with home/shop |
| Carousel style | **Focal Coverflow Cards** | Clear focal hierarchy; reads instantly as premium carousel |

## Approaches Evaluated

**Carousel build:** Embla (chosen) · custom framer-motion (no dep, but more code/risk) · Swiper (~30kb+, overkill).
**Detail mode:** in-page expand + query param (chosen) · navigate to `[slug]` (loses cinematic morph).
**Carousel visual:** Focal Coverflow (chosen) · Floating Pack Stage · Premium Poster Gallery.

## Recommended Solution

### Page (`app/characters/page.tsx`, server component)
`CinematicHero` → `<Suspense>`(`CharacterCarousel`) → `NewsletterCTA`(ScrollReveal). Suspense **required** for `useSearchParams()`.
Hero copy: kicker `MEET THE PACK` · title "The pups behind every ScoutPaw song" · short description.

### New components (`components/characters/`, all <200 LOC)
- `character-carousel.tsx` — client orchestrator; `carousel`⇄`detail` mode; `?pup=` read/write via `useRouter`+`useSearchParams`; `AnimatePresence` mode swap.
- `character-carousel-track.tsx` — Embla viewport + coverflow scaling (scale/opacity per slide from Embla scroll progress).
- `character-carousel-card.tsx` — focal card: accent-gradient panel, pose cutout, "Say hi to {name}", `layoutId` morph hook.
- `character-carousel-arrows.tsx` — custom branded prev/next, bottom-right.
- `character-detail-card.tsx` — expanded cinematic detail; close + prev/next.

### Reused (DRY)
`CharacterAtmosphere`, `CharacterMotif`, `CharacterQuote`, `character-scene-decor` primitives, `character-scene-backdrop` (shared sky), `getCharacterTheme()`, `CinematicHero`, `NewsletterCTA`, `ScrollReveal`.

### Retired → delete after verification
`character-scene.tsx`, `character-scene-figure.tsx` (only consumer = old index page). `character-scene-backdrop/decor/data` kept (reused by carousel).

### Carousel mechanics
Embla `loop:true`, `align:"center"`, `containScroll:false`. Coverflow: subscribe `scroll`/`reInit`, distance-from-center → `scale` (1 / ~0.82) + `opacity` (~0.55), GPU transforms only → zero CLS. Responsive peek: desktop 2 neighbours, tablet partial, mobile slim. Branded arrows + optional dot indicators.

### Click → detail transition
Any card opens its pup. `layoutId` morphs card → detail artwork; other cards staggered exit (fade+scale-down). Backdrop crossfades to pup `heroGradient`; atmosphere/motif/decor fade in; text slides up staggered. URL → `?pup=slug` (`scroll:false`). Close via button / browser-back / `Escape`; carousel re-inits at pup index; focus restored. Detail mode keeps prev/next arrows to flip pups.

### Detail card layout
Desktop split (big artwork | text stack: breed kicker, "Say hi to {name}", all-caps subtitle, description, `CharacterQuote`). Mobile stacked. Themed `heroGradient` bg + motif scatter + "✕ Back to the pack". Same primitives as `CharacterDetailHero` → visual parity with `[slug]` pages.

### Content
No schema/JSON change — `tagline`/`bio`/`quote` already in `characters.json`; `"Say hi to {name}"` derived from `name`. Verified user-supplied copy == existing JSON.

## Performance & Accessibility

- Next/Image per-breakpoint `sizes`; `priority` only on centered/open pup, rest lazy; preload centered pup artwork.
- `AnimatePresence mode="popLayout"` (no reflow); fixed carousel viewport height (no CLS); framer-motion stays lazy (`LazyMotion`).
- Cards = `<button aria-label>`; carousel `aria-roledescription`; focus to detail heading on open, restored on close.
- `prefers-reduced-motion` → static coverflow scale, morph→crossfade, decor off (global CSS keyframe reset); AA contrast per themed gradient.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Embla transform vs framer `layoutId` morph conflict | Embla scales outer slide; morph on inner wrapper (separate transform contexts) |
| `useSearchParams` without Suspense → build error | Wrap `CharacterCarousel` in `<Suspense>` |
| Heavy pose PNG cutouts | Audit sizes; tune Next/Image `quality`; preload centered pup |
| Loop index ↔ `?pup=` sync | Resolve initial slide index from query param before Embla init |
| Detail card visual drift from `[slug]` pages | Share atmosphere/motif/quote/theme primitives; extract `CharacterProfileLayout` only if they diverge |

## Success Criteria

- `/characters` renders Hero + coverflow carousel + working inline detail; `[slug]` pages unaffected.
- Click opens detail with morph; `?pup=` updates; back/Escape/close all return cleanly.
- Responsive 3 breakpoints; no CLS; Lighthouse perf not regressed.
- Keyboard-operable; reduced-motion degrades gracefully; AA contrast holds.

## Next Steps / Dependencies

1. Add `embla-carousel-react` to `package.json`.
2. `/ck:plan` → phased build (deps → carousel → detail/transition → responsive/a11y → cleanup+docs).
3. Docs sync: `codebase-overview.md`, `project-changelog.md`, `development-roadmap.md`.
4. Delete `character-scene.tsx` + `character-scene-figure.tsx` after carousel verified.

## Unresolved Questions

- Pinterest reference inaccessible — visual direction assumed from written brief; confirm against the pin during implementation if traits differ.
- Hero media/image asset for `CinematicHero` not specified — fall back to `banner/banner.png` or a group shot; confirm during build.
