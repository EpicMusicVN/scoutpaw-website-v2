---
phase: 3
title: Shared UI
status: completed
priority: P1
effort: 6h
dependencies:
  - 1
  - 2
---

# Phase 3: Shared UI

## Overview
Build shared layout shell, navigation w/ Coming Soon disabled state, footer, design tokens (character palette, typography, spacing), and motion primitives (`FadeIn`, `Stagger`, `Wiggle`). UI primitives (`Button`, `Card`) follow shadcn-light pattern (no full shadcn dep — KISS).

## Requirements
- Functional: every page wrapped in same layout (nav + footer); nav reads from site-config; disabled items show tooltip + redirect to coming-soon
- Non-functional: a11y AA (focus rings, alt text, semantic HTML); motion-reduce respects `prefers-reduced-motion`

## Audience-Driven Design
ScoutPaw is dual-audience: dogs viewing + pet-parents reading. Drives concrete choices:
- **Palette** prioritizes dog-vision (blues, yellows, warm browns); avoids red/green pairings
- **Motion** is calm/soothing (long durations, soft easing) not bouncy/Bluey-frenetic
- **Audio**: layout reserves slot for future ambient audio toggle (don't autoplay; persist mute state)
- **Contrast** AA+ for parent readability layered atop dog-friendly hues

Brand palette (from `content/site-config.json` → CSS vars):
- `--brand-primary: #FFB627` (marigold) · `--brand-secondary: #2E86AB` (sky blue)
- `--accent-warm: #F4A261` · `--accent-cool: #A8DADC`
- `--text-dark: #3D2817` (warm brown, not pure black) · `--bg-cream: #FFF8E7` · `--surface: #FFFFFF`

Per-character accents (each detail page overrides via CSS vars):
Buddy `#FFB627` · Max `#5BC0EB` · Bella `#9C6644` · Oscar `#F4A261` · Rocky `#B8A1D9`

## Architecture
- `app/layout.tsx`: root layout, fonts (Google Fonts via `next/font`), GA4 script slot, theme tokens via CSS vars (sourced from site-config palette)
- `components/nav/top-nav.tsx`: reads `siteConfig.navItems`, renders enabled items as `<Link>`, disabled as styled link to `/coming-soon/[slug]`
- `components/nav/footer.tsx`: brand, social links, legal links
- `components/motion/{fade-in,stagger,wiggle}.tsx`: thin Framer Motion wrappers; lazy-load Framer at module boundary
- `components/ui/{button,card}.tsx`: minimal primitives w/ Tailwind variants

## Related Code Files
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder home)
- Create: `components/nav/top-nav.tsx`, `components/nav/footer.tsx`
- Create: `components/motion/fade-in.tsx`, `components/motion/stagger.tsx`, `components/motion/wiggle.tsx`
- Create: `components/ui/button.tsx`, `components/ui/card.tsx`
- Create: `lib/theme/tokens.ts` (color palette, easing curves)

## Implementation Steps
1. Define design tokens in `tailwind.config.ts` (extend theme: brand colors, character accent palette, easings, fontFamily)
2. `app/globals.css`: CSS vars for theme, base typography, scroll behavior
3. Build `TopNav` w/ logo, nav items from siteConfig, mobile hamburger drawer
4. Disabled-state nav: greyed text + small "Soon" badge, link to `/coming-soon/[slug]`
5. Build `Footer` w/ social links + legal placeholders
6. `app/layout.tsx`: compose `<TopNav> {children} <Footer>`, set metadata (title, description, OG tags from siteConfig), font config
7. Motion primitives: `<FadeIn delay>`, `<Stagger gap>`, `<Wiggle on="hover">` — all client components, respect `prefers-reduced-motion`
8. UI primitives: `Button` (variants: primary, ghost, link), `Card` (default + character variant)
9. Build a `/style-guide` (dev-only, NOT linked) page demoing primitives — delete before deploy

## Success Criteria
- [ ] Layout renders on all routes
- [ ] Nav reads dynamically from siteConfig
- [ ] Disabled nav items route to coming-soon stubs
- [ ] Mobile responsive (sm/md/lg breakpoints visually verified)
- [ ] `prefers-reduced-motion` disables Framer animations
- [ ] Lighthouse a11y ≥ 95 on layout shell
- [ ] Design tokens used everywhere (no hardcoded hex)

## Risk Assessment
- Framer Motion bundle size (~50KB) — load only on pages that animate; SSR-safe wrappers
- Mobile nav drawer complexity — keep simple (full-screen overlay, not sliding panel)
- Skipping shadcn means writing primitives from scratch — but only need 2 (Button, Card), so faster than installing
