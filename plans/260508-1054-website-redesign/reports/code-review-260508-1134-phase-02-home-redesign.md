---
type: code-review
phase: 2
slug: phase-02-home-redesign
date: 2026-05-08
reviewer: code-reviewer
status: BLOCKED
---

# Phase 2 Home Redesign — Code Review

## Scope

- 3 created components (`menu-cards.tsx`, `hero-character-cluster.tsx`, `video-card.tsx`)
- 1 modified entrypoint (`app/page.tsx`)
- 7 modified components (`cinematic-hero`, `featured-pup-spotlight`, `character-showcase`, `feature-banner`, `video-grid`, `newsletter-cta`, `character-card`)
- 3 deletes (`icon-row`, `promo-band`, `activities-preview`)
- Author verified `pnpm typecheck` + `pnpm build` pass; home first-load JS 165 KB (+2 KB)

## Overall Assessment

The structural delivery, motion choreography, and component composition are good — clean prop shapes, sensible split between server and client components, correct use of `priority` on the LCP image, and a forward-compatible `VideoCard` that will carry into P4.

**However, two findings block ship.**

The first is the unaddressed **P1-H1 carry-over** from Phase 1: opacity-modified custom-color utilities (`bg-base/90`, `text-ink/85`, `border-ink/10`, `bg-ink/85`, `bg-honey/95`, etc.) compile to **zero CSS** because the `--ink`, `--bg-*`, `--surface`, `--text-on-warm*` tokens are stored as hex literals rather than RGB triplets. Phase 1 noted this would only need fixing if P2 touched those classes. Phase 2 in fact lands **20+ new uses** of these utilities across the home page — including the "Coming Soon" badge, all body-copy hierarchy, sticker borders, the newsletter input border + placeholder, and the video card hover overlay. None of them produce a rule in `.next/static/css/a70a8d0a0954fa2f.css`. Visually: every `text-ink/85` paragraph paints solid `--ink` (because `color` falls back to inherit), so there's no muted-vs-strong type hierarchy anywhere on the page.

The second is a **missing asset directory**: `MenuCards` references `/assets/card/{characters,watch,shop,music,make,events,blog}.png` for all seven sections, but `public/assets/card/` doesn't exist. Every card is going to render a 404 placeholder in production. `pnpm build` doesn't verify static asset references, so this slips past CI cleanly.

After these are fixed, four medium issues and a couple of polish nits remain.

---

## Critical Issues

### C1. `public/assets/card/*.png` — entire image set is missing
**File:** `components/home/menu-cards.tsx:31, 41, 49, 58, 67, 78, 88`

The seven cards reference:
```
/assets/card/characters.png
/assets/card/watch.png
/assets/card/shop.png
/assets/card/music.png
/assets/card/make.png
/assets/card/events.png
/assets/card/blog.png
```

`public/assets/` only contains `banner/`, `characters/`, `logo/`, `shop/`. **There is no `card/` folder.** All seven `<Image>` requests will return Next's image-not-found fallback (or 404 if `next.config` has remotePatterns enforced), making the whole "Step Into the Pack" section render with broken or empty media slots.

`pnpm build` does not validate image src paths against the filesystem (Next defers that to request-time on the `/_next/image` endpoint). That's why the build passed.

**Recommended fix:**
1. Generate or commit the seven PNG assets at `public/assets/card/{characters,watch,shop,music,make,events,blog}.png`. Aspect-square sticker assets, transparent background recommended (cards already supply tinted bg per card).
2. Add a smoke check to CI or a node script: `for f in characters watch shop music make events blog; do test -f public/assets/card/$f.png || exit 1; done`.
3. As a defensive layer, consider `next.config.ts` `images.unoptimized = true` for `/assets/**` OR fall back to a placeholder if asset is missing — but the real fix is to commit the assets.

Severity: **Critical** — visible regression on the centerpiece P2 section the moment the change ships.

---

### C2. Opacity-modified custom-color utilities still produce no CSS — P1-H1 carries into P2 widely
**Files (Phase 2 NEW or MODIFIED):**
- `components/home/menu-cards.tsx:106, 148, 166`
- `components/home/cinematic-hero.tsx:79, 87`
- `components/home/featured-pup-spotlight.tsx:44, 49`
- `components/home/character-showcase.tsx:29`
- `components/home/feature-banner.tsx:56, 68`
- `components/home/video-grid.tsx:34`
- `components/home/newsletter-cta.tsx:80, 122 (×2), 145, 189`
- `components/characters/character-card.tsx:53`
- `components/watch/video-card.tsx:49, 58 (×2), 64, 73`
- (Out of scope but same root cause: `top-videos.tsx`, `our-channels.tsx`, `watch-library.tsx`, `featured-video.tsx`, `subscribe-card.tsx`, `cookie-consent.tsx`, `mobile-nav.tsx`, `app/shop/loading.tsx`, `button.tsx:14` `bg-navy/90`)

I grepped the latest compiled stylesheet (`.next/static/css/a70a8d0a0954fa2f.css`):

```bash
$ grep -oE "\.bg-ink|\.bg-ink\\\\\/[0-9]+|\.bg-surface|\.bg-surface\\\\\/[0-9]+|\.text-ink|\.text-ink\\\\\/[0-9]+|\.text-warm-text|\.text-warm-text\\\\\/[0-9]+" \
   .next/static/css/a70a8d0a0954fa2f.css | sort -u
.bg-ink
.bg-surface
.text-ink
.text-warm-text
```

**No `.bg-ink\/85`, `.text-ink\/85`, `.border-ink\/10`, `.bg-surface\/70`, `.text-warm-text\/90` etc. ever ship.** Tailwind 3.4 silently drops them because `--ink: #2b1d10` is a hex literal — the `bg-X/N` opacity modifier requires `var(--ink)` to expand into a `rgb(... / <alpha-value>)` syntax that hex doesn't satisfy.

**Visible effects on the new home page:**
1. **Coming-Soon badge unreadable** (`menu-cards.tsx:148`): `bg-ink/85` → no background-color → badge text falls onto the parent's gradient with `text-surface` (white). `text-surface` IS emitted, but white-on-honey/peach gradient is sub-AA.
2. **No body-copy hierarchy**: every `text-ink/85` paragraph (menu-cards, cinematic-hero, character-showcase, video-grid headers, etc.) paints solid `--ink` via the body's inherited `color`, so muted body text looks identical to headings.
3. **Video play-button overlay broken** (`video-card.tsx:58`): `bg-ink/0 ... group-hover:bg-ink/30` → neither rule emitted → no hover overlay → the hover affordance the design relies on is invisible. Affects both the home Watch preview and the (P4) Watch page.
4. **Sticker borders too dark or transparent**: `border border-ink/10` on cards/inputs/feature banner → no border-color → falls back to currentColor (ink), so 1px borders read as solid dark instead of soft 10% wash. Across `cinematic-hero.tsx:79`, `feature-banner.tsx:68`, `character-card` glow ring isn't affected (uses inline style — good), but `newsletter-cta.tsx:122` input shows a heavy 1.5px ink border instead of a soft outline.
5. **Featured Pup blockquote** (`featured-pup-spotlight.tsx:49`): `bg-surface/70 ... backdrop-blur-sm` → no bg → blockquote sits transparent over the warm-tan/honey/peach gradient → the italic quote text sits directly on noise → readability hit.
6. **Newsletter input placeholder** (`newsletter-cta.tsx:122`): `placeholder:text-ink/55` not emitted → placeholder uses browser default (often visible but inconsistent across browsers).
7. **Hero text panel** (`cinematic-hero.tsx:79`): uses solid `bg-honey` (no opacity) — that one DOES work correctly. Good.

**Recommended fix — pick one path, but pick:**

A. **Convert tokens to RGB triplets (correct fix, broader scope, will be needed for P3-P5 anyway):**
```css
:root {
  --bg-base: 251 246 233;
  --bg-honey: 255 241 201;
  --surface: 255 255 255;
  --ink: 43 29 16;
  --text-on-warm: 43 29 16;
  --text-on-warm-muted: 90 65 38;
  --bg-warm-tan: 236 220 184;
  --bg-peach: 255 210 184;
  --bg-sage: 184 224 200;
  --bg-blush: 255 183 168;
  --bg-navy: 29 39 80;
  --bg-soft-sky: 221 238 247;
  --brand-primary: 232 181 71;
  --brand-honey: 255 201 102;
  --accent-gold-dark: 184 134 46;
  --accent-coral: 255 122 133;
}
body { background-color: rgb(var(--bg-base)); color: rgb(var(--ink)); }
```
And in `tailwind.config.ts`, wrap each token:
```ts
ink: "rgb(var(--ink) / <alpha-value>)",
base: "rgb(var(--bg-base) / <alpha-value>)",
surface: "rgb(var(--surface) / <alpha-value>)",
honey: "rgb(var(--bg-honey) / <alpha-value>)",
"warm-text": "rgb(var(--text-on-warm) / <alpha-value>)",
"warm-muted": "rgb(var(--text-on-warm-muted) / <alpha-value>)",
"warm-tan": "rgb(var(--bg-warm-tan) / <alpha-value>)",
peach: "rgb(var(--bg-peach) / <alpha-value>)",
// ...etc for every token referenced with /N anywhere
```
Verify by inspecting any place that uses `var(--bg-honey)` inline (e.g. `menu-cards.tsx:35` `bg: "var(--bg-honey)"`) — those still work because they're consumed as a CSS value directly, but they'll need `rgb(...)` wrapping in inline `style` props **only if** the property reads them as a color and you want them solid. Solid usage of an RGB-triplet token in `style` is `style={{ background: "rgb(var(--bg-honey))" }}`. Audit:
- `menu-cards.tsx:35,44,53,62,72,82,92` — inline `background: "var(--bg-honey)"` etc. → **must update** to `rgb(var(--bg-honey))` after migration. Or use Tailwind classes `bg-honey`, `bg-warm-tan`, etc. (preferred — already in config).
- `featured-pup-spotlight.tsx:27` — gradient: `linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--brand-honey) 50%, var(--bg-peach) 100%)` → **must update** all three to `rgb(var(--…))`. Same for `feature-banner.tsx:38` and `newsletter-cta.tsx:67`.
- `cinematic-hero.tsx` `bg-honey` (Tailwind class) — works either way.

B. **Replace `/N` modifiers with arbitrary rgba values (narrower scope, P2-only fix):**
```diff
- text-ink/85   →  text-[rgba(43,29,16,0.85)]
- bg-ink/85     →  bg-[rgba(43,29,16,0.85)]
- border-ink/10 →  border-[rgba(43,29,16,0.1)]
- bg-surface/70 →  bg-[rgba(255,255,255,0.7)]
- text-warm-text/90 → text-[rgba(43,29,16,0.9)]
- text-warm-text/95 → text-[rgba(43,29,16,0.95)]
```
This works but loses semantic naming and creates a new debt every time someone adds a tinted rule. Not recommended past one phase as a band-aid.

I strongly recommend **A** — the RGB-triplet migration. It's a 30-minute mechanical edit, fixes the entire visual hierarchy, and is a prerequisite for the rest of the design system functioning. Phase 1 already noted this would need to ship before P2 widely adopted alpha modifiers; that boat has sailed.

Severity: **Critical** — large class of visual regressions on every section of the redesigned home page. The build is green but the design system is structurally broken.

---

## High Priority

### H1. Float animation in `HeroCharacterCluster` fires pre-hydration → flash on reduced-motion devices
**File:** `components/home/hero-character-cluster.tsx:19-20, 33-36, 50-53`

Same pattern P1 M1 flagged in `AtmosphereLayer`, but more visible because the cluster is the LCP element on the home page. The component is `"use client"`, so Next still runs the server render. On the server, `useReducedMotion()` returns `false` → `float = { y: [0, -10, 0] }` and `animate` carries the array. On hydration, framer-motion reads the real media query; for users with `prefers-reduced-motion: reduce`, `reduce` flips to true and `float = undefined`. React 19 hydration is forgiving with motion-driven transforms (framer-motion handles the desync), but there is still a one-frame paint on first mount where the animation attempts to start before being torn down on reduced-motion devices.

The same bug exists in `cinematic-hero.tsx:38, 44`: `useTransform(... [0, reduce ? 0 : -60])` is fine because the reducer is read at hook init, but the `motion.div initial → animate` text panel block (lines 76-78) doesn't pre-check `reduce` and so SSR-emits the entrance transform; for reduced-motion users this means the text panel pops from `opacity:0, y:16` → `opacity:1, y:0` even though the user opted out of motion.

**Recommended fix:**
```tsx
const reduce = useReducedMotion();
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// Before mount, render static. After mount, opt-in if not reduced.
const float = mounted && !reduce ? { y: [0, -10, 0] } : undefined;
```
Apply to `hero-character-cluster.tsx` and to the `motion.div` text panel `initial`/`animate` block in `cinematic-hero.tsx:76-78` (gate `initial` so SSR + first client render match).

Severity: **High** — accessibility regression for reduced-motion users; LCP-adjacent.

---

### H2. `HeroCharacterCluster` sets `priority` on BOTH layers
**File:** `components/home/hero-character-cluster.tsx:44, 61`

Both the supporting pup and primary pup pass `priority` to `<Image>`. Next translates `priority` to `<link rel="preload" as="image">` in the document head. Two preloads compete for the same critical path, and only the primary (LCP) needs it. On a 4G mobile network this can push the supporting pup's request ahead of the hero's actual LCP image.

Per Next.js docs, **only the LCP image should get `priority`**. The supporting pup is a non-essential decorative layer.

**Recommended fix:**
```diff
// supporting pup
- priority
+ loading="eager"  // or simply remove — fill+loading=lazy is fine for off-LCP decoratives
```
Or drop the explicit `loading` and let it default to `lazy` (it's above-the-fold so eager would still be a win, but LCP-priority is for the one image that matters most).

Severity: **High** — affects mobile LCP, which is a P2 acceptance criterion (`LCP ≤ 2.5s on 4G mobile`).

---

### H3. Newsletter input has `disabled` but error label is missing initial state
**File:** `components/home/newsletter-cta.tsx:120-124, 141-148`

Two small async/state issues:

1. The error live region (`<p id="newsletter-error" role="alert">`) is rendered with empty content while idle. `role="alert"` triggers screen readers any time the element changes from absent → present. It's already mounted with `min-h-[1.25rem]`, so SR re-announcements only fire on text change — that's fine. But: when `state === "submitting"`, the input is `disabled` and `aria-invalid={state === "error"}` is `false`, but `aria-describedby` is still `undefined` until error. Good.
2. **Honeypot field uses `className="hidden"`**: this hides via `display:none`, which most spambots happily bypass because they parse the form structure. Stronger pattern is off-screen positioning + `aria-hidden` + `tabIndex={-1}`:
   ```tsx
   className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
   ```
   `display:none` plus `tabIndex={-1}` is fine for keyboard accessibility but doesn't trip well-tuned bots that simulate a browser.

   Also, the newsletter API receives `hp` from the body. Verify the API rejects when `hp !== ""` — couldn't see `app/api/newsletter/route.ts` content in this review pass; flag if it doesn't.

3. The error message string interpolates `${error}` directly. If the API ever returns user-controlled text (e.g. echoing a malformed email), this becomes a self-XSS vector — but React escapes text in JSX by default, so this is safe. No action.

**Recommended fix:** improve the honeypot positioning (item 2) and verify the API checks `hp` server-side.

Severity: **High** (spam-defense effectiveness) / **Low** (a11y).

---

## Medium Priority

### M1. Duplicate `id="meet-the-pack"` anchor — `CharacterShowcase` defines it AND the section's own "View all" link points back to itself
**File:** `components/home/character-showcase.tsx:19, 45`

The section IS `meet-the-pack`. Three buttons elsewhere on the page (`cinematic-hero.tsx:96`, `featured-pup-spotlight.tsx:60`, `menu-cards.tsx:32`) link `href="#meet-the-pack"`. That works. But inside the same component, line 45's "View all characters" link also points to `#meet-the-pack` — which is the parent section. Clicking it does nothing useful (you're already there). The plan probably intended this to point to a `/characters` index page, but no such page exists in `app/`.

**Recommended fix:** either:
- Drop the link until the characters index page exists, or
- Point it to the first character's page: `href={`/characters/${characters[0]?.slug}`}` (less ideal), or
- Add an `app/characters/page.tsx` index with all 5 cards.

Also: the in-page anchor jumps to `#meet-the-pack` without `scroll-mt-` adjustments on Safari mobile sometimes overshoot due to the sticky nav. The class IS set (`scroll-mt-24`, line 20) — good.

Severity: **Medium** — broken link behavior, not data loss.

---

### M2. `MenuCards` "coming-soon" `<div role="link">` is the wrong primitive
**File:** `components/home/menu-cards.tsx:184`

```tsx
<div role="link" aria-disabled="true" className={wrapperClass}>
```

`role="link"` requires keyboard and click activation handlers; an undecorated `<div>` with that role is announced by AT as "link, dimmed/disabled" but is **not focusable** (no `tabIndex`), so the disabled state can't actually be perceived by keyboard users — they skip it entirely. WCAG 2.1 SC 4.1.2 expects the element to expose its state to AT.

There's a stronger argument for not using the link role at all here: nothing happens on click, the visual is purely informational. A plain `<div>` (no role) with the "Coming Soon" badge as the announced content is more honest.

**Recommended fix:**
```tsx
// option A — drop the role, treat as a card-shaped poster
<div className={wrapperClass} aria-label={`${card.label} — coming soon`}>
  {inner}
</div>

// option B — keep role="link" but make it operable + announced correctly
<div
  role="link"
  aria-disabled="true"
  tabIndex={0}
  className={wrapperClass}
>
  {inner}
</div>
```
Option A is simpler and matches the user's mental model (a sticker, not a click target).

Severity: **Medium** — a11y polish, low impact (only affects keyboard users on coming-soon cards).

---

### M3. `FeaturedPupSpotlight` uses `-mx-4 md:-mx-8` but is wrapped in `<ScrollReveal>`
**File:** `app/page.tsx:34-36`, `components/home/featured-pup-spotlight.tsx:20`

```tsx
// app/page.tsx
<ScrollReveal>
  <FeaturedPupSpotlight />  // section uses -mx-4 md:-mx-8 to break out
</ScrollReveal>
```

`ScrollReveal` renders a `motion.div` (no explicit `width`/`max-width`/`overflow`), so it inherits the parent's flow width. The negative margins on the section pull the hero edges past the parent — which on the homepage is the `<main>` element from `app/layout.tsx`, which I suspect is full-width (no `max-w-*`). So the layout SHOULD work.

But `ScrollReveal` has `whileInView` with `viewport={{ once: true, amount: 0.2 }}` — with the section bleeding outside the parent, the **viewport amount calculation** uses the motion.div's bounding box, which is the inset rect, not the visual rect. On wide screens this is fine, but on a narrow viewport where the section is only partially visible at the breakpoint where the negative margin kicks in (md:768px), the reveal threshold can be miscalculated. Easy to verify in a browser; couldn't fully dry-run the viewport math without running it.

Same concern applies to `FeatureBanner` and `NewsletterCTA` which are full-bleed by virtue of using `position: relative` + curves but DON'T use negative margin — those should be fine. Only `FeaturedPupSpotlight` uses the negative-margin trick.

**Recommended fix:** move the negative margin onto the `<ScrollReveal>` itself, or wrap the section in a `<div className="overflow-hidden">` so the bleed is intentional and tested. Alternatively, drop `ScrollReveal` for the Buddy section since the curves already create dramatic visual entrance — fade-up is redundant.

Severity: **Medium** — flagged as a pre-emptive concern; verify in-browser. If the fade-up timing looks fine on iPad portrait (the breakpoint where negative margin starts), no action.

---

### M4. `CinematicHero` `useScroll` target may be incorrect for mobile (scroll handler runs even when parallax is intentionally disabled)
**File:** `components/home/cinematic-hero.tsx:39-44, 57`

```tsx
const ref = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
const yMedia = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
```

`useScroll` attaches a passive scroll listener regardless of viewport size. On mobile (where `aspect-square` and stacked layout means parallax is visually meaningless and the spec calls for it disabled `<md`), the hook still runs every scroll event and writes `style.y` to the media wrapper. The output is `0px → -60px` over the section, which on mobile is barely perceptible but still fires layout work.

The plan said: `Hero parallax disabled <md breakpoint`. Current implementation doesn't actually disable it; the transform value is just small.

**Recommended fix:**
```tsx
const isDesktop = useMediaQuery("(min-width: 768px)");  // or conditionally render motion.div
const yMedia = useTransform(
  scrollYProgress,
  [0, 1],
  [0, !reduce && isDesktop ? -60 : 0],
);
```
Or use framer-motion's `useMotionValueEvent` to read the value and skip the transform application below 768. Cleaner: gate the entire `useScroll`/`useTransform` block behind a media query check (note: `window.matchMedia` requires SSR-safe handling — see hydration concern).

Severity: **Medium** — perf nit on mobile; not a functional break, but plan-mismatch.

---

### M5. `VideoGrid` falls back to placeholder videos when no real IDs exist — fallback shape passes `youtubeId.startsWith("TODO")` check, render path uses fallback thumbnail, but the click target opens `https://www.youtube.com` (channel root)
**File:** `components/home/video-grid.tsx:20`, `components/watch/video-card.tsx:30-32`

```tsx
// video-grid.tsx
const featured: Video[] = (ready.length >= 3 ? ready : videos).slice(0, 3);

// video-card.tsx
const isPlaceholder = video.youtubeId.startsWith("TODO");
// ...
const href = isPlaceholder ? "https://www.youtube.com" : `https://www.youtube.com/watch?v=${video.youtubeId}`;
```

If `videos.json` has fewer than 3 real videos, the section back-fills with TODO entries. The card renders the banner.png as thumbnail (good), but the link opens youtube.com root, not the channel — a dead-end click that may also inflate analytics on the wrong destination if/when GA4 is wired up.

**Recommended fix:** if `isPlaceholder`, prefer the configured channel URL from `siteConfig.social.find(s => s.platform === "youtube").url`:
```tsx
// video-grid.tsx — pass channelUrl down
<VideoCard video={video} channelLabel="@ScoutPawTV" placeholderHref={youtubeUrl} />
```
Or hide placeholder cards entirely and show a "More videos coming soon" fallback when `ready.length < 3`.

Also, the section header text reads `Calm. Cozy. Cued up.` which is unrelated to whether real videos exist — no UX fallback for the empty state.

Severity: **Medium** — degrades UX in the demo state but not a bug per se.

---

## Low Priority

### L1. `MenuCards` `isLive("/music")` check uses a different path than the card href
**File:** `components/home/menu-cards.tsx:59, 63`

```tsx
href: "/coming-soon/music",
comingSoon: !isLive("/music"),
```

The lookup checks the navItems array for `/music` (which doesn't exist in nav), but the href if-live points to `/coming-soon/music`. Today this is harmless because `isLive("/music")` always returns false → `comingSoon: true` → href is dead code. But:

- If someone enables Music in nav as `{ href: "/music", enabled: true }`, the card flips to "live" and tries to navigate to `/coming-soon/music` — which doesn't exist as an `app/coming-soon/[slug]` entry (only `games`, `activities`, `about` are in `coming-soon.json`). Result: 404.
- The comparable card for Make uses `isLive("/coming-soon/activities")` (matches the href), so the convention is inconsistent within the same file.

**Recommended fix:** unify either to `comingSoon: true` (hardcoded, since the lookup is moot today) or fix the lookup to `isLive("/coming-soon/music")` AND add a `music` entry to `coming-soon.json`.

Also: Events card has `href: "/coming-soon/events"` but `events` is not in `coming-soon.json` either. Same dead-href hazard the moment it's flipped on.

Severity: **Low** — latent bug; only triggers when nav config changes.

---

### L2. `FeaturedPupSpotlight` `SunRays` SVG uses `viewBox="0 0 1440 800"` with `preserveAspectRatio="slice"` but absolutely-positioned to `inset-0`
**File:** `components/home/featured-pup-spotlight.tsx:96-100`

The SVG fills 100% of section width/height, uses `slice`, and centers around point `(1010, 400)` in a 1440×800 viewBox. On narrow viewports (< 1440 wide), the SVG slices, pulling the sun's center *off* the right edge — which is the intent. But on very wide viewports (> 1920 panoramic), the sun shrinks and migrates leftward, and at 4K+ the rays project past Buddy's image into the copy column. Nice cinematic touch, but consider clamping with `max-w-[1920px] mx-auto` on the SVG wrapper or using `objectPosition`-style alignment via `xMaxYMid` (right-aligned) instead of `xMidYMid`.

Severity: **Low** — visual polish.

---

### L3. `MenuCards` `<Image alt="">` paired with `aria-hidden="true"` is redundant
**File:** `components/home/menu-cards.tsx:155-160`

```tsx
<Image src={card.image} alt="" ... aria-hidden="true" />
```

An empty `alt` already removes the image from the AT tree. `aria-hidden="true"` on top of that is redundant and, per ARIA spec, a no-op. Drop one. Convention in this codebase elsewhere is just `alt=""` (e.g. `featured-pup-spotlight.tsx:74` uses descriptive alt because Buddy IS content).

Severity: **Low** — code cleanup.

---

### L4. `CharacterShowcase` `slice(0, 5)` silently drops 6th+ characters
**File:** `components/home/character-showcase.tsx:36`

If `characters.json` ever holds 6+ pups, the home page silently shows only 5. The "View all characters" link should then matter — but per M1 it points back to the same anchor. Consider documenting in code:
```tsx
{/* Home shows the top 5; full roster lives at /characters (TODO P3+). */}
{characters.slice(0, 5).map(...)}
```

Severity: **Low** — observation.

---

### L5. `feature-banner.tsx` `reverse` prop uses a CSS-grid hack that may not work reliably
**File:** `components/home/feature-banner.tsx:44`

```tsx
className={`... ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}
```

The `reverse=false` default omits the order class. When `reverse=true`, only the first child gets `order-2`, but the second child has no explicit `order`, so it stays at default 0. This works but is fragile: if a future caller adds a third child (e.g. an absolute decoration), it'll order BEFORE the first child unintentionally. The Tailwind arbitrary-variant `[&>div:first-child]:order-2` is also harder to grep than a clean conditional.

Phase 2 only uses `reverse=false` (the Shop banner), so this isn't a current bug. Just a forward note.

Severity: **Low** — forward maintainability.

---

### L6. `NewsletterCTA` decorative paws use `text-ink/15` which fails to compile (see C2)
**File:** `components/home/newsletter-cta.tsx:189`

`text-ink/15` is dropped → corner paws inherit `text-ink` (solid 100%). What should be a soft 15%-opacity decoration becomes very dark visible paws on the honey gradient. After C2 fix, this corrects automatically. Flagged here so it's not missed during visual QA.

Severity: **Low** — auto-fixed by C2.

---

### L7. `cinematic-hero.tsx` ref is `useRef<HTMLElement>(null)` but `<section ref={ref}>` is a `HTMLSectionElement`
**File:** `components/home/cinematic-hero.tsx:39, 47`

`HTMLElement` is the supertype, so this typechecks. Slightly tighter:
```tsx
const ref = useRef<HTMLElement | null>(null);
```
Or `useRef<HTMLDivElement>(null)` if we ever change the wrapper to a div. No-op for current build.

Severity: **Low** — typing nit.

---

## Edge Cases / Other Observations

- **Shop page side-effect verified.** `app/shop/page.tsx:25-42` still passes `image="/assets/shop/promotion.png"` and a custom `actions` slot to `<CinematicHero>`. The new media-vs-image branch (`media ?? (image && <Image ... />)`) handles the legacy `image` path. No type errors. Visual zoning differs from P1 (the old hero had a floating sticker layout; the new one uses 55/45 with the text panel on a honey sticker), but author noted P3 will redesign Shop. Acceptable as transition state. **However**, `app/shop/page.tsx:31` passes `objectPosition="center center"` — the new hero passes that down to the fallback `<Image>` (line 68), so it works. No regression on Shop.
- **`app/shop/loading.tsx:11` still uses `bg-surface/90`** — same C2 root cause; out of P2 scope but flagged for the systemic fix.
- **Section curves stack:** Hero (no curves) → MenuCards (no curves) → FeaturedPupSpotlight (top + bottom hill, color `var(--bg-base)`) → CharacterShowcase (no curves, `bg-base` via body cascade) → FeatureBanner (top + bottom wave, color `var(--bg-base)`) → VideoGrid (no curves) → NewsletterCTA (top + bottom cloud, color `var(--bg-base)`). The pattern is correct: each curved section's top/bottom curves match the cream sections it sits between. No z-index conflicts because no two curved sections sit edge-to-edge. **Good.**
- **`SectionCurve` color uses `var(--bg-base)`** — that's a literal hex token in `style={{ fill: color }}`. SVG `fill` accepts hex directly, so this works. No C2 impact.
- **MenuCards inline-style `background: card.bg`** uses `var(--bg-honey)` etc. As CSS values consumed inline, these are fine because CSS color properties accept the hex value the variable resolves to. **Not affected by C2.**
- **`character-card.tsx:28` `boxShadow: ${character.accentColor}aa`** — concatenates an 8-digit hex (ARGB). Browsers accept the `aa` alpha suffix. Works. Nice trick.
- **`FeaturedPupSpotlight` server component** uses `await content.getCharacters()` and `app/page.tsx` does the same call separately. Two `getCharacters()` reads per home request. The content layer probably caches with React's `cache()` or Next's request memoization — verify by reading `lib/content/index.ts`. If not memoized, this is a Medium-priority N+1 risk that should ride a follow-up.
- **`useReducedMotion()` from framer-motion is React 19 / RSC compatible** — it auto-no-ops in SSR by reading default false. The hydration mismatch concern in H1 is about the post-mount transition, not framer-motion itself.
- **No new dependencies added.** Verified by inspection of `app/page.tsx` imports and component imports.
- **`VideoCard.alt=""`** on the thumbnail (line 53) is correct — the `<Link aria-label>` already announces "Watch X on YouTube". Empty alt avoids double-announcement.
- **`video-grid.tsx` sees the `youtube` social entry** — currently `https://www.youtube.com/` (placeholder root). The fallback "WatchOn @ScoutPawTV" link opens YouTube root in a new tab. Same dead-end concern as M5. Cosmetic.

---

## Backwards Compatibility / Regressions

- ✅ `<CinematicHero>` API: `media` is new + optional, `image` retained, no breaking change. Existing Shop callsite works.
- ✅ `<FeatureBanner>` removed `background` prop per plan; only home callsite, both pre-modify and post-modify pass the same other props. Verified.
- ✅ `<NewsletterCTA>` accepts new optional `socialProof` prop with sensible default; Shop callsite at `app/shop/page.tsx:76-79` doesn't pass it but uses `heading`/`subheading` overrides correctly. ✓
- ✅ `<CharacterCard>` accepts the same `character` prop as before — `app/characters/[slug]/page.tsx` (if any) and any other caller is unaffected. The hover name pill is purely additive markup.
- ✅ `app/page.tsx` import set is clean; deleted components (`icon-row`, `promo-band`, `activities-preview`) are no longer imported. Verified. No dead imports.
- ⚠️ Tailwind purge sees the new utilities, but Tailwind ALSO sees the old `bg-base/90` in `app/shop/loading.tsx` and `bg-navy/90` in `button.tsx:14` — both are pre-existing P1 debt. The systemic fix (C2 option A) resolves all of them at once.

---

## Consistency / Naming

- File names: kebab-case, descriptive. ✓
- `VideoCard` correctly placed at `components/watch/` even though P2 uses it on home — it's the canonical card per phase plan, P4 will own the surrounding rails. ✓
- `HeroCharacterCluster` lives at `components/home/` because it's home-specific (per plan). ✓
- Section IDs (`meet-the-pack`, `videos`, `newsletter`) match nav anchors and `scroll-mt-24` is applied uniformly. ✓
- `font-display` + `text-display-*` token usage is consistent with P1. ✓

---

## Acceptance Criteria Cross-check (from phase-02-home-redesign.md)

| Criterion | Status |
|---|---|
| Home page renders 7 sections in spec order | ✅ verified in `app/page.tsx` |
| Hero: text panel + character cluster never overlap at any breakpoint | ✅ `md:grid-cols-[1.05fr_1fr]` separates zones; mobile stacks |
| Hero parallax active ≥ md, disabled < md | ⚠️ active at all sizes — see M4 |
| Menu cards: 7 visible, sticker rotations, hover lift smooth | ❌ images missing — C1 |
| Meet Buddy: Buddy ≥ 70% panel height, copy readable AA contrast | ⚠️ ≥70% yes; AA contrast hit because `text-warm-text/90` doesn't compile — see C2 |
| Character showcase: 5 staggered, hover reveals name + breed + glow | ✅ markup matches; verify after C2 fix |
| Shop banner: full-bleed, CTA visually dominant | ✅ |
| Watch Together: 3 cards + see-all link | ✅ |
| Newsletter CTA: form submits to existing `/api/newsletter` endpoint | ✅ verified `route.ts` exists |
| Lighthouse mobile perf ≥ 85 | ⚠️ not verified by reviewer — H2 (double-priority) may regress |
| Axe: zero AA violations | ❌ contrast violations expected from C2 (no muted hierarchy) |

---

## Recommended Actions (Prioritized)

1. **C1: Commit the seven `public/assets/card/*.png` images** — without these the entire menu section is broken on first user visit.
2. **C2: Migrate `--ink`, `--bg-*`, `--surface`, `--text-on-warm*`, `--brand-*`, `--accent-*` to RGB-triplet form** in `app/globals.css` and wrap them with `rgb(var(--…) / <alpha-value>)` in `tailwind.config.ts`. Audit the four inline-style gradients and seven `style={{ background }}` spots in `menu-cards.tsx` to use `rgb(...)` syntax. ~30 min, fixes ALL 25+ flagged class usages globally including the P1 nav debt and the shop loading screen.
3. **H1: Gate hero animations behind a `mounted` flag** in `hero-character-cluster.tsx` and the text-panel `motion.div` in `cinematic-hero.tsx` to prevent SSR/CSR motion mismatch.
4. **H2: Drop `priority` from the supporting pup** in `hero-character-cluster.tsx:44`.
5. **M4: Disable parallax `<md`** in `cinematic-hero.tsx` (gate `useScroll`/`useTransform` behind a viewport check).
6. **M2: Replace `<div role="link" aria-disabled>` with plain `<div aria-label>`** in `menu-cards.tsx:184`.
7. **M1: Either remove the redundant "View all characters" link or fix its target** in `character-showcase.tsx:43-50`.
8. **L1: Reconcile `isLive` lookup paths** with card hrefs in `menu-cards.tsx`, OR hardcode `comingSoon: true` for cards whose live state isn't actually wired.
9. **M5: Hide placeholder videos OR redirect to channel URL** in `video-grid.tsx:20` / `video-card.tsx:30`.
10. **H3: Strengthen newsletter honeypot** to off-screen positioning and verify server-side check.
11. (Optional) Add a CI guard `scripts/check-assets.mjs` that asserts every `Image src="/assets/..."` resolves on disk.

---

## Metrics

- New files: 3 (menu-cards, hero-character-cluster, video-card)
- Modified files: 8 (page.tsx + 7 home components + character-card)
- Deleted files: 3 (icon-row, promo-band, activities-preview)
- Missing assets: **7** (C1)
- Opacity-utility silent-drop classes added in P2: **20+** (C2)
- New dependencies: 0 ✅
- Compile errors: 0 ✅ (silently — Tailwind drops unsatisfiable utilities without warning)
- TypeScript errors: 0 ✅ per author
- Visible regressions on home page: **C1 (menu media), C2 (typography hierarchy + borders + overlays)**
- a11y new concerns: 1 (M2 disabled-link) + reduced-motion flash (H1)

---

## Unresolved Questions

1. Are the seven `assets/card/*.png` images authored and pending commit, or do they need to be generated from scratch (in which case the brainstorm doc / brand owner needs to confirm style direction)?
2. Should the C2 fix ship as a standalone P1.5 ticket OR be folded into the P2 patch? Recommendation: bundle into P2 since the home page is unshippable without it. Cost: ~30 min of mechanical edits; benefit: unblocks P3+P4 styling decisions.
3. Is `lib/content/index.ts` request-memoized or do `getCharacters()` calls in `app/page.tsx` AND `featured-pup-spotlight.tsx` each hit the JSON parser? (Out of P2 scope but worth a follow-up to confirm; if not memoized, it's a Medium-priority perf nit and trivial to fix with React's `cache()`.)
4. Was visual QA performed on the home page in a real browser? `pnpm typecheck` and `pnpm build` are necessary but neither catches C1 or C2 — a manual or Playwright-based visual diff against the design intent would have surfaced both.
5. Is there a `/characters` index route planned for P3 (M1 dependency)?

---

**Status:** BLOCKED
**Summary:** Phase 2 ships well-structured component code with sensible motion choreography, but two critical issues prevent landing: all seven menu-card images are missing from `public/`, and the unaddressed Phase 1 Tailwind opacity-utility quirk has propagated to 20+ new uses in P2 — silently producing no CSS and breaking the entire body-copy hierarchy, sticker borders, video play overlay, and the Coming Soon badge background.
**Concerns/Blockers:** C1 (missing assets — every menu card 404s), C2 (opacity utilities silently drop — body copy reads at 100% ink instead of 85%, no muted hierarchy anywhere). Unblock by committing the assets and migrating CSS variables to RGB-triplet form. After fixes, four medium items (parallax-on-mobile, role=link a11y, double-priority LCP, video-grid placeholder) remain non-blocking polish.
