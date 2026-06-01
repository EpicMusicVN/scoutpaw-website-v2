# Development Roadmap

## Current Phase: UI/UX Polish & QA

### Milestone: Website Styling Overhaul (Completed 2026-05-26)
- Status: **Shipped (3 coordinated plans)**
- **Plan A (Typography System):** Heading color contract (navy/yellow/white) + gradient utilities across 25 files (home/characters/watch/shop/top-picks); body text WCAG AA preserved; newsletter CTA spacing bumped.
- **Plan B (Cinematic Character Cards):** `/characters` page rebuilt: per-character sections as standalone rounded cards on cyan canvas. Card component holds surfaceTint background, min-h-[80vh] desktop (cinematic), min-h-auto mobile. Character pose overflows for depth; generous gap preps for Plan C dividers.
- **Plan C (Varied Cloud Dividers):** 4-variant cloud divider system (`"trio" | "duo-big" | "scatter" | "stack"`) with subtle white-to-soft-cyan gradients (useId-stable). Dividers cycle by index between character cards on `/characters`. No animation — variety alone conveys playful/magical feel.
- Blocks resolved; all tests + code review DONE; changelog entries logged.

### Milestone: Cinematic Character Cards (Completed 2026-05-26)
- Status: **Shipped**
- `/characters` page rebuilt: per-character sections as standalone rounded cards on cyan canvas
- Card component holds surfaceTint background inside, min-h-[80vh] desktop (cinematic vertical presence), min-h-auto mobile
- Character pose overflows card edge for layered depth; generous gap between cards for Plan C dividers
- 3 phases: card component rebuild, page layout + mobile, verification + docs
- Unblocks Plan C (Varied Cloud Dividers)
- Referenced in `plans/260526-1605-characters-cinematic-cards/`

### Milestone: Heading Typography System (Completed 2026-05-26)
- Status: **Shipped**
- Heading color contract (navy/yellow/white) + gradient utilities; body text unchanged (WCAG AA preserved)
- 25 files: hero h1 + section h2 landmark selectors on home/characters/watch/shop/top-picks; newsletter CTA spacing bumped
- Blocks Plan B (Cinematic Cards); referenced in `plans/260526-1605-typography-system-and-vip-spacing/`

### Milestone: Body Typography & Ink Color System (Completed 2026-05-26)
- Status: **Shipped**
- New `--ink-blue: #1a3a5c` token + Tailwind wiring (text-ink-blue, text-ink-blue/70 utilities)
- Body text sweep: 44 files (text-ink, text-warm-text, text-warm-muted → text-ink-blue variants)
- Global body default color updated to --ink-blue per WCAG AA compliance
- Code review APPROVED; all tests passing; referenced in `plans/260526-1714-typography-v2-body-blue/`

### Milestone: VIP Footer Spacing v2 (Completed 2026-05-26)
- Status: **Shipped**
- Newsletter decorative dogs repositioned UP (bottom-8) + section padding bumped (pb-32 md:pb-48) → 80–120px footer clearance
- Single-file change to `components/home/newsletter-cta.tsx`; referenced in `plans/260526-1714-vip-footer-spacing-v2/`

### Milestone: Hero Gradient Saturation and Kicker Polish (Completed 2026-05-26)
- Status: **Shipped**
- `.heading-gradient-tri` utility boosted to 5 stops: deeper navy start (#0f2540) + brand-primary yellow mid + enhanced saturation; auto-propagates to all 5 hero h1s site-wide
- Watch hero kicker swapped from dim gold (#b8862e) → deep navy (text-ink-blue) for AA-safe brand consistency on cyan/cream surface
- Two-file change: `app/globals.css` (gradient) + `components/watch/watch-hero.tsx` (kicker); referenced in `plans/260526-1815-hero-gradient-saturation-kicker-polish/`

### Milestone: Characters Soft Transitions and VIP Buffer (Completed 2026-05-26)
- Status: **Shipped**
- Incoming opacity tween: second `useScroll` per scene tracks entry progress, tweens opacity `0.5 → 1.0` during first viewport-height scroll into scene. Combined with Plan E's outgoing fade `1.0 → 0.85`, creates visible crossfade window where adjacent scenes briefly overlap.
- VIP buffer on `/characters`: newsletter wrapped in `pt-24 md:pt-32` so it doesn't sit directly atop last scene's scroll-end.
- Two-file change: `components/characters/character-section.tsx` (composite opacity) + `app/characters/page.tsx` (buffer); referenced in `plans/260526-1815-characters-soft-transitions-vip-buffer/`

### Milestone: Watch Hero Poses and Subscribe Card Spacing (Completed 2026-05-26)
- Status: **Shipped**
- Watch hero flanking poses (husky1 + corgi2) unclipped: text container padding (pb-20 xl:pb-32 2xl:pb-40) absorbs natural height; section overflow-hidden preserved.
- Subscribe-card decorative dogs resized w-64 → w-48 (newsletter-cta pattern); section padding bumped for footer clearance.
- Two-file change: `components/watch/watch-hero.tsx` + `components/watch/subscribe-card.tsx`; referenced in `plans/260526-1815-watch-hero-poses-and-subscribe-spacing/`

### Milestone: Hero Navy Surfaces and Yellow Gold Titles (Completed 2026-05-26)
- Status: **Shipped**
- Hero text containers: navy bg (`bg-navy`) replaces surface/white
- Yellow-only gradient titles (`.heading-gradient-gold`: `#b8862e → #d4a833 → #ffd70c → #fff5cc → #ffffff`)
- New `.text-shadow-bold` utility — dark shadow + golden glow for depth on navy
- 5 hero components converted: `CinematicHero`, `FullBleedHero`, `WatchHero`, `ComingSoonHero`; `CharacterDetailHero` exempted (per-character theme preserved)
- AA-safe everywhere (yellow on navy passes all contrast thresholds)
- Referenced in `plans/260526-1913-hero-navy-surfaces-yellow-titles/`

## Iteration 4 Summary (Plan J)
- **Status: SHIPPED** — Navy-background hero refactor shipped 2026-05-26
- **Plan J (Navy Surfaces & Gold Titles):** Decisive structural fix for "yellow hero titles" after 3 AA-compromised attempts; navy surfaces + yellow-only gradient + shadow-glow utility
- **Impact:** Hero typography finalized; yellow titles readable everywhere; prep for watch refinement phase

## Iteration 3 Summary (Plans G, H, I)
- **Status: SHIPPED** — Three coordinated styling plans shipped 2026-05-26
- **Plan G (Gradient Saturation & Kicker):** 5-stop hero gradient boost + watch kicker navy swap for AA compliance
- **Plan H (Characters Transitions & VIP Buffer):** Incoming opacity tweens + VIP newsletter buffer spacing
- **Plan I (Watch Hero Poses & Subscribe Spacing):** Hero flanking poses padding + subscribe card dog resize + section padding
- **Impact:** Full watch page spacing refinement complete; character transitions smooth; zero regressions

## Iteration 2 Summary (Plans D, E, F)
- **Status: SHIPPED** — Four coordinated styling plans shipped 2026-05-26
- **Plan D (Typography System):** Heading color contract (navy/yellow/white) + gradient utilities + newsletter spacing
- **Plan E (Body Typography):** New --ink-blue token + body text sweep across 44 files
- **Plan F (Footer Spacing):** Dog positions + padding bump for footer clearance
- **Plan G (Gradient Saturation & Kicker):** 5-stop hero gradient boost + watch kicker navy swap for AA compliance
- **Impact:** Full typography + spacing overhaul complete; WCAG AA compliance verified; zero regressions

### Milestone: Characters Stacked 100vh Scroll Scenes (Completed 2026-05-26)
- Status: **Shipped**
- Rebuild `/characters` as stacked full-viewport sticky scenes: each character becomes 100vh scene layering via z-index; scroll choreography scales/fades previous scene as next slides up. Mobile drops sticky/transforms — plain stacked sections.
- `character-section.tsx` → `CharacterScene` (full-bleed, framer-motion useScroll + scale/opacity); `app/characters/page.tsx` restructured (removed Fragment, CloudDivider, ScrollReveal; wrapped in relative container for sticky containing block).
- iOS Safari `100dvh` fix applied per code review. Mobile UX height and unused `total` prop documented as follow-ups.
- 3 phases: component rebuild, page wire + motion, mobile gating. All code review DONE_WITH_CONCERNS; tests passing. Referenced in `plans/260526-1714-characters-stacked-page-scroll/`

### Milestone: Top Picks Page (Completed 2026-05-22)
- Status: **Shipped**
- New `/top-picks` route (SSG): curated featured deals page
- Components: TopPicksBoard (category filter + deal spotlight + accordion grid), DealBlock (featured offer toggle), OfferCard (discount badge + rating + popularity + Shop Now CTA)
- Schema: TopPickSchema, DealBlockSchema, TopPicksContentSchema with 5 categories (apparel, pet-supplies, pet-toys, home-living, others)
- Content: `content/top-picks.json` wired through adapter pattern (getTopPicks() method)
- UI primitive: FilterChip extracted from explore-videos.tsx to components/ui/ for DRY reuse
- Nav: Top Picks enabled in site-config.json; footer links updated; stale coming-soon.json entry removed
- Page rhythm: Reuses FullBleedHero + CloudDivider + NewsletterCTA (same as /shop) for visual consistency
- Validation: typecheck ✓, lint ✓, HTTP 200 ✓

### Milestone: Characters Carousel v7 Redesign (Completed 2026-05-22)
- Status: **Shipped**
- Embla `loop: false` — Max permanently at index 0; prev/next arrows gain disabled states at scroll bounds.
- Carousel cards fully redesigned: character pose dominates (~78% height) standing on solid `accentColor` nameplate (~22% height). Nameplate shows **name + tagline only** (no breed/bio/quote). Auto-contrast text (dark on light accents, white on dark) — AA-pass verified across all 5 pups.
- Detail view: premium floating card (light `surfaceTint`, rounded-[2.5rem], shadow-cozy-xl) over soft themed wash. Character artwork overflows card top on md+ for layered depth.
- New `character-detail-decor.tsx` extracted for drifting atmosphere/motif/decor layer (reusable, independent).
- Removed: CharacterQuote `compact` prop (zero consumers in v7 carousel).
- `character-carousel-arrows.tsx` ArrowButton gained `disabled` prop for bound-state UI.
- Validation: typecheck ✓, lint ✓, HTTP 200 ✓ (`/characters` + `/characters?pup=max` verified).
- Code review: DONE_WITH_CONCERNS (one HIGH "file over 200-line cap" fixed; contrast AA-verified).

### Milestone: Characters Carousel v6 Redesign (Completed 2026-05-22, Superseded by v7)
- Status: **Archived** (v7 redesign above now shipping instead)
- Left-anchored Embla carousel (3 fully-visible cards + peeking 4th). CSS `mask-image` gradient dissolves right edge (no JS per-frame opacity).
- Carousel cards: white content panels (breed, name, tagline, bio clamped, quote) with pose PNG rising from top. Stretched-button-overlay pattern for click precision.
- Detail view: art-dominant full-viewport split (artwork ~58%, story ~42%). Removed `layoutId` morph; uses `AnimatePresence` crossfade + cinematic scale tween (0.65s).
- `useCarouselFade` hook deleted (CSS mask replaced per-frame opacity entirely).
- Character quote component gained optional `compact` prop for carousel usage.
- Browser-verified at desktop/tablet/mobile; zero console errors at both reduced-motion settings.
- Code review: DONE_WITH_CONCERNS (all short-viewport clipping risks fixed).

### Milestone: Characters Carousel Refinement v5 (Completed 2026-05-22, Superseded by v6)
- Status: **Archived** (v6 redesign above now shipping instead)
- Asset normalization: all 13 pose PNGs normalized to `900×1200` portrait via `scripts/normalize-pose-assets.sh`.
- Carousel card rebuilt "soft glow only": no pad/box/border — dominant character + faint themed bloom + ground shadow.
- Fixed live console bugs: `<path d="undefined">` + `ScrollReveal` hydration mismatch.
- Follow-up: upload the 13 normalized PNGs to R2 (carried forward to v6 deployment).

### Milestone: Characters Page (Completed 2026-05-21)
- Status: **Shipped** (superseded by Refinement v6 above)
- Redesigned `/characters` route: replaced full-screen immersive scene with **Embla-powered focal coverflow carousel**
- Carousel UI: centre card large (5px scale, bright), neighbours scaled 60% + dimmed 40%, drag/swipe/arrows/dots nav, loop enabled
- Click a card: inline detail expansion (pup artwork, themed backdrop, atmosphere, motif scatter, bio/quote). Carousel peers hidden during detail view.
- URL param `?pup=<slug>` tracks selection (shareable, back-button friendly). Framer Motion `layoutId` morph animates transition.
- New components: `CharacterCarousel` (orchestrator), `CharacterCarouselTrack` (Embla slides), `CharacterCarouselCard` (thumbnail), `CharacterCarouselArrows` (nav), `CharacterDetailCard` (expansion).
- Reused components: `CharacterSceneBackdrop`, `CharacterSceneDecor`, `CharacterAtmosphere`, `CharacterMotif`, `CharacterQuote` (no breaking changes).
- Deleted: `character-scene.tsx`, `character-scene-figure.tsx`, `character-scene-foreground.tsx`.
- `/characters/[slug]` detail pages unchanged (SSG for SEO/sharing).
- New dependency: `embla-carousel-react ^8.6.0`.
- Validation: typecheck ✓, lint ✓, build ✓ (all character pages SSG'd, `/characters` static)

### Milestone: Home & Shop Content Refresh (Completed 2026-05-18)
- Status: **Shipped**
- MenuCards backdrop flattened: dropped colored bg + paw-tile pattern + accent glow; icons now float on transparent base with shadow + hover lift
- Character data swap corrected: `slug:"max"` now Golden Retriever (was Husky), `slug:"buddy"` now Husky (was Golden). Resolves pre-existing data shuffle affecting spotlight hero narrative
- Promotion banner asset updated: `shop/promotion.png` → `shop/promotion.jpg` (new R2 asset already uploaded)
- ExploreProducts tiles rebranded: "Dog Calming & Essentials Collection" (plushes) + "Dog owner gifts" (apparel); section subtitle refreshed. Category routing (`?cat=plushes`/`?cat=apparel`) preserved
- Build validation: typecheck ✓, lint ✓, pnpm build ✓ (21/21 static + 2 SSG character pages)
- Code review: DONE_WITH_CONCERNS ("Ship" verdict); only follow-up: lib/shopify/mock-products.ts breed labels contradict swap (out of scope per YAGNI)
- Phases 3–4 pending: deploy + CDN purge (manual), post-deploy smoke tests (manual)

### Milestone: Watch Hero Video Autoplay with Sound (Completed 2026-05-15)
- Status: **Shipped**
- New `HeroVideo` Client Component handles autoplay-with-sound with graceful muted fallback
- Optimistic attempt: `play()` with `muted=false` on mount; on rejection sets `muted=true` + retries
- Audio toggle pill (persistent per WCAG 1.4.2): coral "Tap for sound" when muted, white mute icon when unmuted
- Pill uses `preventDefault` + `stopPropagation` to prevent parent `<Link>` navigation to YouTube
- Pulse animation (motion-safe) attracts attention only when muted; collapses to static icon when sound on
- `watch-hero.tsx` (Server Component) swapped inline `<video>` for `<HeroVideo>` import (6-line diff)
- Accessibility: aria-label state-aware, aria-pressed correct, keyboard Tab+Space/Enter navigation
- Validation: typecheck ✓, lint ✓, build ✓
- Manual smoke testing: handed off to user per tester report (cannot automate browser autoplay policy behavior)

### Milestone: Scroll-Linked Sun Decoration (Completed 2026-05-13)
- Status: **Shipped**
- New ScrollSun client component with Framer Motion useScroll/useTransform motion binding
- Vertical descent 0→220px + horizontal drift 0→+28→-16px as user scrolls hero
- SVG circle (r=22) + 8 rays, stacked drop-shadow glow (24px 0.55α + 16px 0.28α)
- Positioned upper-right (right-[12%] top-[14%] lg:right-[16%] lg:top-[16%]), hidden md:block
- Respects prefers-reduced-motion (static for a11y users)
- Integrated into FullBleedHero between banner and glass card
- Validation: typecheck ✓, lint ✓

### Milestone: Hero Center + Pack Image Upsize + Section Decorations (Completed 2026-05-13)
- Status: **Shipped**
- Hero vertical anchor: upper-third on md+ (`top-24 / lg:top-32`), true-stack mobile (`mt-8` gap below banner).
- Pack image cards: h-40/44/48 (160/176/192px). Text cards now exact equal height via flex-1 + outer wrapper flex-col restructure.
- Section decorations: 6 SVG icons (paw/bone/ball) at 10% opacity scattered behind cards, pointer-events-none, rotation varied.
- Validation: typecheck ✓, lint ✓

### Milestone: Hero Glass Card + Pack Cards Restack (Completed 2026-05-13)
- Status: **Shipped**
- Hero restructured: top-right glass card with new SCOUTPAW TV / THE ULTIMATE WORKDAY HANGOUT copy + 70-word body. Mobile stacks below banner; md+: absolute top-right.
- Pack cards: two-element stacks (aspect-square image card + bg-surface text card, -mt-10 overlap). Rotation removed, glow enhanced.
- **Follow-up refinement (2026-05-13)**: Hero glass card repositioned left (md:left-12 lg:left-16). Pack cards restructured to Pinterest pin pattern: small centered floating image (h-32/36/40) with large text card pulled up via negative margin (-mt-16/-mt-[72px]/-mt-20), text pt-24/28/32 reserves overlap space. Coming-soon badge moves to outer wrapper top-right z-20.
- Validation: typecheck ✓, lint ✓

### Milestone: Navbar + Footer Polish (Completed 2026-05-12)
- Status: **Shipped**
- Navbar logo aspect corrected 2.5:1 → 1.18:1; footer wordmark 2.92:1 → 4.44:1 (no stretch/squish)
- Navbar logo downsized h-10/md:h-12/lg:h-14; footer logo h-8/md:h-10/lg:h-12
- Newsletter CTA simplified: outline button → text link + envelope SVG
- Drop-shadow filters scaled to match smaller logo dimensions
- Removed `translate-y` hack; flex centering cleanup
- Validation: typecheck ✓, lint ✓

### Milestone: Asset Refresh (Completed 2026-05-12)
- Status: **Shipped**
- 10 PNGs synced to `/public/assets/` (banner, card icons, logo files)
- FullBleedHero: dogs centered at 360–1440px, text repositioned to sky zone, no overlap
- MenuCards: accent glow + drop-shadow on transparent icons, grounded feel
- Logo treatments: footer glow bumped, mobile menu wordmark header
- Validation: typecheck ✓, lint ✓ (visual QA deferred)

### Milestone: Responsive Audit (Full Website) (Completed 2026-05-11)
- Status: **Shipped**
- 44 components reviewed (code-static audit) + 49 screenshots at 7 viewports (7 pages)
- Findings: 0 critical / 8 major / 10 minor
- 3 fix-plan seeds: cookie consent UX, hero positioning + watch MD grid, filter chip + anchor compliance
- Audit outputs: `audit-260511-1806-responsive-full-website.md` + categorized findings + PNG screenshots
- Note: Read-only audit; fixes scheduled in follow-up plans

### Milestone: Cinematic Hero & Layout Polish (Completed 2026-05-11)
- Status: **Shipped**
- Home hero full-viewport (`min-h-[100svh]`); menu cards uniform + rotations preserved
- Shop hero overlay pattern; tile enlargement to `max-w-5xl`
- Watch library removal; disabled playlist cards with a11y labels
- Bundle optimization: `/watch` 4.45→3.1 kB

### Milestone: Watch Redesign + Compact Channels (Completed 2026-05-11)
- Status: **Shipped**
- WatchHero component: cinematic hero combining tagline + CTA + featured video + character cluster
- ExploreVideos: filter chips + mixed grid layout (2 large + 6 small)
- OurChannels: compact horizontal scroll rail (220-260px cards, 5-6 visible at 1440px)
- Schema split: PlaylistCategorySchema + VideoContentSchema (30 videos retagged)
- app/watch wired: VideoRail + ExploreVideos + OurChannels flow
- Note: `/watch` bundle grew 3.1 → 19.7 KB (over 5KB budget — see changelog)

## Future Phases
- Performance optimization and metrics
- Bundle size optimization and code-splitting review
- Accessibility audit and improvements
- Mobile responsiveness refinement
