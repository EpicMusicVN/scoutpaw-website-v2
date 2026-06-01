---
phase: 1
title: Tokens and Utilities
status: completed
priority: P1
effort: 45m
dependencies: []
---

# Phase 1: Tokens and Utilities

## Overview

Add new heading utility classes to `app/globals.css` and confirm Tailwind tokens for the heading color contract are wired correctly. No component changes in this phase — purely foundation.

## Requirements

**Functional:**
- New utility classes: `.heading-gradient-cool`, `.heading-gradient-warm`, `.heading-gradient-tri`, `.text-shadow-soft`
- All gradient utilities use existing color tokens (`--bg-navy`, `--brand-primary`, `--brand-secondary`, `--surface`)
- `.text-shadow-soft` provides 3 layered shadows for legibility on busy backgrounds; applied to wrapper (not gradient text directly — bg-clip-text + text-shadow don't compose)
- Mobile media query simplifies tri-color gradient to 2-color on `< 640px` to prevent stripe look

**Non-functional:**
- No regression to existing utilities
- Classes are composable with `font-display` and Tailwind size utilities

## Architecture

Gradient text pattern in Tailwind 3.4:
```html
<span class="heading-gradient-tri">
  <h1 class="bg-gradient-to-r from-navy via-brand-primary to-white bg-clip-text text-transparent">
    Title
  </h1>
</span>
```

To apply text-shadow on gradient text, the **wrapper** receives `text-shadow-soft`; the shadow renders behind the gradient via the wrapper's positioning context. Alternative: shadow on a sibling pseudo-element. We'll use the wrapper approach (simpler).

## Related Code Files

- **Modify:** `app/globals.css` — append utility classes in `@layer utilities`
- **Verify only:** `tailwind.config.ts` — `navy`, `brand`, `surface` tokens already exist

No new files. No deletions.

## Implementation Steps

1. **Open** `app/globals.css`.
2. **Append to `@layer utilities` (create the layer if missing):**

   ```css
   @layer utilities {
     /* Heading gradient presets — apply to <h1>/<h2>. Pair with text-shadow-soft
        on a wrapper span if the heading sits on a busy background. */
     .heading-gradient-cool {
       background-image: linear-gradient(
         90deg,
         var(--bg-navy) 0%,
         var(--brand-secondary) 50%,
         var(--bg-navy) 100%
       );
       background-clip: text;
       -webkit-background-clip: text;
       color: transparent;
     }
     .heading-gradient-warm {
       background-image: linear-gradient(
         90deg,
         var(--brand-primary) 0%,
         #ffffff 100%
       );
       background-clip: text;
       -webkit-background-clip: text;
       color: transparent;
     }
     .heading-gradient-tri {
       background-image: linear-gradient(
         90deg,
         var(--bg-navy) 0%,
         var(--brand-primary) 50%,
         #ffffff 100%
       );
       background-clip: text;
       -webkit-background-clip: text;
       color: transparent;
     }
     /* Mobile: simplify tri-color to 2-color to avoid striped look on narrow viewports. */
     @media (max-width: 639px) {
       .heading-gradient-tri {
         background-image: linear-gradient(
           90deg,
           var(--bg-navy) 0%,
           var(--brand-primary) 100%
         );
       }
     }
     /* Soft legibility lift for headings on busy backgrounds. Apply to a WRAPPER
        around gradient text (text-shadow doesn't composite with bg-clip-text). */
     .text-shadow-soft {
       text-shadow:
         0 1px 0 rgb(255 255 255 / 0.5),
         0 2px 8px rgb(0 0 0 / 0.08),
         0 4px 16px rgb(0 0 0 / 0.06);
     }
     /* Warm glow variant — pairs with yellow text on dark surfaces. */
     .text-shadow-warm-glow {
       text-shadow:
         0 0 12px rgb(255 215 12 / 0.4),
         0 2px 6px rgb(184 134 46 / 0.3);
     }
   }
   ```

3. **Save.**
4. **Typecheck + lint:** `pnpm typecheck && pnpm lint` — must pass.
5. **Quick smoke test:** add a temp `<h1 class="heading-gradient-tri text-6xl font-display">Test</h1>` in any page, view in browser. Confirm gradient renders. Remove after.

## Success Criteria

- [ ] All 4 utility classes added to `globals.css` under `@layer utilities`
- [ ] Mobile media query reduces tri-color → 2-color on `< 640px`
- [ ] Typecheck + lint clean
- [ ] Smoke test renders gradient text correctly in Chrome + Safari (webkit prefix)
- [ ] No regression to existing utilities

## Risk Assessment

- **Risk:** `@layer utilities` may not exist in current `globals.css`. *Mitigation:* create it; Tailwind 3.4 supports custom layers cleanly.
- **Risk:** `-webkit-background-clip: text` deprecation. *Mitigation:* the standard `background-clip: text` is well-supported in modern browsers; webkit prefix is belt-and-suspenders.
- **Risk:** Tri-color gradient looks muddy on small/narrow headings. *Mitigation:* media query at `< 640px` falls back to 2-color. Phase 2 will further tune which headings use tri vs. simpler gradients.

## Security Considerations

None. Pure CSS, no data flow.
