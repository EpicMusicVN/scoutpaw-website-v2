# Code Review — Top Picks Page

Date: 2026-05-22
Reviewer: code-reviewer
Plan: `plans/260522-0801-top-picks-page/`

## Scope

Top Picks feature only (14 files: 6 created, 6 modified, 2 read-for-context).
`pnpm typecheck` + `pnpm lint` pass clean; page verified HTTP 200 on dev server.
`pnpm build` cache contention is environmental — not assessed as a defect.

## Overall Assessment

Solid, well-structured feature. The content-layer wiring is correct and idiomatic
(matches the existing adapter pattern exactly), Zod schemas are sound, types flow
cleanly end-to-end, and the design-system reuse (cozy-card language, tokens, motion)
is faithful. All component files are well under 200 lines. Acceptance criteria are
met. Issues found are accessibility-tier (one high, rest medium/low) — no critical
correctness or security defects.

---

## Critical Issues

None.

---

## High Priority

### H1 — Collapsed accordion grid is keyboard/SR reachable (focus trap leak)

`components/top-picks/top-picks-board.tsx:90-110`

When the accordion is collapsed (`gridTemplateRows: "0fr"`), the panel collapses to
zero height, but the inner `<div className="overflow-hidden">` still contains a live
`<ul>` of `OfferCard` links. `overflow: hidden` clips them visually but does **not**
remove them from the tab order or the accessibility tree. A keyboard user tabbing
past the Deal Block lands on invisible, zero-height offer-card links; screen readers
announce offers that are not visually present.

This is the standard failure mode of the `grid-rows` 0fr/1fr accordion pattern — the
visual collapse and the semantic collapse are decoupled.

Fix — add `inert` + `aria-hidden` to the panel wrapper when closed:

```tsx
<div
  id={OFFERS_ID}
  className="grid transition-[grid-template-rows] duration-500 ease-gentle"
  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
  inert={!open}            // removes descendants from tab order + a11y tree
  aria-hidden={!open}
>
```

`inert` is supported by React 19 as a real prop (boolean), and by all current
evergreen browsers. It is the correct single-attribute fix and pairs naturally with
the existing `aria-controls`/`aria-expanded` on the Deal Block button. With `inert`,
`aria-hidden` is technically redundant but harmless and explicit; you may keep just
`inert={!open}` if you prefer minimal markup.

Note: do not gate this behind `prefers-reduced-motion`. Even with the motion reset,
the panel is still rendered at `0fr` and still needs `inert` when collapsed.

---

## Medium Priority

### M1 — Deal Block image has empty `alt=""` but is the only media in a content button

`components/top-picks/deal-block.tsx:58`

`alt=""` marks the image purely decorative. That is a defensible call here — the
button already has a full text label (badge + title + description + CTA span) — so
the image carries no extra information. This is acceptable and arguably correct.
Flagging only so the choice is intentional and not an oversight: the offer-card
images by contrast use `alt={pick.title}` (meaningful), which is the right call there
because each card image is the product. The inconsistency is justified by context.
No change required — documented for the record.

### M2 — `aria-expanded` button label changes but no live feedback on auto-expand

`components/top-picks/top-picks-board.tsx:41-44`

`onChip()` calls `setOpen(true)` so a chip click while collapsed auto-expands the
grid (acceptance criterion met). However, when a sighted keyboard user clicks a chip,
focus stays on the chip and the grid expands below — a screen reader user gets no
announcement that the panel state changed, because `aria-expanded` lives on the Deal
Block button, not the chip. The user toggled a filter and silently also opened a
disclosure they did not interact with.

This is a minor UX/a11y wrinkle, not a defect. Options, in order of preference:
1. Accept it — the auto-expand is a documented, intentional convenience.
2. Add a visually-hidden `aria-live="polite"` region that announces e.g.
   "Showing 2 apparel picks" on filter change. This also covers the empty-state
   ("No picks in this category") which currently changes silently.

Recommend option 2 if a polish pass has budget; otherwise accept.

### M3 — `track()` is a no-op until GA4 consent — confirm intended

`components/top-picks/offer-card.tsx:34`

`track("BuyNowClick", { pick: pick.id })` fires on the offer-card link. `track()`
is SSR-safe and silently no-ops when `window.gtag` is absent (pre-consent or GA not
loaded). This matches `ProductCard` behavior exactly, so it is consistent and
correct — just confirming the acceptance criterion "external CTAs fire track()" is
satisfied in the sense that the call is made; whether it reaches GA depends on
consent state, same as the rest of the site. No change.

---

## Low Priority

### L1 — DRY: three `FilterChip` components now coexist

The plan extracted the chip from `explore-videos.tsx` into `components/ui/filter-chip.tsx`
and Top Picks + Watch Explore both consume it — good. But two **other** chips remain:
`components/shop/product-grid.tsx` (local `FilterChip`, props `active/onClick/label`)
and `components/watch/watch-library.tsx` (local `FilterChip`, props
`label/count/isActive/disabled`). These are out of scope (the plan only targeted the
Explore Videos chip) and have genuinely different prop shapes (count badges,
disabled state, border styling), so consolidating them is non-trivial and correctly
deferred. Noting for a future DRY pass — not a regression, not blocking.

### L2 — `OfferCard` `index` default is dead in the only call site

`components/top-picks/offer-card.tsx:26` declares `index = 0`, but the sole caller
(`top-picks-board.tsx:104`) always passes `index={i}`. The default is harmless and
mirrors `ProductCard`'s signature (consistency argument), so keep it. Pure
observation — YAGNI-adjacent but the cost is one token.

### L3 — `tileBackgrounds` array duplicated verbatim from `ProductCard`

`offer-card.tsx:12-17` copies the exact `tileBackgrounds` array from
`product-card.tsx:19-24`. Four string literals — small enough that duplication is
defensible (KISS over a shared-constant import), and the comment explicitly notes
the intent to mirror ProductCard. Acceptable. If a third consumer appears, extract
to `lib/` then.

### L4 — Deal Block `<button>` contains an `<Image>` — valid but worth a note

`deal-block.tsx:25-65` — the whole card is one `<button>`, and `next/image` renders
an `<img>` (phrasing content), so the HTML is valid. The block-display `<span>`s for
text are the correct technique and the file comment documents it well. No issue —
calling out that the review verified this, since it was a focus area.

---

## Edge Cases Reviewed

- **Empty filtered category** — handled: `filtered.length === 0` renders a friendly
  message (`top-picks-board.tsx:96-99`). The "others" and every category have 2
  picks in seed data so this only triggers if data shrinks, but the guard is correct.
- **Reduced motion** — the global `prefers-reduced-motion` reset in `globals.css:182`
  neutralizes the `transition-[grid-template-rows]` and the chevron/hover transitions.
  The accordion still functions (instant open/close). Correct. See H1 — `inert` is
  still required regardless of motion preference.
- **External CTA links** — `offer-card.tsx:31-35` uses `target="_blank"` +
  `rel="noopener noreferrer"` and an `aria-label` with "(opens in new tab)". Correct
  and secure (no reverse-tabnabbing, no referrer leak). `ctaHref` is schema-validated
  as a non-empty string but **not** as a URL (`z.string().min(1)`); the seed data is
  all `https://` so this is fine in practice. Consider `z.string().url()` if Top
  Picks ever accepts untrusted/CMS-authored hrefs — for the current JSON seed it is
  not needed (YAGNI).
- **Image loading** — both `next/image` uses set `fill` + `sizes`; Deal Block uses
  `aspect-[16/10]`/`min-h-[320px]` wrappers, OfferCard uses `aspect-square`. No
  layout shift. No `priority` on either, correct — the hero owns LCP. Good.
- **Content adapter** — `getTopPicks()` validates once at module load via
  `TopPicksContentSchema.parse()` (fail-fast at build), sorts picks by `order`, deal
  passes through. Sanity stub throws a clear not-implemented error. Interface,
  re-exports, and JSON source all consistent. Correct.
- **Type safety** — `Filter = TopPickCategory | "all"` is sound; `TOP_PICK_CATEGORIES`
  is `as const` so the `.map()` over chips is exhaustively typed;
  `TOP_PICK_CATEGORY_LABELS` is `Record<TopPickCategory, string>` so a new category
  forces a label. No `any`, no unsafe casts.

## Design-System Consistency

Faithful. `rounded-[2rem]`/`rounded-[2.5rem]`, `shadow-cozy*`, `ease-gentle`,
`max-w-hero`, `cta-shimmer`, `font-display`, `min-h-[48px]` CTAs, the gold accent
line, rotating tile backdrops — all match the established cozy-card vocabulary and
the `ProductCard` tile treatment. Hero/CloudDivider/ScrollReveal/NewsletterCTA
composition in `page.tsx` mirrors `shop/page.tsx` exactly. Section header pattern
(`brand-gold` kicker → display heading → `warm-text` lead) matches `explore-videos.tsx`.

## FilterChip Extraction — Regression Check

No regression to the Watch page. `explore-videos.tsx` now imports the shared
`FilterChip` and the call sites (`active`/`onClick`/`children`) match the shared
component's prop contract exactly. The shared chip correctly carries `"use client"`
(it attaches an `onClick` DOM handler) — the file comment documents why. Toggle
semantics (`aria-pressed`), styling, and `min-h-[40px]` are preserved from the
original. The owning sections supply `role="group"` + `aria-label` as before.

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| hero → chips → Deal Block → offer grid | Met |
| chips filter the grid | Met (`useMemo` filter) |
| Deal Block toggles the grid | Met (`onToggle`) |
| chip-click-while-collapsed auto-expands | Met (`onChip` sets `open=true`) |
| all component files under 200 lines | Met (largest is board at 113) |
| external CTAs new tab + `track()` | Met |

## Recommended Actions

1. **H1 (do before ship):** add `inert={!open}` to the offer-grid panel wrapper in
   `top-picks-board.tsx`. One line, removes the collapsed-grid focus/SR leak.
2. **M2 (optional polish):** add an `aria-live="polite"` status region for filter
   changes + empty state, if a polish pass has budget.
3. **L1 (future):** track the three-`FilterChip` situation for a later DRY pass —
   not now.

## Unresolved Questions

- None blocking. H1's `inert` prop assumes the project targets evergreen browsers
  only (no IE/legacy) — consistent with Next 15 / React 19, so safe.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Top Picks feature is correct, type-safe, secure, and design-consistent
with all acceptance criteria met; one high-priority accessibility fix (`inert` on the
collapsed accordion panel to stop the zero-height offer grid leaking into tab order
and the a11y tree) should land before ship, plus optional `aria-live` polish.
**Concerns/Blockers:** H1 — collapsed `grid-rows` accordion keeps offer-card links
keyboard-reachable and SR-announced; fix is a one-line `inert={!open}`.
