# Development Roadmap

## Current Phase: UI/UX Polish & QA

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
