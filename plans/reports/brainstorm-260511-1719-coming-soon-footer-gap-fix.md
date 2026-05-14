---
type: brainstorm
date: 2026-05-11
slug: coming-soon-footer-gap-fix
status: approved
---

# Brainstorm — Coming-Soon Footer Gap (About/Games/Activities)

## Problem

On coming-soon pages (About, Games, Activities), visible cream gap below "Back to Home" button before the footer's grass strip.

## Root cause

Two compounding issues in `app/coming-soon/[slug]/page.tsx`:
1. Outer wrapper `<div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">` traps `NewsletterCTA` inside a 1024px column → honey gradient never reaches viewport edges; cream visible on sides on wider screens.
2. "Back to Home" button sits OUTSIDE `NewsletterCTA`, on cream `bg-base`, with `py-8 md:py-12` adding 32-48px of cream padding below before the GrassStrip starts.

The `:has(#newsletter)` fix from the previous brainstorm already recolors the GrassStrip's top curve to honey — but the gradient itself doesn't extend, and the cream column below the button breaks continuity regardless.

## Solution (3 edits)

1. **`app/coming-soon/[slug]/page.tsx`** — split into two siblings:
   - Wrapper keeps `ComingSoonHero` only, drops `pb`/`py` (`pt`-only)
   - `NewsletterCTA` moves outside the wrapper → full-width honey
   - "Back to home" button becomes a `footerSlot` prop on NewsletterCTA → renders inside the honey gradient

2. **`components/home/newsletter-cta.tsx`** — add optional `footerSlot?: ReactNode` prop, render inside gradient after form/success state.

3. **No CSS change** — existing `body:has(#newsletter)` already in place.

## Risks

| Risk | Mitigation |
|------|------------|
| Home/Shop NewsletterCTA breaks | New prop is optional; default no-op; no behavior change |
| ComingSoonHero loses container context | It has its own accent background; unaffected |

## Success Metrics

- Coming-soon pages: honey gradient full-width, button visible on honey, no cream gap above grass
- Home + Shop unchanged

## Unresolved Questions

None.
