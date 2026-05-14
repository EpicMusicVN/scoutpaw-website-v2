# Brainstorm — Asset Refresh Re-Optimization (Banner, Cards, Logo)

**Date:** 2026-05-12
**Status:** Approved, ready for `/ck:plan`
**Scope:** Re-optimize home hero, menu cards, and logo usage across navbar/footer/mobile menu after asset updates.

---

## Problem Statement

User updated 10 assets in `/assets/`:
- `banner/banner.png` — new fish-eye beach scene; 5 dogs span full horizontal band; brown box at right edge; corgi at ~28% from left.
- `card/*.png` (7 files) — background-removed transparent 3D-rendered icons.
- `logo/{full-logo,text-logo}.png` — background-removed transparent versions.

Existing components were laid out for the *previous* assets. New compositions risk text/icon overlap, ungrounded floating PNGs, and stale `/public/assets/` mirrors.

## Requirements

- Banner: dogs fully visible; text + CTAs sit in upper-left sky zone; cinematic full-screen across breakpoints.
- Cards: transparent icons feel grounded, not floating; consistent sizing; clean hover.
- Logos: transparent PNGs work on both light (paper, honey) and dark (navy) backgrounds.
- Sync source `/assets/` → `/public/assets/` (runtime source).
- Honor YAGNI/KISS/DRY — minimal code surface.

## Approaches Evaluated

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **A. Tighten existing components in-place** | Smallest diff; reuses `full-bleed-hero`, `menu-cards`; fast | Needs careful tuning per breakpoint | **Chosen** |
| B. Rewrite hero with art-directed `<picture>` per breakpoint | Pixel-perfect crops; best mobile look | New code; doubles asset count; YAGNI | Rejected |
| C. Replace `MenuCard` with `Card` primitive + composition | Cleaner long-term abstraction | No reuse outside menu cards today; YAGNI | Rejected |

User-confirmed decisions:
- Asset sync: copy `/assets` → `/public/assets`.
- Banner crop: keep dogs centered, crop sides.
- Card icons: floating with soft shadow + subtle glow.
- Logos: keep navbar shadow; add logo to mobile menu header; bump footer glow on navy. **Skip favicon.**

## Final Solution

### 1. Asset Sync
- Copy 10 PNGs from `/assets/{banner,card,logo}` → `/public/assets/{banner,card,logo}`.
- Regenerate `/public/assets/banner/banner.webp` from new `banner.png` via `sharp` (or delete if unused by code — verify w/ grep).

### 2. Full-Bleed Hero (`components/home/full-bleed-hero.tsx`)
- `objectPosition`: `"50% 60%"` → `"50% 50%"`.
- Text-panel width ladder: mobile `max-w-md` / md `max-w-md` / lg `max-w-lg` (was lg `max-w-xl`).
- Vertical alignment: center → upper-third (`items-start pt-[12svh]`); text sits in sky zone above dogs.
- Gradient stops: `(0.94 0%, 0.5 24%, 0 42%)` (was `0.92 0%, 0.55 30%, 0 55%`).
- Headline scale on lg: `lg:text-6xl xl:text-7xl` (was `lg:text-7xl xl:text-[5rem]`).
- Mobile: keep honey card backdrop; no gradient change.

### 3. Menu Cards (`components/home/menu-cards.tsx`)
- Add `accentGlow` field to `Card` type (CSS color for radial glow).
- Behind icon: radial gradient `<div>` w/ `blur-3xl opacity-30` matching icon brand color.
- Icon image: `drop-shadow(0_18px_24px_rgba(43,29,16,0.18))`; `objectPosition: center 60%`.
- Image container: `p-4 md:p-6` padding so icon doesn't kiss edges.
- Hover: shadow intensifies — `group-hover:drop-shadow(0_24px_32px_rgba(43,29,16,0.28))`.
- Keep `min-h-[320px]` / `md:min-h-[360px]` and existing rotate/lift card hover.
- Glow color map: characters → honey; shop → peach; watch/music → sky; events/blog/make → warm tints matching card bg.

### 4. Logos
- **Navbar (`top-nav.tsx`)**: keep current `drop-shadow(0_8px_16px..., 0_2px_4px...)`. Visual QA only.
- **Footer (`footer.tsx`)**: bump glow — `drop-shadow(0_0_20px_rgba(255,212,73,0.45)) drop-shadow(0_4px_12px_rgba(255,212,73,0.35))`.
- **Mobile menu (`mobile-nav.tsx`)**: replace "MENU" label w/ `text-logo.png` at `h-10 w-auto`; add `drop-shadow(0_2px_6px_rgba(43,29,16,0.25))` for contrast on honey bg.

## Implementation Considerations

**Order:**
1. Asset sync first (otherwise visual QA is meaningless).
2. Hero changes (LCP impact, highest visibility).
3. Menu cards (next-most-visible section).
4. Logo treatments (navbar, footer, mobile menu).
5. Visual QA at 360, 768, 1024, 1440 widths; verify with Playwright/Chrome DevTools skill.

**Risks:**
- Tablet portrait (~768px): text-panel bottom may reach corgi head — visual QA needed; fall back to lower `pt-[8svh]` if so.
- Card icon glow on low-end mobile: keep blur-3xl + opacity 0.3 ceiling.
- Mobile menu wordmark contrast on honey: if still weak, swap `text-logo` for `full-logo` (mascots boost contrast).

## Files Touched

```
public/assets/banner/banner.png          (copy)
public/assets/banner/banner.webp         (regen or delete)
public/assets/card/*.png                 (copy 7)
public/assets/logo/*.png                 (copy 2)
components/home/full-bleed-hero.tsx      (edit)
components/home/menu-cards.tsx           (edit)
components/nav/footer.tsx                (edit)
components/nav/mobile-nav.tsx            (edit)
```

## Out of Scope
- Favicon refresh (`app/icon.png`, `app/apple-icon.png`).
- Shop / Watch / Coming-Soon / Character heroes — different image sources.
- `hero-character-cluster.tsx` — character images, not banner.
- Card primitive refactor — no other consumers; YAGNI.

## Success Criteria

- 360 / 768 / 1024 / 1440 viewports: dogs visible, text not overlapping, banner cinematic.
- Cards: icons feel grounded; hover lift smooth; consistent sizing.
- Logos: visible + crisp on both light and navy surfaces.
- No regression in LCP or CLS on home page.
- Type check + lint pass.

## Next Steps

1. Run `/ck:plan` w/ this report as context → produce phased implementation plan.
2. Phase order: sync → hero → cards → logos → QA.
3. After phases: `/ck:test` + Chrome DevTools visual QA → `/ck:code-review`.

## Unresolved Questions

- Is `/public/assets/banner/banner.webp` actively consumed anywhere? Grep before regen vs delete decision.
- Tablet portrait (768px) crop trade-off — accept partial dog visibility, or art-direct? (Currently: accept.)
