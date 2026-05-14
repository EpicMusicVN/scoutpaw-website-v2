---
type: brainstorm
date: 2026-05-08
slug: website-redesign
status: approved
---

# ScoutPaw Website Redesign — Brainstorm Summary

## Problem Statement

Current site reads small, empty, and visually flat against the brand brief. Bluey reference shows: cinematic scale, playful sticker layouts, atmospheric continuity, strong CTAs. ScoutPaw must adopt that *spirit* (scale, playfulness, motion) while keeping its distinct warm cream/honey/gold identity (NOT clone Bluey's sky-blue). Watch page IA is wrong taxonomy (treats YouTube uploads as episodic shows).

## Strategic Decisions (locked)

| Decision | Choice |
|---|---|
| Redesign depth | Component-level overhaul (~70% UI surface) |
| Background atmosphere | Keep cream/honey, add atmospheric layer + per-section accents |
| Watch data | Mockup JSON now, adapter pattern → swap to YouTube Data API later |
| Motion budget | Tasteful + cinematic (parallax, hover, scroll reveals, shimmer) |

## Approaches Evaluated

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| Targeted polish | Fast, low risk | Doesn't fix scale/playfulness — root issue persists | Rejected |
| **Component overhaul** | Fixes layout DNA, keeps token system + content layer | Touches most home/shop/watch components | **Selected** |
| Full rebuild | Clean slate | 3-5x timeline, throws away working content/auth/Shopify integration | Rejected (YAGNI) |

## Final Solution

### Global system
- **AtmosphereLayer** component: SVG floating paws + golden dust + soft clouds, per-page tinting
- Scale-up: hero/banner containers `max-w-[1400px]`, vertical padding bumps to `py-24/36`
- Contrast pass: kill `text-ink/65` on body copy; `text-ink/85` → `text-ink/90` on warm bg
- Section-edge SVG curves for atmospheric continuity
- Yellow paw favicon via `app/icon.png` (Next 15 file convention)
- All decoratives respect `prefers-reduced-motion`

### Navbar
- `bg-navy` → `bg-base/90 backdrop-blur` + scroll shadow
- Bigger Shop CTA (`size="lg"` sticker), Newsletter outline CTA (scroll to footer — KISS, no modal)
- Mobile button 44px tap target, animated burger
- Honey underline hover (CSS `::after`)

### Home page (final order)
1. **Hero** — split zones (text panel left, character cluster right w/ parallax). Buddy front + 1 supporting only (mobile perf).
2. **Menu Introduction** — asymmetric sticker grid using all 7 `assets/card/*.png` (live + coming-soon), tagged accordingly.
3. **Meet Buddy Banner** — full-bleed gradient, oversized Buddy, sun-ray decoratives, new emotional copy (TBD with copywriter or AI-assisted).
4. **EXPLORE Characters** — staggered layout w/ per-character accent backdrops, hover name reveal + glow.
5. **Shop Banner** — full-bleed 60/40, product collage, oversized sticker CTA.
6. **Watch Together** — 3 featured + see-all link, reuses Watch components.
7. **Join the Pack** — honey gradient, oversized form, social proof line.

### Shop page
1. Shop Hero (same zoning as home)
2. Explore Products — category sticker tiles
3. Shop the Pack (premium product grid)
4. More About ScoutPaw Shop — 3 trust pillars
5. Join the Pack (shared)

### Watch page (full IA restructure)
1. Hero
2. **Featured Video** — single hero card
3. **Latest Uploads** — horizontal rail (3-4 visible)
4. **Browse by Playlist** — 3 thematic playlists
5. **Channel Showcase** — horizontal rail (smaller, denser)
6. **Full Library** (existing component w/ filters)
7. Subscribe Card

### Watch data shape (extends `content/videos.json`)
```json
{
  "id": "...", "youtubeId": "...", "title": "...",
  "thumbnail": "...", "duration": "12:34",
  "channelId": "scoutpaw-tv", "views": 15420,
  "uploadDate": "2026-04-12", "category": "calm-sounds",
  "tags": ["nap","ambient"], "featured": false, "playlist": "naps"
}
```
Adapter in `lib/content` — JSON today, YouTube Data API later, same shape.

## Technology Stack
Keep all current deps. **No new packages.**
- Next 15 + React 19 + Tailwind + framer-motion (existing)
- SVG inline atmospherics (no Lottie — perf)
- Newsletter: existing `/api/newsletter` route
- Shopify: existing storefront client

## Implementation Phases

| # | Phase | Scope |
|---|---|---|
| P1 | Foundation | Favicon, contrast tokens, navbar redesign, AtmosphereLayer, container scale |
| P2 | Home redesign | Hero zones, menu cards, Buddy banner, character staggered, shop banner, watch preview, newsletter |
| P3 | Shop redesign | Hero, category tiles, premium product cards, about |
| P4 | Watch IA + data | Schema extension, adapter, featured/rail/playlists/channels rebuild |
| P5 | Polish + QA | Responsive sweep, motion audit, axe contrast audit, Lighthouse |

Est. ~1.5–2 dev-days per phase.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Mobile perf from parallax + atmospherics | Disable parallax <md, GPU-only transforms, reduced-motion guard |
| Contrast regression on tinted bgs | Axe pass per phase; tinted text utility class with verified ratios |
| Watch JSON balloons + slow build | Cap mockup at 30 videos / 6 channels / 3 playlists |
| Bluey-clone perception | Cream base + honey/peach/sage palette only — never sky-blue dominant |
| Asset gaps (no Buddy product context) | P3 may need new shoot; flag in plan as content blocker |

## Success Metrics
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95
- WCAG AA on all body text (axe DevTools clean)
- LCP ≤ 2.5s on 4G mobile (hero image)
- Visual: hero feels "premium + cinematic" per stakeholder review
- Watch page IA: featured/rail/playlists/library all visible above fold on desktop (scroll within rails)

## Validation Criteria
- Side-by-side compare each redesigned page with `bluey/home.jpg` + `bluey/shop.jpg` for *spirit* match (NOT visual clone)
- All 5 character cards render w/ correct accent backdrops
- Watch adapter test: swap mock JSON → live API stub returns same shape, no UI changes needed

## Next Steps
1. Run `/ck:plan` w/ this report → scaffolds `plans/260508-1054-website-redesign/` + 5 phase files
2. Phase files include: file ownership, todo lists, acceptance criteria
3. Execute phases sequentially (P1 → P5)
4. Each phase ends with `code-reviewer` + responsive QA before merge

## Unresolved / Deferred
- Buddy banner copy — keep current bio or commission new? (default: light rewrite during P2)
- Coming-soon pages visual upgrade — out of scope this round (revisit post-launch)
- Real product imagery for Shop hero — content blocker, flag in P3
- Newsletter modal vs scroll-to — scroll-to selected (KISS)
- Real YouTube Data API integration timing — separate ticket post-redesign
