---
phase: 4
title: Validation & Polish
status: completed
priority: P2
effort: 1.5h
dependencies:
  - 3
---

# Phase 4: Validation & Polish

## Overview

Verify the Characters page against all cross-cutting requirements — responsive,
accessibility, performance/CLS, animations — and run the full build gate.

## Requirements

- Functional: page works on desktop/tablet/mobile; detail pages still render.
- Non-functional: WCAG AA contrast; no CLS; reduced-motion respected;
  `tsc` + `lint` + `build` all clean.

## Architecture

No new code — verification, with small polish fixes as findings dictate.

## Implementation Steps

1. **Build gate** — `pnpm exec tsc --noEmit`, `pnpm exec next lint`,
   `pnpm build` — all must pass clean.
2. **Render check** — `pnpm start`, open `/characters`: hero, quick-nav (5
   chips), 5 sections alternating L/R image, `CloudDivider` between, newsletter.
3. **Responsive** — at ~375 / ~768 / ~1440 px: desktop 2-col; tablet sane;
   mobile single column (image above text); quick-nav horizontally scrollable
   on mobile, no overflow.
4. **Accessibility** —
   - Heading order: one `h1` (hero) → `h2` per character section.
   - Contrast: subtitle + description + quote text vs their backgrounds ≥ AA
     (4.5:1 body / 3:1 large). Accent tints must stay light enough behind text.
   - `alt` text on every character image; decorative shapes `aria-hidden`.
   - Quick-nav anchors keyboard-focusable with visible `focus-visible` ring;
     `scroll-mt` offsets the sticky nav so headings aren't hidden.
5. **Animations** — with OS "reduce motion" on: floating-shape drift, hover
   scale, and `ScrollReveal` reveal are disabled / non-essential.
6. **Performance / CLS** — image boxes have fixed aspect ratios (no shift on
   load); only hero + first character image are `priority`; remaining images
   lazy; `sizes` attributes set. Confirm no layout shift on scroll/load.
7. **Regression** — visit `/characters/[slug]` for 2–3 pups: detail page renders
   new description + `CharacterQuote`, no `funFacts` remnants; home page
   `character-showcase` still renders.
8. Fix any findings; re-run step 1.

## Success Criteria

- [ ] `tsc --noEmit`, `next lint`, `next build` all clean
- [ ] `/characters` correct on desktop, tablet, mobile
- [ ] Heading hierarchy valid; text contrast ≥ AA; images have alt text
- [ ] Quick-nav keyboard-accessible; anchor offsets correct
- [ ] `prefers-reduced-motion` disables non-essential animation
- [ ] No CLS; image priority/lazy split correct
- [ ] Detail pages + home character section regression-free

## Risk Assessment

- **Accent contrast** — light accents (e.g. Bella `#B8A1D9`, Max `#FFB627`)
  behind text can fail AA. Mitigation: text on light `surface`, accent reserved
  for tints/decoration (already the design rule) — verify, don't assume.
- **Live prod QA gap** — `scoutpaw.vercel.app` returns 404; verification is
  limited to a local production build. Note for post-deploy smoke testing.
