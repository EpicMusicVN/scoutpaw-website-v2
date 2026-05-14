---
phase: 3
title: Menu Cards Transparent-Icon Treatment
status: completed
priority: P1
effort: 45m
dependencies:
  - 1
---

# Phase 3: Menu Cards Transparent-Icon Treatment

## Overview

Ground the new background-removed card icons with a subtle accent-color radial glow + warm drop-shadow. Add per-icon glow color map. Tighten padding so icons don't kiss card edges. Intensify shadow on hover for a lift-off feel.

## Requirements

- Functional: Each visible card icon (characters, shop, watch) feels grounded on its colored bg, not floating. Hover increases shadow depth.
- Non-functional: Glow blur stays cheap on mobile (single `blur-3xl` per card, low opacity). Card grid `auto-rows-fr` height parity preserved.

## Architecture

**Current state (`menu-cards.tsx`):**
- 3 visible cards: characters/shop/watch
- Each card: rotated bg-color sticker w/ image filling upper `flex-1` zone via `object-contain object-center`
- Hover: rotates to 0deg, lifts shadow, scales image 1.05

**Target state:**
- Add `accentGlow` field to `Card` type (CSS color for radial glow).
- Inside `flex-1` image container, add a radial-gradient `<div>` (decorative) behind the image: `blur-3xl opacity-30` matching `accentGlow`.
- Apply `drop-shadow(0_18px_24px_rgba(43,29,16,0.18))` to the image; hover bumps to `(0_24px_32px_rgba(43,29,16,0.28))`.
- Pad image container `p-4 md:p-6` so icons don't kiss edges.
- Nudge icon up via `objectPosition: "center 60%"` so shadow puddle reads as ground contact.

**Per-card glow color map (locked from brainstorm):**
| Card | accentGlow |
|---|---|
| characters | `var(--brand-honey)` |
| shop | `var(--brand-peach)` |
| watch | `#A8DADC` (sky) |
| music | `#A8DADC` (sky) |
| events | `#FF9E5C` (peach-warm) |
| blog | `var(--brand-honey)` |
| make | `var(--brand-peach)` |

> Verify exact CSS var names against `app/globals.css` during impl. Fall back to hex if a var doesn't exist.

## Related Code Files

- Modify: `components/home/menu-cards.tsx`
- Read for verification: `app/globals.css` (confirm `--brand-honey`, `--brand-peach` exist)

## Implementation Steps

1. Read `app/globals.css` to confirm CSS variable names for brand colors. Adjust map if needed.

2. Update `Card` type:
   ```ts
   type Card = {
     label: string;
     copy: string;
     image: string;
     href: string;
     rotate: string;
     bg: string;
     accentGlow: string;  // NEW
     comingSoon?: boolean;
   };
   ```

3. Populate `accentGlow` on each card in `allCards`:
   ```ts
   { label: "Meet the Pack", ..., bg: "var(--bg-honey)", accentGlow: "var(--brand-honey)" },
   { label: "Shop the Pack", ..., bg: "var(--bg-peach)",  accentGlow: "var(--brand-peach)" },
   { label: "Watch Together", ..., bg: "var(--bg-warm-tan)", accentGlow: "#A8DADC" },
   // (also fill events/blog/make/music per map so future enabling is one-line)
   ```

4. Update image container in `MenuCard`:
   ```tsx
   <div className="relative flex-1 p-4 md:p-6">
     {/* Accent glow behind icon */}
     <div
       aria-hidden="true"
       className="pointer-events-none absolute inset-x-1/4 top-1/4 h-1/2 rounded-full blur-3xl opacity-30 transition-opacity duration-300 group-hover:opacity-40"
       style={{ backgroundColor: card.accentGlow }}
     />
     <Image
       src={card.image}
       alt=""
       fill
       sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
       className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
       style={{
         objectPosition: "center 60%",
         filter: "drop-shadow(0 18px 24px rgba(43,29,16,0.18))",
       }}
       aria-hidden="true"
     />
   </div>
   ```

5. Add hover shadow intensification via Tailwind arbitrary-value group-hover:
   - Drop-shadow is in `style` (inline) so we can't `group-hover:` it directly. Two options:
     - (a) Use CSS variable + `group-hover:` class that swaps it. Cleanest.
     - (b) Apply both base and hover via `style` + JS state. Heavier.
   - **Chosen:** Use a CSS class with `drop-shadow` + `group-hover:drop-shadow` Tailwind utilities:
     ```tsx
     className="object-contain transition-all duration-500 ease-out group-hover:scale-105 drop-shadow-[0_18px_24px_rgba(43,29,16,0.18)] group-hover:drop-shadow-[0_24px_32px_rgba(43,29,16,0.28)]"
     ```
     Drop the inline `style.filter`; keep only `objectPosition` inline.

6. Run `pnpm typecheck` and visual smoke test in dev.

## Success Criteria

- [x] Each visible card icon shows a soft warm shadow under it; hover deepens the shadow.
- [x] Subtle accent-color glow visible behind icon, not overwhelming.
- [x] Icons sit centered with ~16-24px breathing room on all sides.
- [x] Card heights remain consistent across the row (`auto-rows-fr` works).
- [x] Hover rotates card to 0deg + lifts, glow opacity increases, icon scales smoothly.
- [x] Type check passes.

## Risk Assessment

- **Risk:** Glow color via CSS var fails if var doesn't exist → falls back to nothing (transparent).
  - **Mitigation:** Verify vars in `app/globals.css` before commit. Hex fallback for any missing.
- **Risk:** Drop-shadow on `object-contain` images can clip at container edges if image is too large.
  - **Mitigation:** `p-4 md:p-6` padding provides clearance; `overflow-hidden` on card root is fine because shadow stays within image bbox.
- **Risk:** Multiple `blur-3xl` glows hurt mobile paint perf.
  - **Mitigation:** Only 3 visible cards today; opacity 0.3 ceiling; only one blur container per card.
