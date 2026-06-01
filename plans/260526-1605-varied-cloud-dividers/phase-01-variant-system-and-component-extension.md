---
phase: 1
title: Variant System and Component Extension
status: completed
priority: P2
effort: 1.5h
dependencies: []
---

# Phase 1: Variant System and Component Extension

## Overview

Extend `CloudDivider` from a single static composition into a 4-variant system. Each variant has different cloud puff counts, sizes, and vertical offsets. Add subtle gradient fill on each cloud for soft volume (not flat white).

## Requirements

**Functional:**
- `CloudDivider` accepts `variant?: "trio" | "duo-big" | "scatter" | "stack"` (default `"trio"` — preserves current behavior on other pages)
- Each variant renders a distinct shape composition
- Cloud fill is a subtle linear gradient (white → very-soft-cyan, e.g. `#ffffff → #f0f9fb`) for soft 3D feel
- Gradient `<linearGradient>` IDs are unique per component instance (use `useId()`)
- Component remains `aria-hidden`, decorative-only
- Existing usages (top-picks, shop, watch — single-variant) remain visually unchanged when `variant` is omitted

**Non-functional:**
- File stays under 200 lines (currently ~45; will grow but should stay well under cap)
- No new dependencies; pure SVG + React

## Architecture

Current `CloudDivider` exports one composition (3 horizontal mini clouds). Extension:

```tsx
type Variant = "trio" | "duo-big" | "scatter" | "stack";

export function CloudDivider({ variant = "trio", opacity = 0.7, className }) {
  const gradientId = useId();  // React 18 hook for stable, unique SVG IDs
  return (
    <div aria-hidden className={`... ${className ?? ""}`}>
      {/* shared <defs> with gradient */}
      <svg width="0" height="0"><defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f9fb" />
        </linearGradient>
      </defs></svg>

      {variant === "trio" && <TrioComposition gradientId={gradientId} opacity={opacity} />}
      {variant === "duo-big" && <DuoBigComposition gradientId={gradientId} opacity={opacity} />}
      {variant === "scatter" && <ScatterComposition gradientId={gradientId} opacity={opacity} />}
      {variant === "stack" && <StackComposition gradientId={gradientId} opacity={opacity} />}
    </div>
  );
}
```

Each composition renders mini cloud SVGs with `fill={`url(#${gradientId})`}` instead of flat white. Variants:

| Variant | Composition |
|---|---|
| `trio` (default) | Small puff, large puff, small puff — horizontal row (preserves current) |
| `duo-big` | Large puff, small puff between, large puff (heavier balance) |
| `scatter` | 5 puffs at varied sizes, scattered with small vertical offsets |
| `stack` | 4 puffs vertically offset across two rows (layered depth) |

## Related Code Files

- **Modify:** `components/ui/cloud-divider.tsx`
- **Read only:** existing usages in `app/shop/page.tsx`, `app/top-picks/page.tsx`, watch pages — confirm they call `<CloudDivider />` with no `variant` prop (still get `"trio"` default)

## Implementation Steps

1. **Open** `components/ui/cloud-divider.tsx`.
2. **Refactor** to support variants:
   - Add `Variant` union type and `variant` prop
   - Add `useId()` hook for SVG gradient ID
   - Extract `MiniCloud` to accept `gradientId` prop
   - Create 4 composition components (or inline if file stays tight)
3. **Compositions** — implement each variant:
   - `trio`: existing 3-cloud row (keep current sizing/proportions for backward compat)
   - `duo-big`: 2 large clouds (`w-24`) + 1 small puff (`w-10`) between, centered
   - `scatter`: 5 puffs of varied size (`w-8 → w-16`) with `translate-y-*` offsets in `flex items-end`
   - `stack`: 2 rows of 2 puffs each, vertically offset (`-translate-y-2` / `translate-y-2`)
4. **Smoke test** — temporary render of all 4 variants on a scratch page, verify visually distinct.
5. **Typecheck + lint.**

## Success Criteria

- [ ] `CloudDivider` accepts `variant` prop, defaults to `"trio"`
- [ ] All 4 variants render distinctly
- [ ] Gradient fill applied to all cloud puffs (no flat white)
- [ ] `useId()` produces unique IDs across multiple instances on the same page
- [ ] Default behavior (`<CloudDivider />` no props) renders identically to pre-change
- [ ] Component stays `aria-hidden`
- [ ] File under 200 lines
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** `useId()` not available — needs React 18. *Mitigation:* project uses Next.js + React 18 (verified earlier in plan A's tailwind config note). If issue, fall back to a deterministic per-variant prefix counter (e.g. `cloud-grad-${variant}-${i}`).
- **Risk:** Gradient color too subtle, looks like flat white anyway. *Mitigation:* tune `#f0f9fb` darker if needed (e.g. `#e8f4f7`). Test live.
- **Risk:** SSR mismatch with `useId()`. *Mitigation:* `useId()` is SSR-safe by design; no `Math.random()` or `Date.now()` involved.

## Security Considerations

None. SVG inline, no user content.
