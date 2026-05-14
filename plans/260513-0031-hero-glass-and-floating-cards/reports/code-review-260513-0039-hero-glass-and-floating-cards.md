# Code Review — Hero Glass Card + Floating Pack Cards

**Date:** 2026-05-13
**Reviewer:** code-reviewer
**Scope:** 3 files (`full-bleed-hero.tsx`, `app/page.tsx`, `menu-cards.tsx`)
**Plan:** `plans/260513-0031-hero-glass-and-floating-cards/plan.md`
**Brainstorm:** `plans/reports/brainstorm-260513-0031-hero-glass-and-floating-cards.md`

## Summary

Implementation matches plan/brainstorm spec accurately. Tailwind tokens all defined. Type/lint clean. No security/data concerns (UI-only). Two minor accessibility/UX observations, no blocking issues.

## Correctness vs Spec

### `full-bleed-hero.tsx` — PASS
- Section `relative isolate bg-paper` — matches (overflow-hidden dropped intentionally so absolute glass card not clipped on md+).
- Banner wrapper `relative aspect-[4/3] md:aspect-auto md:min-h-[100svh]` — matches.
- Image: `fill`, `priority`, `sizes="100vw"`, `object-cover`, `objectPosition: 50% 50%` — matches; LCP preserved.
- Glass card classes: `relative mx-4 -mt-8 max-w-md rounded-3xl border border-white/40 bg-honey/85 p-6 shadow-cozy-xl backdrop-blur-xl md:absolute md:right-12 md:top-12 md:mx-0 md:mt-0 md:max-w-md md:p-8 lg:right-16 lg:top-16 lg:max-w-lg lg:p-10` — matches the brainstorm spec exactly.
- Typography 3-tier: kicker `text-xs md:text-sm tracking-[0.3em]`, h1 `text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] leading-[1.05]`, body `text-base lg:text-lg leading-relaxed` — matches.
- CTAs preserved (Watch Now dark + Meet the Pack outline).
- Gradient mask removed — matches.
- Component remains a sync function with no client-only hooks → server-component-safe (page wraps it in async `HomePage` without `"use client"` — OK).

### `app/page.tsx` — PASS
- `kicker="SCOUTPAW TV"` — matches.
- `title="THE ULTIMATE WORKDAY HANGOUT"` — matches.
- `description` = ~70-word paragraph with apostrophes (`Buddy and Max are leading…`, `we're`, `we've`) and em-dash (`watch—we've got`) — matches.
- `react/no-unescaped-entities` only fires on JSX text children (e.g. `<p>we're</p>`), not on string-literal prop values. Since the description is a `description="…"` prop, lint correctly stayed quiet. Confirmed by `pnpm lint` passing.

### `menu-cards.tsx` — PASS
- `Card` type drops `rotate` field — matches.
- All `allCards[*]` entries no longer carry `rotate` — matches.
- Grid `gap-6 md:gap-7 auto-rows-fr` — matches.
- Image card: `relative aspect-square overflow-hidden rounded-[2rem] shadow-cozy-md transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-cozy-lg` + `style={{ background: card.bg }}` — matches.
- Glow div: `aria-hidden`, `pointer-events-none`, blurred radial — matches.
- Image: `fill`, `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`, `object-contain p-6`, `group-hover:scale-105` — matches; transparent icon inside square colored bg.
- Coming-soon badge: `absolute right-4 top-4 z-10 …` inside image card — matches; visible because image card is `overflow-hidden` but badge is inside that container at corner offset (4 = ~16px), not clipped.
- Text card: `relative -mt-10 mx-4 rounded-2xl bg-surface p-5 md:p-6 shadow-cozy group-hover:shadow-cozy-md` — matches; `relative` lets it stack above the lifted image-card shadow.
- Wrapper: `group block h-full` on Link / div-fallback — `group-hover:` propagates to both inner cards from a single hover target. Correct.
- Rotation hack removed — matches.

## Regression Checks

| Concern | Status | Notes |
|---|---|---|
| Mobile `-mt-8` overlap (banner→glass) | OK | Section drops `overflow-hidden`, so card is not clipped. Section bg `bg-paper` prevents transparent gap if banner aspect mismatches viewport. |
| SSR-safe server component | OK | No `"use client"`, no hooks, no event handlers in `FullBleedHero`. `Button` href usage is fine. Page is `async` but hero doesn't await. |
| LCP preserved | OK | Banner Image keeps `priority` + correct `sizes="100vw"`. Mobile aspect-[4/3] still allows priority preload. |
| Hover propagation on cards | OK | Single `group` on Link wrapper; both child cards use `group-hover:*` only. Hover lifts image more (`-translate-y-2 + shadow-cozy-lg + scale-105`) than text (`shadow-cozy-md` only). Matches "image floating above" intent. |
| Tailwind class availability (v3.4.14) | OK | `aspect-[4/3]`, `backdrop-blur-xl`, `-mt-8`/`-mt-10`, `border-white/40`, `bg-honey/85`, `xl:text-[3.5rem]`, `rounded-[2rem]`, `min-h-[100svh]`, `max-w-hero` — all supported / configured. |
| `xl:text-[3.5rem]` JIT arbitrary | OK | JIT enabled by default in 3.4. |
| `min-h-[100svh]` | OK | Arbitrary value, modern browsers; iOS Safari 15.4+ supports `svh` unit. |
| Visual QA at 360/768/1024/1440 | Pending | Listed in plan success criteria, user spot-check required (already flagged in brainstorm). |

## Accessibility

| Check | Status |
|---|---|
| Banner Image alt set | OK — `imageAlt` prop with descriptive default. |
| Decorative glow `aria-hidden` | OK. |
| Coming-soon badge readable (not clipped) | OK — inside `overflow-hidden` image card but offset only 16px from corner. |
| Card accessible name resolves through Link | OK — `Image alt=""` (decorative), h3 + p inside become the Link's accessible name via text content. |
| h1 only one per page | OK — `FullBleedHero` h1 + `MenuCards` h2 — single h1. |

## Code Quality

- File sizes well under 200-line rule (hero 67, menu-cards 154).
- DRY: `wrapperClass` extracted; `content` JSX shared across Link and div-fallback. Good.
- KISS: layout uses static absolute/relative — no JS measurement. Good.
- Comments concise and explanatory (why-not-what). Good.

## Minor Observations (Non-blocking)

1. **`comingSoon` branch is currently dead code** at runtime — `allCards` has no `comingSoon: true` entries, and `LIVE_HREFS` filter would drop coming-soon hrefs anyway (`#meet-the-pack`, `/shop`, `/watch` are all live). Keeping the branch for future use is fine but worth noting if future you wonders why badge styling can't be visually verified locally without seeding test data.
2. **`role="link" aria-disabled="true"` is non-interactive** — a div with `role="link"` isn't keyboard-focusable. If a coming-soon card is ever added, screen-reader users will hear "link, dimmed, Foo — Coming Soon" but the element is not in tab order. Probably intentional (matches "disabled"), but flagging in case behavior diverges from intent.
3. **Banner alt mentions "ScoutPaw TV"** — fine; consider whether the alt should be updated alongside the new copy direction at some point (not blocking).
4. **Glass-card mobile overlap (`-mt-8`) over `bg-paper` section bg** — visually fine; if the banner image ever fails to load, the negative margin still produces a clean honey card on cream bg, no broken layout. Resilient.

## Metrics

- Type Coverage: 100% (pnpm typecheck clean per task description).
- Lint: clean (pnpm lint per task description).
- LOC changed: ~150.

## Recommended Actions

None blocking. Proceed to user visual QA at 360 / 768 / 1024 / 1440.

## Unresolved Questions

- (Carried from brainstorm, visual-QA-decision only) at md exactly 768px, does `max-w-md` + `right-12` feel cramped? If so, drop to `md:max-w-sm`.
- (Carried from brainstorm) xl: bump `text-[3.5rem]` to `text-6xl`? Visual QA call.
- `role="link" aria-disabled` div is intentionally non-focusable — confirm preferred behavior if a coming-soon entry is added later (could swap to a focusable `button` with `disabled`).

---

**Status:** DONE
**Summary:** Implementation faithfully matches plan/brainstorm spec across all 3 files. Type/lint clean. No regressions in SSR, LCP, accessibility, or Tailwind class availability. Minor non-blocking observations recorded.
**Concerns/Blockers:** None.
