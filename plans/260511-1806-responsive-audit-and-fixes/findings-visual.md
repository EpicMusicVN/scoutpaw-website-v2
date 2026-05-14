# Visual Findings — Responsive Audit
Generated: 2026-05-11. Captured via production build (`pnpm start`) — dev mode had stale chunk errors that masked content rendering.

## Coverage
- Pages captured: 7 / 7
- Viewports per page: 7 (360x640, 390x844, 768x1024, 1280x800, 1440x900, 1920x1080, 2560x1080)
- Total screenshots: 49 (~19MB)

## Severity Rubric
- **Critical** — broken layout, unreachable controls, content overflow at common viewports
- **Major** — awkward stacking, focal subject cropped, hero failing intent
- **Minor** — spacing roughness, cosmetic

---

## Cross-Page Issue: Cookie Consent Banner Dominates Mobile

**Severity:** Major — affects every page on first visit
**Screenshots:** All `*-360x640.png`, `*-390x844.png`, `*-768x1024.png`

`components/analytics/cookie-consent.tsx` renders a fixed bottom banner that:
1. **Takes ~30-40% of viewport on mobile** (360x640), covering hero CTAs, body copy, and on some pages the hero title (`coming-soon-games-360x640.png` — heading "Games are wagging this way" gets clipped)
2. **Decline button is text-only style** (`px-4 py-2 text-sm`, no `min-h`, no border, just link-style) — visually weak affordance and touch target ~32-36px (sub-44px)
3. **Accept button is `px-5 py-2`** — also sub-44px height (~36-40px)

**Fix recommendation (already in code-static findings):** migrate both buttons to shared `<Button>` component (`variant="ghost"` for Decline, `variant="primary"` size=md for Accept). Bonus: consider a slim variant at <md viewports (single-line copy + smaller buttons) to reclaim viewport space.

**Touch targets** (visual confirmation of code-static finding):
- `cookie-consent.tsx:64-69` Decline: ~32-36px ❌
- `cookie-consent.tsx:70-75` Accept: ~36-40px ❌

---

## / (Home)

### 360x640
- **Minor**: Hero renders well — characters cluster at top, tagline + "Watch Now"/"Meet the Pack" buttons mid-screen. Cookie banner covers ~35% of viewport bottom-half.
- Screenshot: `./screenshots/home-360x640.png`

### 768x1024
- **Minor**: Hero shows large dog face (corgi) — focal subject. Cookie banner overlays the "Meet the Pack" button. Acceptable framing.
- Screenshot: `./screenshots/home-768x1024.png`

### 1280x800 / 1440x900
- Clean. Cookie banner is a slim pill bottom-right. Hero excellent.

### 1920x1080
- Clean. Hero banner image scales as intended.

### 2560x1080
- **Minor**: Ultra-wide stretches the banner image; the central corgi face dominates the right half (focal cropping is "fine" since the design intent is character-heavy). Tagline + CTAs intact on left third. Acceptable.

---

## /shop

### 360x640
- **Major**: Hero is dominated by zoomed-in painted "ESSENTIALS / PARENTS" text from the top-left region of `promotion.png`. The shop product (t-shirt) is NOT visible. `object-cover` on a 1920×1073 source applied to a 360×640 portrait viewport crops to the top-left, hiding the focal product. Below hero: kicker + description partially visible but heavily occluded by cookie banner.
- **Fix**: Adjust `objectPosition` on shop hero (`components/shop/stacked-hero.tsx:35`) to favor the product area (e.g., `objectPosition: "center 60%"` so the t-shirt and mug surface at mobile portrait).
- Screenshot: `./screenshots/shop-360x640.png`

### 768x1024
- **Major**: Same painted-text-zoomed framing problem. Right half of image (mug, hat) cropped out.
- Screenshot: `./screenshots/shop-768x1024.png`

### 1280x800 / 1440x900 / 1920x1080 / 2560x1080
- Hero works at desktop — full image visible with painted text on left, t-shirt center, mug + hat on right. Honey gradient mask works on the LEFT, but it overlaps the painted "DOG PARENTS / essentials" type which is also on the left — minor visual competition between HTML kicker/description and painted-in artwork.
- **Minor**: Consider whether the HTML kicker "SCOUTPAW SHOP" is redundant with the painted artwork. May be cleaner to drop the visible kicker (keep sr-only h1) so the painted text owns the left.

---

## /watch

### 360x640
- Clean. Title "Watch the Whole Pack." renders in 2 lines (`text-4xl`). Both CTAs visible. Cookie banner overlays where featured video would appear below.
- Screenshot: `./screenshots/watch-360x640.png`

### 768x1024 — **MAJOR**: Tagline wraps awkwardly
- Title "Watch the Whole Pack." wraps to **4 lines** (`Watch / the / Whole / Pack.`) because the 3-col grid puts text in `minmax(0,3fr)` of 12fr = 25% of viewport. At 768px width minus padding (~736px usable) the text col is ~184px — too narrow for `text-5xl` (48px) headline.
- **Fix**: Widen the text col at md (`md:grid-cols-[minmax(0,3fr)...]` → `md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)_minmax(0,1fr)]` OR `md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,1fr)]` until lg). Right cluster column gets thinner at md (still has cluster figures visible at right edge).
- **Also Major**: Navbar "Join the Newsletter" button wraps to 2 lines at 768 (visible split "Join the / Newsletter") — likely a `min-w-0` or button `whitespace-nowrap` missing.
- Screenshot: `./screenshots/watch-768x1024.png`

### 1280x800 / 1440x900 / 1920x1080
- Tagline wraps to 3 lines (`Watch the / Whole / Pack.`) — visually acceptable for cinematic hero. Featured video centered, characters on sides. Clean.
- Screenshot: `./screenshots/watch-1280x800.png`, `./screenshots/watch-1920x1080.png`

### 2560x1080
- Same 3-line wrap. Characters cluster shows third figure on left edge of right column.
- Screenshot: `./screenshots/watch-2560x1080.png`

---

## /coming-soon/games

### 360x640
- **Major**: Cookie banner CLIPS the title "Games are wagging this way" — heading text bleeds into banner area. After dismissal, layout fine.
- Screenshot: `./screenshots/coming-soon-games-360x640.png`

### 768x1024 / 1280x800
- Layout fine. Cookie banner overlays subheading area but not heading.
- Note: at 1280, brief glimpse of yellow strip at bottom — the NewsletterCTA honey gradient peeking, with GrassStrip below. Good footer transition.

### 1920x1080+ 
- Excellent. Character + heading + tagline centered. Plenty of negative space at ultra-wide.

---

## /characters/buddy

### 360x640
- Title "Buddy" + tagline visible. Character image starts but cut by cookie banner (~50% visible).
- Screenshot: `./screenshots/characters-buddy-360x640.png`

### 768x1024 / 1280x800 / desktop
- Clean. Golden retriever standing on right of accent-tinted hero block. Cookie banner becomes slim pill at desktop.
- Screenshot: `./screenshots/characters-buddy-1280x800.png`

### 1920x1080+
- Clean. Lots of negative space at ultra-wide; intentional center-card layout.

---

## /privacy and /terms

### 360x640
- **Minor**: Cookie banner covers the "This is a placeholder page..." italicized note. Title + first paragraph visible.
- Screenshot: `./screenshots/privacy-360x640.png`

### 768x1024+
- Clean. White card layout works at all sizes. GrassStrip + dark footer visible at scroll.

### 1920x1080+
- Clean. Centered card with large negative-space margins — intentional for legal pages.
- Screenshot: `./screenshots/terms-1920x1080.png`

---

## Cross-Page Patterns

1. **Cookie consent dominates mobile viewports** — every page first impression is degraded. PRIORITY-1 fix.
2. **Hero image `objectPosition: center` is wrong for shop on portrait viewports** — focal subject (products) lives center-right of source image; portrait crop zooms top-left text.
3. **Watch hero text col too narrow at md** — `minmax(0,3fr)` produces 4-line title wrap at 768px.
4. **Top-nav Newsletter button wraps at md** — `Join the Newsletter` should `whitespace-nowrap` or shrink to "Newsletter" at md only.
5. **Footer transitions are clean** — honey gradient → honey-recolored grass curve → grass blades → navy footer. The `:has(#newsletter)` CSS fix from prior session is working.

---

## Stats
- **Total findings**: 13 (0 critical, 5 major, 8 minor)
- **Pages with major issues**: /shop (hero crop), /watch (md tagline + nav wrap), /coming-soon/games (cookie cliping title), + cross-page cookie banner
- **Pages clean at all viewports**: /privacy, /terms (apart from cookie banner which is universal)
- **Production-mode screenshots only** — dev mode was non-functional during capture (motion-dom vendor chunk error)

---

## Unresolved Questions
1. Should the cookie banner have a mobile-specific compact variant?
2. Is the shop hero painted-text overlap with HTML kicker intentional brand or undesired collision?
3. Should Watch hero text col distribution use a different breakpoint ratio at md vs lg (e.g., `md:grid-cols-[1fr_2fr]` then `lg:grid-cols-[3fr_7fr_2fr]`)?
