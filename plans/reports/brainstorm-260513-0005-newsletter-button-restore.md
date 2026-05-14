# Brainstorm — Newsletter Button Restore (dark variant, size=lg, envelope icon)

**Date:** 2026-05-13
**Status:** Approved, ready for `/ck:plan`
**Scope:** Single file. Reverse the prior session's text-link change. Newsletter CTA returns to a Button — same structural spec as Shop (size=lg), navy fill (`variant="dark"`), outline envelope SVG icon. Preserves hierarchy: Shop=gold/primary, Newsletter=navy/dark.

---

## Problem Statement

Previous session swapped the Newsletter CTA from a bordered outline button to a plain text+icon Link to reduce visual weight. User feedback: the action should remain a button, matching the Shop button's structural spec (height/padding/radius/font/hover) so the two CTAs feel like siblings. Add an email icon.

## Hierarchy Concern (Surfaced + Resolved)

Two `variant="primary"` brand-gold pills side-by-side would dilute Shop's conversion pull. User picked **navy fill + white text** (the codebase's `variant="dark"`, which also includes `cta-shimmer`). This preserves clear primary/secondary hierarchy while still feeling premium.

## User-Locked Decisions

- Variant: `dark` (navy `bg-navy` + white text + cta-shimmer + shadow-cozy)
- Size: `lg` (matches Shop exactly: `px-6 py-3 text-base min-h-[48px]`, rounded-full)
- Icon: lucide-style outline envelope, 18×18 px, `stroke="currentColor"` (inherits white)
- Responsive: keep both Shop + Newsletter at `size="lg"` across md/lg/xl; verify at 768px during QA. Mobile (<768px) unchanged (hidden behind hamburger).

## Approaches Evaluated

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **A. variant=dark size=lg + envelope SVG** | Hierarchy clean; identical structural spec to Shop; reuses existing `cta-shimmer` + shadow pattern; navy on cream is premium | None — chosen | **Chosen** |
| B. variant=secondary (teal) size=lg | Hierarchy clean | Teal `#2E86AB` looks less premium against cream than navy; no cta-shimmer on secondary | Rejected |
| C. variant=primary size=lg (twin to Shop) | Literal match per request | Two gold pills compete; weakens Shop CTA; anti-pattern | Rejected (anti-pattern) |
| D. variant=outline size=lg | Lightest weight; classic supporting CTA | Less playful/premium; no shimmer; trade-down vs prior outline button look | Rejected |

## Final Solution

### File: `components/nav/top-nav.tsx`

Replace the current `<Link>...</svg>...</Link>` block (from prior session) with:

```tsx
<Button
  href="/#newsletter"
  variant="dark"
  size="lg"
  className="hidden md:inline-flex"
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
  Newsletter
</Button>
```

**Inherited from Button base + variant:**
- Same height (48px), padding (px-6 py-3), border-radius (rounded-full), font (font-display semibold text-base)
- Same focus ring, active scale, transition timing
- `gap-2` between icon and text — no manual spacing needed
- `inline-flex items-center justify-center` — icon vertical-centered automatically
- `cta-shimmer` animation + `shadow-cozy → hover:shadow-cozy-md` lift
- Mobile (<768px): hidden, hamburger handles navigation

## Implementation Considerations

**Order:**
1. Edit `top-nav.tsx` — single block swap
2. `pnpm typecheck` + `pnpm lint`
3. User visual QA on dev server (verify md breakpoint 768-1023px fit)

**Risks:**
- **Width tight at exactly 768px**: estimated layout fits comfortably (~150px headroom) but rendering may differ. Mitigation: visually verify; if tight, reduce header `gap-4` → `gap-3` or `gap-2` between right-side buttons.
- **Two shimmer animations side-by-side may feel busy**: Shop has `cta-shimmer`, Newsletter (dark variant) also has `cta-shimmer`. If too active in QA, two quick mitigations:
  - Override on Newsletter: `className="... [&]:bg-none"` to disable shimmer pseudo-bg
  - OR remove `cta-shimmer` from the `dark` variant globally in `button.tsx`
- **Newsletter ("Newsletter") text length adequacy**: not the heavy "Join the Newsletter" of the original; user-confirmed shorter text. If too terse in QA, expand to "Join Newsletter" (no "the" — 4 chars added).

## Files Touched

```
components/nav/top-nav.tsx       (single block swap)
```

## Out of Scope

- Shop button (unchanged — remains primary CTA)
- Footer (unchanged)
- Mobile menu / hamburger (unchanged)
- Newsletter section on home page (`#newsletter` target — unchanged)
- Button component `button.tsx` (no new variant or size needed)

## Success Criteria

- Newsletter button renders 48px tall, rounded-full, navy bg, white text + icon, with shimmer
- Side-by-side with Shop button: identical height/radius/font, navy vs gold differentiates hierarchy
- Mobile (<768px): button hidden, no regression to hamburger
- `pnpm typecheck` + `pnpm lint` clean
- Visual QA at 768/1024/1440 confirms no overflow

## Next Steps

1. `/ck:plan` to produce phased implementation (likely 2 phases: edit + typecheck/lint)
2. After phases: spot-check on dev server at 768/1024/1440 widths

## Unresolved Questions

- If both shimmer animations feel competing in QA, do we override Newsletter or rethink the `dark` variant globally? (Deferred — visual judgment after render.)
- Should "Newsletter" expand to "Join Newsletter" if it reads too cold for the playful brand voice? (Deferred — visual judgment.)
