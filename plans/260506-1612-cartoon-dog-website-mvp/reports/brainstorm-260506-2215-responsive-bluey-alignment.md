---
type: brainstorm
date: 2026-05-06
slug: responsive-bluey-alignment
status: shipped
---

# Brainstorm: Responsive + Bluey Layout Alignment

Final pass after structural Bluey replica. Aligns section order strictly to Bluey home + makes everything fully responsive.

## Decisions Locked

| Topic | Choice |
|---|---|
| Mobile nav | Hamburger → full-screen overlay (navy bg, stacked uppercase links, ESC closes, body scroll-lock) |
| Sky background | Scroll on mobile, fixed on desktop (media query, no JS toggle) |
| Section order | Reordered to match Bluey home; added 2nd FeatureBanner (dark theme) |
| Per-page nav color | Stays navy globally |

## What Changed

### Foundation
- `body { background-attachment: scroll }` default; `fixed` only at `≥768px` via media query — fixes iOS Safari rendering glitch
- `body.nav-locked` class for scroll-lock when overlay open
- Touch targets: button `min-h` 44/48/56px ramp by size

### Mobile nav
- New `mobile-nav.tsx` client component — hamburger button + full-screen overlay
- Framer AnimatePresence enter/exit
- ESC key closes, focus moves to close button
- Character peek at bottom of overlay
- Body scroll-lock applied via class

### Top nav
- Desktop pills hidden on mobile (`hidden md:flex`)
- MobileNav component handles small screens
- Touch-target safe (`min-h-[40px]` on each pill)

### Hero
- Full-bleed banner (no max-w container)
- Desktop: welcome card overlays left side, absolutely positioned over banner
- Mobile: banner full-width + welcome card stacks below (`-mt-10` for slight overlap)
- Responsive aspect ratio: 16:10 → 16:8 → 21:9 across breakpoints

### Section reorder (Bluey-aligned)
1. Hero (full-bleed)
2. IconRow
3. **FeatureBanner #1** — Shop the Pack (teal, promotion.png)
4. **FeatureBanner #2** — Watch the Pack (dark navy, golden-2.png reversed)
5. CharacterShowcase
6. VideoGrid (Latest News)
7. ActivitiesPreview
8. PromoBand
9. NewsletterCTA

### FeatureBanner enhancements
- New `theme: "light" | "dark"` prop
- Dark theme: navy bg, white text card (matches Bluey "Best Day Ever")
- Responsive padding ramp: `px-5 → md:px-10 → lg:px-14`

### Footer
- Tighter mobile gaps, `sm:grid-cols-2` breakpoint added so 2-col earlier than 3

## Files

**New:** `components/nav/mobile-nav.tsx`

**Modified:** `globals.css`, `top-nav.tsx`, `hero.tsx`, `feature-banner.tsx`, `button.tsx`, `app/page.tsx`, `footer.tsx`

## Test Targets (manual verify)

- 320px (iPhone SE 1st gen): no horizontal scroll, hamburger visible, overlay opens fully
- 375px / 414px: hero card readable, banner not too tall, CTAs tappable
- 768px (iPad portrait): desktop pills appear, hero overlay card pinned left
- 1024px / 1280px / 1440px: layout breathes, no awkward voids
- Keyboard: Tab through nav, hamburger → focus close button → ESC closes
- iOS Safari: bg-attachment scroll respected; clouds scroll w/ content on phone

## Risks Mitigated

- iOS Safari `bg-attachment: fixed` glitch → fixed with media query
- Mobile nav touch targets → 44px min on all interactive
- Focus trap → close button auto-focused; ESC closes; click in overlay doesn't bubble
- Body scroll-lock leak → useEffect cleanup removes class on unmount + close

## Bundle

Home: 116 kB First Load (+ ~6 KB for MobileNav + AnimatePresence). Still well under 200 KB budget.
