---
phase: 3
title: Navbar and Verification
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
---

# Phase 3: Navbar and Verification

## Overview

Apply `text-ink-blue` to navbar links (desktop + mobile). Full plan verification: typecheck, lint, manual AA pass, changelog entry.

## Requirements

**Functional:**
- Desktop nav (`components/nav/nav-links.tsx`): link text uses `text-ink-blue` (active + hover + inactive states)
- Mobile nav (`components/nav/mobile-nav.tsx`): drawer link text uses `text-ink-blue`
- Disabled state (item.enabled=false) uses `text-ink-blue/45` for the dimmed look
- Underline accent on hover/active remains `bg-ink` (or update to `bg-ink-blue` for consistency — keep cohesive)

**Non-functional:**
- No regression to nav behavior (hover, focus, active styles)
- AA contrast on navbar bg (glass / cream / cyan depending on page)

## Architecture

`nav-links.tsx` uses conditional className via `cn()`. Three states: active (`text-ink`), enabled hover (`text-ink hover:text-ink`), disabled (`text-ink/45 hover:text-ink/70`). Each → `text-ink-blue` variants.

`mobile-nav.tsx` is larger (drawer + animations). Multiple `text-ink` occurrences inside link components.

## Related Code Files

- **Modify:** `components/nav/nav-links.tsx`
- **Modify:** `components/nav/mobile-nav.tsx`
- **Modify:** `docs/project-changelog.md`
- **Read only (verify):** `app/globals.css` (`.nav-underline::after` background)

## Implementation Steps

1. **Edit `nav-links.tsx`**:
   ```diff
   - "nav-underline relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 md:px-5 md:text-base",
   - active
   -   ? "text-ink"
   -   : item.enabled
   -     ? "text-ink hover:text-ink"
   -     : "text-ink/45 hover:text-ink/70",
   + "nav-underline relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 md:px-5 md:text-base",
   + active
   +   ? "text-ink-blue"
   +   : item.enabled
   +     ? "text-ink-blue hover:text-ink-blue"
   +     : "text-ink-blue/45 hover:text-ink-blue/70",
   ```
2. **Edit `mobile-nav.tsx`**: swap each `text-ink` for `text-ink-blue` (and `text-ink/N` for `text-ink-blue/N`). 7 occurrences per scout.
3. **Update underline color** (optional): in `globals.css`, the `.nav-underline::after` uses `background-color: var(--ink)`. For consistency, change to `var(--ink-blue)`:
   ```css
   .nav-underline::after {
     background-color: var(--ink-blue);  /* was --ink */
   }
   ```
4. **Typecheck + lint** the full project.
5. **Dev server live check** — all pages, confirm:
   - Navbar links read as deep navy
   - Body text reads as deep navy across pages
   - Headings unchanged (navy h2, gradient h1)
   - Newsletter button stays dark with white text
   - Footer text unchanged (white on navy footer)
6. **AA contrast spot-check** — pick worst-case surfaces:
   - Body on cyan body bg: navy on cyan ~6:1 ✓
   - Kicker (`text-ink-blue/70`) on white surface: ~6:1 ✓
   - Nav link on glass (semi-transparent over cyan): ~5:1 expected ✓
7. **Append changelog entry** to `docs/project-changelog.md`:
   ```markdown
   ## [2026-05-26] - Typography v2: Body Text → Deep Navy + Navbar Blue

   ### Overview
   Plan D of the styling iteration. Replaced dark-brown body text across the website with new `--ink-blue` (#1a3a5c) deep navy token. Affects ~130 line edits across ~36 component files. Navbar (desktop + mobile) adopts the same blue. Headings (Plan A) unchanged. Newsletter button + form borders preserved as dark anchors.

   ### Changes
   - `app/globals.css`: new `--ink-blue: #1a3a5c` token (+ `-rgb` form).
   - `tailwind.config.ts`: registered `ink-blue` color.
   - ~36 component files: body text sweep (`text-ink`, `text-warm-text`, `text-warm-muted` → `text-ink-blue` / `text-ink-blue/70`).
   - `components/nav/nav-links.tsx`, `mobile-nav.tsx`: navbar text uses `text-ink-blue`.
   - `app/globals.css`: `.nav-underline::after` background updated to `var(--ink-blue)`.

   ### Validation
   - typecheck + lint clean
   - AA contrast spot-check across cyan/white/warm-tan surfaces
   ```

## Success Criteria

- [ ] Navbar links use `text-ink-blue` across all states
- [ ] Mobile nav drawer text uses `text-ink-blue`
- [ ] Nav underline accent uses ink-blue
- [ ] Body sweep visible site-wide
- [ ] Typecheck + lint clean
- [ ] No AA regressions
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Nav underline color change creates inconsistency with anything else still using `--ink` for accents. *Mitigation:* limit change to `.nav-underline::after`; don't touch other `--ink` references in `globals.css`.
- **Risk:** Mobile nav drawer has unique text-ink usages (e.g., on darker overlay backgrounds). *Mitigation:* visual check on mobile drawer; revert to `text-ink` if any specific instance fails AA on the drawer surface.

## Security Considerations

None.
