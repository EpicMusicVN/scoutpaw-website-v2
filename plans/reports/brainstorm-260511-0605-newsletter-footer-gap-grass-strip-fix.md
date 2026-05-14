---
type: brainstorm
date: 2026-05-11
slug: newsletter-footer-gap-grass-strip-fix
status: approved
related: 260511-0205-cinematic-hero-and-layout-polish
---

# Brainstorm — Newsletter→Footer Gap Real Cause (GrassStrip Recolor)

## Problem

Previous polish pass reduced `NewsletterCTA` `pb-32 → pb-16`. User still sees a visible "gap" between the honey gradient and the navy footer on Home + Shop.

## Root cause (found in scout)

The "gap" is NOT padding. It's the `GrassStrip` component at the top of `<Footer>`:
- Outer div: `bg-grass` (#7bc47f green) with grass blades + flowers SVG
- TOP region of the SVG: a wavy path filled with `var(--bg-base)` (cream) — designed as a transition from cream-background pages
- That cream strip sits directly under the honey gradient, reading as a "gap" interruption

## Approaches Evaluated

| Option | Pro | Con | Verdict |
|--------|-----|-----|---------|
| Recolor cream curve to honey via `:has(#newsletter)` CSS var | Targeted; preserves cream behavior for Watch + other pages; no per-page plumbing | Requires `:has()` browser support (production-safe 2026) | **Chosen** |
| Remove cream curve globally | Single fix everywhere | Breaks visual continuity on cream-background pages (Watch SubscribeCard sits on bg-paper) | Rejected |
| Remove GrassStrip entirely for affected pages | Most dramatic; eliminates the strip altogether | Loses brand "grass garden" feel; bigger redesign | Rejected |

| Gradient direction option | Pro | Con | Verdict |
|---------------------------|-----|-----|---------|
| 180° (vertical) | Bottom edge solid `var(--brand-primary)`; perfect color match with recolored curve | Section feels slightly different from current 135° diagonal | **Chosen** |
| Keep 135° + accept color blend | No section change | Curve color won't match left side of gradient bottom (which is `brand-honey`, not `brand-primary`) | Rejected |
| Solid cap div below gradient | Bridges colors | Extra DOM node for what CSS can do alone | Rejected |

## Final Solution (3 edits)

### 1. `app/globals.css` — CSS var with `:has()` scoping
```css
:root {
  --grass-strip-top: var(--bg-base);
}
body:has(#newsletter) {
  --grass-strip-top: var(--brand-primary);
}
```

### 2. `components/nav/footer.tsx` — read the var in GrassStrip
- Change `fill="var(--bg-base)"` (line 143) → `fill="var(--grass-strip-top, var(--bg-base))"`

### 3. `components/home/newsletter-cta.tsx` — vertical gradient
- `linear-gradient(135deg, var(--brand-honey) 0%, var(--brand-primary) 100%)` → `linear-gradient(180deg, ...)`

## Risks

| Risk | Mitigation |
|------|------------|
| `:has()` not supported in older browsers | `var()` fallback to `var(--bg-base)` — graceful degradation |
| Gradient angle change feels different | 180° still warm + brand-consistent; minor visual shift |
| Future page adds `#newsletter` and inherits the override | Intended; CSS selector handles automatically |

## Success Metrics

- No visible cream strip between honey gradient and grass on Home + Shop
- Watch + Characters + Coming-Soon + Privacy + Terms unchanged (cream curve preserved)
- Build/lint/typecheck pass

## Next Steps

1. Apply 3 edits inline
2. Verify build/lint/typecheck
3. Manual QA: load Home + Shop in browser, confirm honey→grass transition is seamless
4. Update changelog

## Unresolved Questions

None.
