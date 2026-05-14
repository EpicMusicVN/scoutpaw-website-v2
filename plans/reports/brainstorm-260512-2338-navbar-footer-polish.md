# Brainstorm — Navbar + Footer Polish (Logo Aspect Fix + Newsletter Simplification)

**Date:** 2026-05-12
**Status:** Approved, ready for `/ck:plan`
**Scope:** Two files. Fix Next/Image aspect-ratio mismatches that caused stretched logos, downsize both logos to premium-modern range, simplify navbar newsletter CTA to a text link.

---

## Problem Statement

After the recent asset refresh, navbar + footer logos look unbalanced. Investigation revealed the root cause is not visual judgment — it's a concrete Next/Image bug:

| File | Intrinsic | Declared in code | Result |
|---|---|---|---|
| `full-logo.png` (navbar) | 935×789 → **1.18:1** | `width={280} height={112}` → **2.5:1** | Image rendered inside a 2.5:1 box → squished/misaligned |
| `text-logo.png` (footer) | 812×183 → **4.44:1** | `width={280} height={96}` → **2.92:1** | Wordmark inside 2.92:1 box → vertically distorted |

Navbar also had `translate-y-2 md:translate-y-3` hack compensating for prior misalignment. Heights (64/96/112 px navbar, 64/80/96 px footer) larger than typical premium scale.

Additionally: navbar "Join the Newsletter" outline button felt visually heavy.

## User-Locked Decisions

- **Navbar logo size**: compact 40/48/56 px (`h-10 / md:h-12 / lg:h-14`)
- **Newsletter CTA**: text link w/ envelope SVG (no inline form, no removal)
- **Footer logo size**: compact 32/40/48 px (`h-8 / md:h-10 / lg:h-12`)

## Approaches Evaluated

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **A. Fix aspect props + downsize + simplify newsletter** | Smallest diff, addresses root cause | None | **Chosen** |
| B. Keep current sizes, only fix aspect ratio | Less visual change | Logo still feels heavy/oversized | Rejected (heavy) |
| C. Inline email form in navbar | Functional newsletter inline | New form logic, validation, API endpoint — significant scope | Rejected (YAGNI) |
| D. Remove newsletter from navbar | Cleanest | Loses discoverability; home `#newsletter` section is below fold | Rejected by user |

## Final Solution

### Navbar (`components/nav/top-nav.tsx`)

**Logo:**
- `<Image width={118} height={100}>` (1.18:1 matches intrinsic)
- `className="h-10 w-auto ... md:h-12 lg:h-14"` (compact heights)
- Drop `translate-y-2 md:translate-y-3` hack
- Drop-shadow offsets halved: `(0 4px 8px rgba(184,134,46,0.28)) (0 1px 2px rgba(43,29,16,0.16))`

**Newsletter CTA:**
- Replace `<Button variant="outline">Join the Newsletter</Button>` with `<Link>` containing inline envelope SVG + "Newsletter" text
- Styling: `text-ink/75 hover:text-ink`, `gap-1.5`, `text-sm font-medium`
- Same `hidden md:inline-flex` (mobile uses hamburger)
- Same href `/#newsletter`

### Footer (`components/nav/footer.tsx`)

**Logo:**
- `<Image width={222} height={50}>` (4.44:1 matches intrinsic)
- `className="h-8 w-auto ... md:h-10 lg:h-12"` (compact heights)
- Glow scaled: `[filter:drop-shadow(0_0_12px_rgba(255,212,73,0.5))_drop-shadow(0_2px_6px_rgba(255,212,73,0.35))]`

## Implementation Considerations

**Order:**
1. Navbar logo aspect + size + drop translate hack
2. Navbar newsletter CTA replacement
3. Footer logo aspect + size + glow scale
4. `pnpm typecheck` + `pnpm lint`
5. User-driven visual QA

**Risks:**
- Mobile logo at 40px may feel small at first glance — mascot detail is still legible since source is 935×789. Visual QA will tell.
- Newsletter text link may get visually lost between nav items and Shop CTA. Mitigation: bump to `font-semibold` if needed.
- Footer glow at smaller scale may feel flat. First-shadow opacity already bumped 0.45 → 0.5 to compensate; can push to 0.55 if needed.

**Cross-surface consistency:**
- Mobile menu header wordmark: already `h-10` (40px).
- Navbar at mobile: now `h-10` (40px) — matches.
- Footer wordmark: `h-8 / md:h-10 / lg:h-12` — distinct from navbar (smaller; secondary context).

## Files Touched

```
components/nav/top-nav.tsx       (edit logo + replace newsletter)
components/nav/footer.tsx        (edit text-logo + glow scale)
```

## Out of Scope

- Mobile menu (mobile-nav.tsx) — already polished last session
- Hamburger / mobile nav internals
- Footer column structure, social icons, grass strip
- Newsletter section on home page (`#newsletter` target — unchanged)
- Other logo usages (none exist)

## Success Criteria

- Navbar logo renders true 1.18:1 aspect, no stretch
- Navbar feels light: smaller logo, text-link newsletter, primary "Shop" button retained
- Footer wordmark renders true 4.44:1 aspect, no squish
- Visual balance at 360 / 768 / 1024 / 1440 widths
- `pnpm typecheck` + `pnpm lint` clean
- No regression in mobile menu (uses same logo asset)

## Next Steps

1. `/ck:plan` to produce phased implementation
2. Phases: navbar edits → footer edits → typecheck/lint
3. After phases: spot-check on dev server; tune mobile size or glow if QA reveals issues

## Unresolved Questions

- Should "Newsletter" link text expand to "Join newsletter" if it feels too terse? (Deferred to QA — 2-char swap.)
- Should font-weight on Newsletter link bump from `font-medium` to `font-semibold` for parity with Shop CTA? (Deferred to QA.)
