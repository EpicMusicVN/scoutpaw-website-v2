# Code Review — Iter-3 Hover Polish + No-CTA Hero

**Date:** 2026-05-14 23:53 (Asia/Saigon)
**Reviewer:** code-reviewer
**Scope:** 4 files, ~15 LOC delta
**Plan:** `plans/260514-2341-hover-polish-no-cta/`
**Brainstorm:** `plans/reports/brainstorm-260514-2341-hover-polish-no-cta.md`

---

## Verification (claims vs. actual)

| Claim | File:line | Verified |
|-------|-----------|----------|
| Hero — no `Button` import, no `actions` prop, CardBody = kicker+h1+description only | `full-bleed-hero.tsx:1,12-37` | yes |
| Shop page — no `Button` import, no `actions={...}` prop | `app/shop/page.tsx:1-23` | yes |
| MenuCard wrapperClass adds `transition-transform duration-500 ease-gentle hover:-translate-y-1` | `menu-cards.tsx:155-156` | yes |
| Image card `-translate-y-2`, `duration-500 ease-gentle` | `menu-cards.tsx:111-114` | yes |
| Text card `transition-all duration-500 ease-gentle group-hover:shadow-cozy-md` | `menu-cards.tsx:143` | yes |
| Pill `duration-500 ease-gentle` | `menu-cards.tsx:147` | yes |
| Shop tile — no `group-hover:rotate-0`, `duration-500` | `explore-products.tsx:84-86` | yes |
| Shop tile inner image — `ease-gentle` | `explore-products.tsx:95` | yes |
| `ease-gentle` token present | `tailwind.config.ts:61` | yes |
| `pnpm typecheck` clean | local run | yes |
| Home page never passed `actions` (no caller cleanup needed) | `app/page.tsx:14-18` | yes |
| Single `FullBleedHero` import set: only `app/page.tsx` + `app/shop/page.tsx` | grep | yes |

All diff claims accurate. No drift.

---

## Overall Assessment

Surgical, well-scoped iteration. Three locked decisions from the brainstorm executed cleanly with no scope creep. Net diff is ~15 LOC of transition-class adjustments plus a clean prop/import removal. Typecheck + lint clean. No new runtime branches, no new state, no API contract changes beyond the intentional `FullBleedHero` prop removal (which is contained — 2 callers, both updated).

The hover system is now consistent: `duration-500 ease-gentle` is the site-wide hover tempo, which is a sensible design system baseline.

Ship it. Minor items noted below are observational, not blocking.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### M1 — `transition-all` widening (priority 5 from prompt)
**Files:** `menu-cards.tsx:143` (text card), `explore-products.tsx:85` (shop tile)

Both text card and shop tile use `transition-all`. The currently-changing properties are:

- Text card: only `box-shadow` (via `group-hover:shadow-cozy-md`).
- Shop tile: `transform` (via `group-hover:-translate-y-2`) and `box-shadow` (via `group-hover:shadow-cozy-xl`).

`transition-all` will animate any future CSS-changing property — including ones that animate poorly (e.g., `background-color` between palette colors, `width`, `top/left` from layout shifts). It's a known low-grade footgun in Tailwind codebases.

**Recommendation (non-blocking):** if you want strict semantics, switch:
- Text card → `transition-[box-shadow]` (only changing property).
- Shop tile → `transition-[transform,box-shadow]` or keep `transition-all` (already changing two unrelated props, narrowing buys little).

**Why I'm not insisting:** the brainstorm explicitly chose synchronization over granularity. `transition-all` keeps the door open for future hover additions without re-touching the class. Pragmatic. Just be aware of the trade.

### M2 — Pill `transition-all` already has implicit cost on hover
**File:** `menu-cards.tsx:147`

Pill has `transition-all duration-500 ease-gentle` plus hover triggers `-translate-y-0.5` AND `shadow-md`. The `transition-all` here is benign — same reasoning as M1. No action needed; flagging for parity.

---

## Low Priority

### L1 — Hero card vertical balance (priority 6)
**File:** `full-bleed-hero.tsx:66-78`

CardBody now ends with the description paragraph. No bottom-margin element after it. Container padding:
- Mobile card: `p-6` → 24px bottom.
- Desktop card: `py-5 lg:py-6` → 20–24px bottom, with `px-6 lg:px-7` horizontal.

Top has `kicker` (small, no top margin) at `pt-5/6`. Bottom whitespace ≈ same as top whitespace = balanced. Description's `mt-4` already gives the description breathing room above. Visually: hero card will read more compact, not top-heavy. No code change needed — note for visual QA.

### L2 — Combined translate stack (priority 1 from prompt)
**File:** `menu-cards.tsx:111-114, 155-156`

Outer `hover:-translate-y-1` (4px) + image's `group-hover:-translate-y-2` (8px) = image rises **12px total** (not 3px as prompt says — Tailwind's spacing scale: `1 = 4px`, `2 = 8px`). Text card rises 4px (outer only).

Differential = 8px, with whole composition rising 4px. This is meaningful but not extreme; 8px relative differential between image and text card is what creates the "image lifts out of the text" feel.

**Visual judgment call** (cannot decide without seeing live): if it feels "leaping," dropping image to `-translate-y-1` (combined 8px image / 4px text = 4px differential) is the easy revert. The brainstorm flagged this same risk. Leaving it as designed — visual QA in Phase 4 owns the final call.

### L3 — Disabled `comingSoon` card still lifts on hover (priority 3)
**File:** `menu-cards.tsx:155-167`

Shared `wrapperClass` applies `hover:-translate-y-1` to both the `<Link>` and the `<div role="link" aria-disabled="true">`. Per brainstorm decision (locked), this is acceptable — the subtle lift on a disabled card is a minor UX inconsistency, not a blocker.

Worth noting: since the disabled card has no inner image hover behavior either? Actually it does — `group-hover:*` on the image card and text card fires regardless of `comingSoon` (the `group` class is on the wrapper). So a disabled card on hover gets: outer lift + image lift/scale/shadow + text shadow. The brainstorm seemed to assume hover handlers wouldn't fire on disabled — but they do, because nothing branches on `comingSoon` for hover styles.

If user wants disabled cards truly inert: would need a separate `wrapperClass` for the disabled branch, with no `hover:` and no `group`. **Not recommending** — currently no `comingSoon: true` items in `allCards` array (line 26-51), so this is dead behavior. If/when re-enabling future cards as `comingSoon`, revisit.

### L4 — Pill bottom anchor + `View All` hover lift
**File:** `menu-cards.tsx:146-150`

Pill is `mt-auto` (flex-1 text card pushes it to bottom). When outer wrapper lifts 4px, AND text card stays at same relative position within wrapper, AND pill stays at bottom of text card, AND pill itself shifts `-translate-y-0.5` (2px)... the pill's absolute screen movement on hover = 4px (outer) + 2px (pill itself) = 6px. Visually probably fine, but the pill is the most-animated element relative to its rest position (6px > 4px text card > 12px image — actually image is biggest at 12px).

No action — confirming the hover layering reads sensibly.

### L5 — `transition-shadow` semantic preference (prompt priority 5)
Already covered in M1. The prompt asked if `transition-[box-shadow]` is more semantic. Yes, marginally. Not worth a follow-up edit.

---

## Edge Cases / Behavioral Verification

### E1 — Hover-target geometry on outer Link (priority 2)
**File:** `menu-cards.tsx:170-174`

The `<Link>` is `flex h-full flex-col` containing image card + text card. The image card has no explicit margin from the link top. The text card has `-mt-20` (mobile) / `-mt-[88px]` (md) / `-mt-24` (lg) — pulling itself UP into image card territory.

The Link's bounding box = union of children's layout boxes. Negative margin on text card doesn't shrink the Link box — it just makes the text card's layout box overlap the image card's box. The Link's effective hover area = full image card visual area + (text card visual area minus the overlap). Cursor in the overlap zone (bottom 80–96px of image card, which is also top of text card) = inside Link = `hover:` fires. Confirmed safe.

**Caveat:** image card has `overflow-hidden` + `rounded-3xl`. Cursor in the rounded corner cutout outside the visible image card but inside its layout box still triggers hover. Tailwind/CSS-default — not new behavior, not a regression. No action.

### E2 — Shop tile rotation stability (priority 4)
**File:** `explore-products.tsx:84-86`

`tile.rotate` (e.g., `-rotate-2`) stays at rest. `group-hover:` only fires `-translate-y-2` and `shadow-cozy-xl`. No rotation transition → layout box stable across hover. The "text becomes larger" symptom from iter-2 is fixed: a rotated bounding box has different visual extents than an un-rotated one (subpixel rendering of the rotated text vs. crisp axis-aligned text creates apparent size difference). With rotation static, this stops.

**Focus ring:** `<Link>` (line 75-80) has `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4`. The ring is on the **Link element**, not the rotated tile inside. Link itself is `block rounded-[2rem]` and is NOT rotated — so the focus ring is an axis-aligned rounded rectangle around the rotated tile. Visually it'll be a slightly-larger un-rotated halo around the tilted card. This is the same as iter-2's behavior. Acceptable. (Tracing the rotated silhouette would require focus-ring on the rotated inner div, but that loses the Tailwind `focus-visible:` semantics on the focusable element.)

### E3 — `actions` prop removal — breaking change check
`FullBleedHero` is exported from `components/home/full-bleed-hero.tsx`. Imported only by `app/page.tsx` and `app/shop/page.tsx`. Both updated. No other consumers. `cinematic-hero.tsx` has its own unrelated `actions?: React.ReactNode` prop (different component) — unaffected.

This is an intentional, contained breaking change with no external surface. Safe.

### E4 — Typecheck verification
Ran `pnpm typecheck` locally — clean. Confirms:
- `FullBleedHero` prop signature change has no stray callers.
- No unused-import errors from `Button` removal.
- No type drift.

---

## YAGNI/KISS Check

- `transition-all` over `transition-transform`/`transition-shadow`: arguable trade (see M1). Brainstorm chose terseness; defensible.
- `wrapperClass` shared between Link and div: DRY ✓.
- No new dependencies, no new hooks, no new state, no new files. KISS ✓.

---

## Accessibility

- `aria-hidden` on decorative images preserved.
- `aria-label` on shop Link preserved.
- `aria-disabled="true"` + `role="link"` on `comingSoon` div preserved.
- Focus rings unchanged in this iteration. Keyboard nav works — `Tab` lands on outer Link, focus ring renders, Enter activates.
- No animation-prefers-reduced-motion handling — but this is a pre-existing gap, not a regression. Out of scope for iter-3.

No accessibility regressions.

---

## Security

No security surface touched (no input handling, no auth, no data flow change). N/A.

---

## Positive Observations

1. **Brainstorm → implementation fidelity** — every locked decision implemented exactly. No silent deviations.
2. **Caller cleanup correctness** — `Button` import removed from `app/shop/page.tsx`; `full-bleed-hero.tsx` no longer imports `Button`. Lint would have caught a stale import; both files clean.
3. **`ease-gentle` confirmed in config before use** — pre-flight verification was correct.
4. **Synchronized timings achieve cohesion goal** — all four hover transitions on MenuCard now share `duration-500 ease-gentle`. Site-wide tempo is established.
5. **Shop tile fix targets root cause** — removing `group-hover:rotate-0` directly addresses the layout-shift complaint from the brainstorm. Not a workaround.
6. **DRY via shared `wrapperClass`** — clean.

---

## Recommended Actions

1. **Visual QA (Phase 4, already in_progress)** — confirm L2 (combined translate feel) and L1 (hero vertical balance) at 4 viewports.
2. **No code changes recommended.** All M-/L-tier items are observational.

If visual QA reveals the image card lift feels "leaping," the one-line revert is:
```diff
- group-hover:-translate-y-2
+ group-hover:-translate-y-1
```
in `menu-cards.tsx:112`.

---

## Metrics

- Files changed: 4
- LOC delta: ~15 (mostly class-attribute rewrites)
- Net interfaces removed: 1 (`actions` prop on `FullBleedHero`)
- Type coverage: 100% (typecheck clean)
- Lint: 0 warnings / 0 errors (per prompt)
- New deps: 0
- New files: 0

---

## Unresolved Questions

1. **Image lift magnitude** — combined 12px image rise vs 4px text card rise (8px differential): visual call, defer to Phase 4 QA. One-line revert path documented.
2. **`transition-all` vs property-specific** — pragmatic vs strict; brainstorm chose pragmatic. No follow-up unless someone adds an unintended animated property later.
3. **`comingSoon` card hover behavior** — currently no live `comingSoon` cards. If/when added, decide whether to branch `wrapperClass` to suppress hover on disabled. Not actionable now.

---

**Status:** DONE
**Summary:** Iter-3 changes are clean, contained, and faithful to the brainstorm. Typecheck + lint clean (verified). No critical or high-priority issues. Two medium items (`transition-all` widening) and five low items are observational, not blocking. Ship after Phase 4 visual QA confirms the 12px image lift / 4px wrapper lift differential feels cohesive rather than leaping.
**Concerns/Blockers:** None blocking. Single watch-item for visual QA: combined image translate (8px differential vs wrapper) — one-line revert documented if it reads as "leaping."
