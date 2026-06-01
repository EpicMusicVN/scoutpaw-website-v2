---
phase: 3
title: VIP Spacing and Verification
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
---

# Phase 3: VIP Spacing and Verification

## Overview

Trivial spacing fix on newsletter card (`pb-16 md:pb-20` → `pb-28 md:pb-36`), then full-plan verification + changelog entry.

## Requirements

**Functional:**
- Newsletter CTA gains ~64–80px more bottom padding before footer
- Change is uniform across all 4 pages using NewsletterCTA (home, characters, top-picks, shop)
- Full plan: typecheck + lint clean, no AA regressions, changelog updated

**Non-functional:**
- No regression to mobile spacing (the bump is bigger on desktop than mobile, which is fine — mobile already has tight vertical rhythm)

## Architecture

Single-class change to outermost section padding. The component's `<section>` already has `pb-16 md:pb-20`. Bumping to `pb-28 md:pb-36` adds breathing room without affecting horizontal layout, card sizing, or inner content.

## Related Code Files

- **Modify:** `components/home/newsletter-cta.tsx` (line ~67) — bottom padding bump
- **Modify:** `docs/project-changelog.md` — append plan completion entry
- **Read only:** `components/nav/footer.tsx` to confirm footer top padding combined with new VIP bottom is harmonious

## Implementation Steps

1. **Open** `components/home/newsletter-cta.tsx`.
2. **Edit line ~67:**
   ```diff
   - className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pt-4 pb-16 md:px-8 md:pt-4 md:pb-20"
   + className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pt-4 pb-28 md:px-8 md:pt-4 md:pb-36"
   ```
3. **Save.**
4. **Run full validation:**
   - `pnpm typecheck` — must pass
   - `pnpm lint` — must pass
   - Dev server: visual check on `/`, `/characters`, `/top-picks`, `/shop` — confirm extra breathing room before footer
5. **Manual AA contrast spot-check** — confirm headings updated in Phase 2 still hit AA on their bg.
6. **Update changelog** — append entry to `docs/project-changelog.md`:
   ```markdown
   ## [2026-05-26] - Heading Typography System (Blue/Yellow/White) + VIP Footer Spacing

   ### Overview
   Introduced 3-color heading contract (navy/yellow/white) with gradient utilities and `text-shadow-soft` readability protection. Applied to hero h1 and section h2 on landmark surfaces. Body text untouched. Newsletter card gains ~64–80px more breathing room before the footer.

   ### Changes
   - `app/globals.css`: new utility classes `.heading-gradient-cool`, `.heading-gradient-warm`, `.heading-gradient-tri`, `.text-shadow-soft`, `.text-shadow-warm-glow`.
   - ~15 component files: h1/h2 swaps on landmark heroes and section titles.
   - `components/home/newsletter-cta.tsx`: bottom padding `pb-16 md:pb-20` → `pb-28 md:pb-36`.

   ### Validation
   - `pnpm typecheck`: clean
   - `pnpm lint`: clean
   - Manual AA contrast check on all modified surfaces
   ```

## Success Criteria

- [ ] Newsletter card has visibly more padding above footer on all 4 pages
- [ ] All Phase 1 + 2 changes still render correctly
- [ ] Typecheck + lint clean
- [ ] Changelog entry added
- [ ] No AA contrast regressions confirmed

## Risk Assessment

- **Risk:** Footer top padding + new VIP bottom padding combine into uncomfortably large gap. *Mitigation:* if visual gap > 200px feels excessive, dial VIP back to `pb-24 md:pb-32`.
- **Risk:** Other pages without NewsletterCTA (e.g., privacy, terms) now have unbalanced bottom rhythm. *Mitigation:* out of scope — those pages have their own footers/transitions.

## Security Considerations

None.
