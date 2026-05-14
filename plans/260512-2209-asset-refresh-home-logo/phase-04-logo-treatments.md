---
phase: 4
title: Logo Treatments
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 4: Logo Treatments

## Overview

Apply minimal, targeted treatments so transparent logo PNGs work on every surface: keep navbar shadow, bump footer glow on navy, add text-logo to mobile menu header (replacing "MENU" label).

## Requirements

- Functional: Logo visible + readable on paper (navbar), navy (footer), honey (mobile menu).
- Non-functional: Effects are subtle — no glow-bombing.

## Architecture

**Navbar (`top-nav.tsx`):**
- Current: `full-logo.png` w/ `drop-shadow(0 8px 16px rgba(184,134,46,0.32)) drop-shadow(0 2px 4px rgba(43,29,16,0.18))`.
- Decision: keep as-is. Visual QA only.

**Footer (`footer.tsx`):**
- Current: `text-logo.png` over navy bg w/ `drop-shadow-[0_4px_12px_rgba(255,212,73,0.35)]`.
- Target: stack a 0-offset bloom + the existing directional shadow:
  `drop-shadow(0 0 20px rgba(255,212,73,0.45)) drop-shadow(0 4px 12px rgba(255,212,73,0.35))`.

**Mobile menu (`mobile-nav.tsx`):**
- Current header: text label "Menu" (font-display uppercase) + close button.
- Target: replace "Menu" text with `text-logo.png` (`h-10 w-auto`).
- Honey bg + gold wordmark → low contrast. Add `drop-shadow(0 2px 6px rgba(43,29,16,0.25))` (ink shadow) for definition.
- If still weak in QA, fallback to `full-logo.png` (mascots add contrast).

## Related Code Files

- Modify: `components/nav/footer.tsx`
- Modify: `components/nav/mobile-nav.tsx`
- Modify: `components/nav/top-nav.tsx` (pass `logoText` prop to `MobileNav`)
- Read-only verify: `lib/content` (`config.brand.logo`, `config.brand.logoText` paths)

## Implementation Steps

1. **Footer glow bump** in `footer.tsx`:
   ```tsx
   // BEFORE:
   className="h-16 w-auto drop-shadow-[0_4px_12px_rgba(255,212,73,0.35)] md:h-20 lg:h-24"
   // AFTER:
   className="h-16 w-auto [filter:drop-shadow(0_0_20px_rgba(255,212,73,0.45))_drop-shadow(0_4px_12px_rgba(255,212,73,0.35))] md:h-20 lg:h-24"
   ```
   (Tailwind's `drop-shadow-[...]` only stacks one filter; use `[filter:...]` arbitrary class to stack two `drop-shadow()` funcs.)

2. **Mobile menu logo** in `mobile-nav.tsx`:
   - Add `logoText` prop:
     ```tsx
     export function MobileNav({ navItems, spotlight, logoText }: {
       navItems: NavItem[];
       spotlight?: Pick<Character, "image" | "name"> | null;
       logoText: string;
     })
     ```
   - Update `top-nav.tsx` to pass `logoText={config.brand.logoText}`.
   - Replace the header `<span>Menu</span>` with:
     ```tsx
     <Image
       src={logoText}
       alt="ScoutPaw"
       width={200}
       height={64}
       className="h-10 w-auto [filter:drop-shadow(0_2px_6px_rgba(43,29,16,0.25))]"
     />
     ```

3. **Navbar visual verify** in `top-nav.tsx`: No code change beyond the new `logoText` prop wiring. Confirm logo crisp during QA in Phase 5.

4. `pnpm typecheck`.

## Success Criteria

- [x] Footer wordmark glows visibly on navy without looking like a UFO.
- [x] Mobile menu header shows the ScoutPaw wordmark instead of "MENU" text; readable on honey bg.
- [x] Navbar logo (no visual code change) renders crisply on paper bg.
- [x] Type check passes.

## Risk Assessment

- **Risk:** Mobile menu wordmark contrast on honey is still too weak even w/ ink shadow.
  - **Mitigation:** Switch `src` to `full-logo.png` (mascots add contrast) — single-line change.
- **Risk:** Stacked filter syntax `[filter:...]` is Tailwind v3.4+ feature.
  - **Mitigation:** Project uses Tailwind 3.4.14 per pnpm-lock — supported. Verify in dev.
- **Risk:** `text-logo` aspect ratio vs `h-10 w-auto` may render too narrow/wide.
  - **Mitigation:** Set explicit `width`/`height` props on `<Image>` (already in plan). Adjust if visual feels off.
