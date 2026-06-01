---
phase: 1
title: Contract Doc and Codebase Audit
status: completed
priority: P1
effort: 1.5h
dependencies: []
---

# Phase 1: Contract Doc and Codebase Audit

## Overview

Add the Surface → Text Color Contract section to `docs/code-standards.md`. Sweep the codebase for violations and fix.

## Requirements

**Functional:**
- `docs/code-standards.md` contains a clear, table-formatted contract section
- All instances of `bg-brand-primary` have verified blue text on top
- All instances of `bg-navy` have verified yellow/white text on top
- Any violations found → fixed
- Contract serves as a PR review checklist

**Non-functional:**
- No new code abstractions
- AA spot-check on any fix

## Architecture

Documentation + manual sweep. The contract codifies what's already true in Plan A/D/J — this is just enforcement and clarity.

## Related Code Files

- **Create section in:** `docs/code-standards.md`
- **Audit only (most should be compliant already from Plan D):**
  - `components/ui/button.tsx` — primary variant (yellow bg)
  - `components/nav/mobile-nav.tsx` — active state (yellow bg)
  - `components/nav/footer.tsx` — navy bg → yellow/white text
  - `components/watch/featured-video.tsx` — category badge (yellow bg)
  - `components/watch/subscribe-card.tsx` — YouTube button (navy bg)
  - `components/shop/product-card.tsx` — price pill (yellow bg)
  - `components/top-picks/offer-card.tsx` — CTA + popularity pill
  - `components/top-picks/deal-block.tsx` — gradient surface
  - `components/home/featured-pup-spotlight.tsx` — gradient surface
  - `components/home/menu-cards.tsx` — gradient banner
  - `components/home/feature-banner.tsx` — gradient surface
  - `components/home/newsletter-cta.tsx` — subhead pill, submit button
  - `components/watch/video-card.tsx` — category badge
  - `components/watch/playlist-grid.tsx` — playlist count pill
  - Any hero converted by Plan J — already correct
- **Modify:** `docs/project-changelog.md` (Phase 2)

## Implementation Steps

1. **Open** `docs/code-standards.md` (or create the file if missing).
2. **Add** the Surface → Text Color Contract section:

   ```markdown
   ## Surface → Text Color Contract

   This is a hard contract. All PRs must comply. Reviewers MUST flag violations.

   ### Compliant pairings

   | Surface bg | Heading | Body | Example consumer |
   |---|---|---|---|
   | Light: white / surface / cyan (`bg-paper`) / cream / warm-tan | `text-navy` h2; `heading-gradient-gold` h1 on hero, or solid `text-navy` elsewhere | `text-ink-blue` | Default for cards, content sections |
   | Yellow: `bg-brand-primary`, yellow gradients | `text-ink-blue` or `text-navy` | `text-ink-blue` | Primary buttons, badges, brand pills |
   | Navy / dark blue: `bg-navy`, hero text containers | `text-brand-primary` or `heading-gradient-gold` | `text-white/85` or `text-brand-primary/80` | Footer, hero text panels, subscribe CTA |
   | Dark anchor: `bg-ink` | n/a (button only) | `text-surface` (white) | Newsletter submit, dark CTA badges |

   ### Forbidden combinations (WCAG AA violations)

   - **Yellow text on cyan / white / cream surfaces** — ~1.4:1 contrast, FAILS AA at any size.
   - **Blue text on navy / blue surfaces** — too close in hue, FAILS AA.
   - **Brown ink on warm-tan** — borderline. Prefer `text-ink-blue` (deep navy) which is the body default.

   ### Acceptable exceptions

   - **Per-character themed text colors** (e.g., `text-brand-gold` accent on Max's stories, kickers using `accentColor` style) — these are intentional brand expressions on the per-character themed surface (`surfaceTint`). AA still respected on themed surfaces.

   ### Tokens

   - `--ink-blue: #1a3a5c` (deep navy, body text default on light surfaces) — Tailwind: `text-ink-blue`
   - `--bg-navy: #397fc5` (brand navy, dark surfaces) — Tailwind: `bg-navy`, `text-navy`
   - `--brand-primary: #ffd70c` (brand yellow) — Tailwind: `bg-brand-primary`, `text-brand-primary`
   - `--ink: #2b1d10` (dark anchor, button bg + form borders only) — Tailwind: `bg-ink`, `border-ink`, `ring-ink`
   ```

3. **Run audit grep:**
   ```
   Grep 'bg-brand-primary' → list all consumers
   Grep 'bg-navy' → list all consumers
   Grep 'bg-ink\b' (boundary) → list all consumers
   ```
4. **For each `bg-brand-primary` usage** — check inline children. Verify text color is one of: `text-ink-blue` / `text-navy` / `text-ink-blue/N`. If text is yellow / white / brown — flag and fix.
5. **For each `bg-navy` usage** — check inline children. Verify text color is `text-brand-primary` / `text-white` / `text-white/N` / gold-gradient h1. If text is `text-ink-blue` / dark — flag and fix.
6. **For each `bg-ink` usage** — verify it's a button or anchor element (intentional dark); text-surface (white) confirmed.
7. **Document violations found** in a brief audit report inline in this phase (or as a comment in the changelog).
8. **Fix** each violation with the minimum change.
9. **Typecheck + lint** after fixes.

## Success Criteria

- [ ] `docs/code-standards.md` has Surface → Text Color Contract section
- [ ] All `bg-brand-primary` consumers verified compliant (or fixed)
- [ ] All `bg-navy` consumers verified compliant (or fixed)
- [ ] All `bg-ink` consumers verified intentional
- [ ] Audit report appended to changelog (Phase 2)
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** Audit misses violations because we only check `bg-*` Tailwind classes; inline `style={{ backgroundColor: ... }}` cases bypass the grep. *Mitigation:* sweep `style=` background usages as a secondary pass.
- **Risk:** Some themed surfaces (warm-tan etc.) have edge contrast issues with current text colors. *Mitigation:* note them in the audit but don't sweep unless they're literal yellow/navy surfaces.

## Security Considerations

None.
