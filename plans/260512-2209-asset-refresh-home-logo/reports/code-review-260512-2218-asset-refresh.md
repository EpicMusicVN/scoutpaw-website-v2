# Code Review — Asset Refresh (Home Banner, Cards, Logo)

**Date:** 2026-05-12
**Reviewer:** code-reviewer (subagent)
**Scope:** 5 component files modified; assets synced separately.
**Verdict:** Production-ready. No blocking issues. Two minor observations.

---

## Files Reviewed

- `components/home/full-bleed-hero.tsx`
- `components/home/menu-cards.tsx`
- `components/nav/footer.tsx`
- `components/nav/mobile-nav.tsx`
- `components/nav/top-nav.tsx`

---

## 1. Correctness vs Brainstorm/Plan

| Plan item | Impl | Match |
|---|---|---|
| Hero `objectPosition` 50% 50% | line 37 | yes |
| Hero gradient `(0.94 0%, 0.5 24%, 0 42%)` | line 51 | yes |
| Hero `items-start` + `md:pt-[12svh]` + `lg:pt-[14svh]` | line 55 | yes |
| Hero text panel `max-w-md md:max-w-md lg:max-w-lg` | line 59 | yes |
| Hero headline `text-5xl md:text-6xl lg:text-6xl xl:text-7xl` | line 63 | yes |
| Cards add `accentGlow` field | line 13 | yes |
| Card glow `blur-3xl opacity-30 group-hover:opacity-40` | line 110 | yes |
| Card image `drop-shadow-[0_18px_24px_rgba(43,29,16,0.18)]` + hover variant | line 118 | yes |
| Card image `objectPosition: "center 60%"` | line 119 | yes |
| Card container `p-4 md:p-6` | line 105 | yes |
| Footer stacked drop-shadow bloom | line 75 | yes |
| Mobile nav `text-logo` w/ `h-10 w-auto` + dropshadow | lines 70-76 | yes |
| `top-nav` passes `logoText` to `MobileNav` | line 71 | yes |

**Deviation (acceptable):** Phase 3 plan mapped `shop → var(--brand-peach)` and `watch → "#A8DADC"`, but `--brand-peach` does not exist in `app/globals.css`. Implementation correctly substituted `--bg-blush` (shop) and `--bg-sky-deep` (watch) — both exist (globals.css L80, L74). This matches the plan's documented fallback ("Hex fallback for any missing"). The resulting tints still ground icons on their card surfaces.

---

## 2. Regressions

**None observed.**

- No `"use client"` introduced where not needed; `mobile-nav.tsx` already client. `full-bleed-hero`, `menu-cards`, `footer`, `top-nav` remain server components.
- `<Image fill>` inside `relative flex-1 p-4 md:p-6` works correctly — image fills the padded box (padding reduces fill area; intended).
- No hydration risk: all dynamic values are static literals or props.
- `objectPosition` and the gradient string stay inline `style` on identical render paths — no SSR/CSR drift.
- `MobileNav` `logoText` is now a required prop; `top-nav.tsx` is the sole caller and supplies it. Grep confirms `MobileNav` is only consumed by `top-nav.tsx`.
- `aria-hidden` correctly applied to: hero gradient (L47), card glow div (L109), card image (L120), grass strip SVGs, BurgerIcon paths.
- Mobile-only / desktop-only visibility classes intact: hero gradient `hidden md:block` (L48), mobile-nav root `md:hidden` (L52, L64), nav buttons `hidden md:inline-flex` (top-nav L56, L64).

---

## 3. Tailwind Arbitrary Classes (3.4.14)

All arbitrary classes parse and produce valid CSS:

- `drop-shadow-[0_18px_24px_rgba(43,29,16,0.18)]` → `filter: drop-shadow(0 18px 24px rgba(43,29,16,0.18))` — standard `dropShadow` arbitrary syntax, supported since Tailwind 3.0.
- `group-hover:drop-shadow-[0_24px_32px_rgba(43,29,16,0.28)]` → variant + arbitrary value, supported.
- `[filter:drop-shadow(0_0_20px_rgba(255,212,73,0.45))_drop-shadow(0_4px_12px_rgba(255,212,73,0.35))]` (footer L75) — arbitrary CSS property syntax `[property:value]`. Underscores convert to spaces. Stacked `drop-shadow()` functions are valid CSS. Compiles cleanly.
- `[filter:drop-shadow(0_2px_6px_rgba(43,29,16,0.25))]` (mobile-nav L75) — same syntax, valid.
- `pt-[12svh]`, `pt-[14svh]`, `min-h-[100svh]`, `min-h-[320px]` — arbitrary length units, all supported. `svh` is the small viewport-height unit; modern browser support is fine.

Note: For the footer wordmark and mobile-nav wordmark, the `[filter:...]` arbitrary-property is used instead of `drop-shadow-[...]` because we need multiple stacked drop-shadows. This is necessary — Tailwind's `drop-shadow-[]` accepts only a single `drop-shadow()` (it expands to `filter: drop-shadow(<value>)`). Stacked stacks require the raw `filter:` form. Correctly applied.

---

## 4. Accessibility

- Hero `<Image>` has descriptive `imageAlt` default; configurable via prop.
- Card images: `alt=""` + `aria-hidden="true"` — appropriate, label conveyed by `<h3>{card.label}`. (Minor redundancy: setting both `alt=""` and `aria-hidden` is acceptable per WAI; the empty alt already removes from a11y tree. No issue.)
- Card glow div: `aria-hidden="true"` + `pointer-events-none` — correct (decorative).
- Footer logo: `alt={config.brand.fullName}` — meaningful since wordmark IS the brand name; arguable case for `alt=""` since the brand name appears in the copyright row L124. Acceptable either way; current is fine for SEO/SR-cards.
- Mobile-nav header logo: `alt="ScoutPaw"` — hard-coded. Minor: the rest of the file derives brand strings from config. Consider `alt={config.brand.fullName}` for consistency, but not blocking (the brand name is "ScoutPaw" anyway).
- Coming-soon cards: `role="link"` + `aria-disabled` + `aria-label` — properly stubbed.

---

## 5. Performance

`drop-shadow` + `blur-3xl` cost for ~3 cards + 1 hero:

- Hero: zero `blur-*` filters on the image; `drop-shadow` only on the wordmark logo (top-nav), not the banner. Banner uses `object-cover` w/ no filter. Negligible cost.
- Cards (3 visible): each has 1 `blur-3xl opacity-30` div (small box, `inset-x-1/4 top-1/4 h-1/2`) + 1 `drop-shadow` on the icon image. `blur-3xl` (~64px) is the heaviest single filter here but applied to a small box on a static, non-scrolling section — paint is one-shot at load. Hover triggers an `opacity` change (compositor-only) + a `drop-shadow` swap (paint, but localized).
- 3 cards total = 3 blur layers + 3 drop-shadows. Well within budget for both desktop and mid-tier mobile. The plan's mitigation (opacity ceiling 0.4, single blur per card) is respected.
- Footer logo: 2 stacked `drop-shadow()` — runs once, on a 16-24px-high element on a static section. Trivial.

No perf concern. Recommend optional `will-change-transform` only if visible jank surfaces during QA on low-end Android; current code is fine as-is.

---

## Secondary Observations (non-blocking)

1. **Card double padding.** Outer card container has `p-6 md:p-7` (L96) AND inner image container has `p-4 md:p-6` (L105). At md+ the image fill area shrinks by `p-7 + p-6` = 52px on each side from card edge. With `min-h-[360px]` and the bottom title block taking ~120px, image fill area is roughly 188px tall × ~260px wide — comfortable but tight. Visual QA at 1024px width (smallest 3-col layout) recommended.

2. **`Image fill` `sizes` precision.** Card image uses `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"` (L117) but grid is `grid-cols-1 ... md:grid-cols-3`. md = 768px in Tailwind, so 640-767px viewports request 50vw images but render in a 1-col layout (i.e. ~100vw container). Over-fetch on tablet portrait by ~2x. Minor — PNGs are 200-250KB each, and Next/Image will still pick a close size. Worth tuning to `(min-width: 768px) 33vw, 100vw` in a follow-up if you want to be strict.

3. **`MobileNav.logoText` is now required.** No default value. Any future caller forgetting to pass it will get a TS error — good, but no runtime fallback. Since `top-nav.tsx` is the only consumer (grep confirmed), this is safe.

---

## Positive

- Plan→impl fidelity is high. Deviations are documented and correct.
- Tailwind arbitrary-property syntax used judiciously (stacked drop-shadows only).
- All decorative elements properly `aria-hidden`.
- No leaked PII, no auth/security surface, no DB queries — pure presentational.
- Coming-soon card semantics preserved (role/aria stubs).
- Footer wordmark replacement preserves SEO (`alt={config.brand.fullName}`).

---

## Recommended Actions

1. (Optional) Tune card `sizes` attribute to align with md breakpoint at 768px.
2. (Optional) Hard-code `alt="ScoutPaw"` in mobile-nav → swap to `config.brand.fullName` for consistency (cosmetic).
3. (Optional) Visual QA at 1024px / 3-col grid: verify card icons still feel grounded after combined `p-7 + p-6` padding.

None blocking.

---

## Unresolved Questions

- None. All design intent verified, all paths traced, all callers checked.

---

**Status:** DONE
**Summary:** Implementation matches the locked plan. Two minor padding/sizes observations noted as optional follow-ups; no regressions, no a11y gaps, no perf concerns.
