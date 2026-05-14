# Brainstorm — Hero Banner Alignment Fix

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Align hero text card with site-wide content container; preserve full-bleed banner image

---

## Problem

Hero glass card uses viewport-anchored positioning (`md:left-12 lg:left-16` → 48px / 64px from screen edge).
Every other section (navbar, menu cards, feature banners, video grid, footer) uses `mx-auto max-w-hero px-4 md:px-8` → centered 1400px container with 16/32px padding.

On a 1920px viewport the gap is **~228px** between hero card and other sections' left edges → looks disconnected.

---

## Decisions (User-Confirmed)

| Decision | Choice |
|---|---|
| Desktop placement | Flex left-center inside `max-w-hero` container |
| Mobile/tablet | Keep current stack-below-banner with `-mt-8` overlap |
| Scope discipline | Fix hero only. No `<Container>` extraction. |

---

## Single File to Edit

`D:\works\emvn\scoutpaw-v2\components\home\full-bleed-hero.tsx`

---

## Before (lines 26–66)

```tsx
<section className="relative isolate bg-paper">
  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[100svh]">
    <Image fill ... />
  </div>

  {/* Glass card — viewport-anchored on md+ */}
  <div className="relative mx-4 mt-8 max-w-md rounded-3xl ... bg-honey/85 ... md:absolute md:left-12 md:top-24 md:mx-0 md:mt-0 md:max-w-md md:p-8 lg:left-16 lg:top-32 lg:max-w-lg lg:p-10">
    {/* kicker / h1 / description / actions */}
  </div>
</section>
```

## After

```tsx
<section className="relative isolate bg-paper">
  {/* Full-bleed banner: unchanged */}
  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[100svh]">
    <Image fill ... />
  </div>

  {/*
    Card wrapper:
    - mobile: relative, in-flow below banner
    - md+: absolute overlay, centered vertically, constrained by max-w-hero
  */}
  <div className="relative md:absolute md:inset-0 md:flex md:items-center md:pointer-events-none">
    <div className="md:mx-auto md:w-full md:max-w-hero md:px-8 md:pointer-events-auto">
      <div className="mx-4 -mt-8 max-w-md rounded-3xl border border-white/40 bg-honey/85 p-6 shadow-cozy-xl backdrop-blur-xl md:mx-0 md:mt-0 md:p-8 lg:max-w-lg lg:p-10">
        {/* kicker / h1 / description / actions — UNCHANGED */}
      </div>
    </div>
  </div>
</section>
```

---

## Why This Works

**Mobile (< md, 768px)**:
- Outer wrapper is `relative` → in flow below banner div
- Inner div has no padding/container classes on mobile → transparent passthrough
- Card uses `mx-4 -mt-8` → 16px side padding + 32px upward overlap onto banner
- **Identical visual behavior to current implementation**

**Desktop (md+ ≥ 768px)**:
- Outer wrapper becomes `absolute inset-0 flex items-center` → overlays the full-bleed banner, vertically centered
- `pointer-events-none` on wrapper + `pointer-events-auto` on inner → image stays clickable in dead space (defensive)
- Inner uses `mx-auto w-full max-w-hero px-8` → exact same container math as navbar (`top-nav.tsx:29`)
- Card sits at the container's left edge → pixel-perfect alignment with navbar logo/links

**Viewport math** (after fix, 1920px screen):
- Container left edge: `(1920 - 1400) / 2 = 260px` from viewport edge
- Card left edge: `260 + 32 (px-8) = 292px` from viewport edge
- Navbar left edge: `260 + 32 (px-8) = 292px` from viewport edge
- **Difference: 0px** ✓

**Removed:** `md:left-12 md:top-24 lg:left-16 lg:top-32` (the magic numbers causing drift)
**Removed:** `md:max-w-md` (redundant; mobile `max-w-md` carries through)

---

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| **< 768px** | Banner aspect-[4/3], card flows below with -mt-8 overlap, mx-4 padding |
| **768–1023px (md)** | Banner 100svh, card overlays, max-w-md, container px-8 |
| **1024px+ (lg)** | Same as md, card scales to max-w-lg, container px-8 |
| **1400px+** | Container caps at 1400px, card aligns with navbar/other sections |

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Vertical centering on very tall viewports puts card too low | Low | `flex items-center` centers within viewport; matches cinematic intent |
| `pointer-events-none` on wrapper hides clickable banner | None | No clickable banner currently; defensive only |
| Mobile -mt-8 overlap changes due to refactor | Low | Mobile code path is structurally unchanged; same classes preserved |
| Card width on very narrow desktop (768–820px) | Low | `max-w-md` (28rem = 448px) leaves ≥320px banner whitespace on the right |

---

## Success Criteria

- Card's left edge matches navbar's left edge at all viewports ≥ md
- Mobile behavior visually unchanged (banner above, card below with overlap)
- Banner remains full-bleed edge-to-edge
- No layout shift on hydration
- `pnpm typecheck` and `pnpm lint` clean

---

## Out of Scope (Explicit)

- Extracting a reusable `<Container>` component (deferred — 6+ sections duplicate the string; separate refactor)
- Migrating other sections to use a new wrapper
- Restyling the glass card itself (colors, blur, shadow, typography)
- Changing the banner image strategy

---

## Unresolved Questions

None. Design is single-file, low-risk, mechanically straightforward.
