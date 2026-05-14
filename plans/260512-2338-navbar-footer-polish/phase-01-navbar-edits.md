---
phase: 1
title: Navbar Edits
status: completed
priority: P1
effort: 15m
dependencies: []
---

# Phase 1: Navbar Edits

## Overview

Fix navbar logo aspect ratio (1.18:1 intrinsic, was declared 2.5:1), downsize to 40/48/56 px, drop the `translate-y` compensation hack, and replace the bordered "Join the Newsletter" button with a text link + inline envelope SVG.

## Requirements

- Functional: Logo renders unstretched. Newsletter CTA navigates to `/#newsletter`. Mobile uses hamburger (unchanged).
- Non-functional: No new dependencies; SVG inline. Maintain SSR safety (no `"use client"` in top-nav).

## Architecture

**Current `components/nav/top-nav.tsx`:**
- `<Image width={280} height={112}>` declares 2.5:1, intrinsic file is 1.18:1 → stretched box
- `h-16 md:h-24 lg:h-28` = 64/96/112 px
- `translate-y-2 md:translate-y-3` compensates for prior visual misalignment
- `<Button variant="outline">Join the Newsletter</Button>` — bordered pill, heavy visual weight

**Target:**
- `<Image width={118} height={100}>` matches intrinsic 1.18:1 (proportional to 935×789)
- `h-10 md:h-12 lg:h-14` = 40/48/56 px
- No `translate-y` — `items-center` on flex container handles centering
- Drop-shadow scaled: `0 8px 16px → 0 4px 8px` / `0 2px 4px → 0 1px 2px`; first opacity 0.32 → 0.28
- Replace Button with `<Link>` containing 16×16 envelope SVG + "Newsletter" text, styled `text-ink/75 hover:text-ink`, `text-sm font-medium`

## Related Code Files

- Modify: `components/nav/top-nav.tsx`

## Implementation Steps

1. Update logo `<Image>` element:
   ```tsx
   // BEFORE
   <Image
     src={config.brand.logo}
     alt={config.brand.fullName}
     width={280}
     height={112}
     className="h-16 w-auto translate-y-2 transition-transform duration-300 ease-out hover:scale-[1.04] md:h-24 md:translate-y-3 lg:h-28"
     style={{
       filter:
         "drop-shadow(0 8px 16px rgba(184, 134, 46, 0.32)) drop-shadow(0 2px 4px rgba(43, 29, 16, 0.18))",
     }}
     priority
   />

   // AFTER
   <Image
     src={config.brand.logo}
     alt={config.brand.fullName}
     width={118}
     height={100}
     className="h-10 w-auto transition-transform duration-300 ease-out hover:scale-[1.04] md:h-12 lg:h-14"
     style={{
       filter:
         "drop-shadow(0 4px 8px rgba(184, 134, 46, 0.28)) drop-shadow(0 1px 2px rgba(43, 29, 16, 0.16))",
     }}
     priority
   />
   ```

2. Replace Newsletter `<Button>`:
   ```tsx
   // BEFORE
   <Button
     href="/#newsletter"
     size="md"
     variant="outline"
     className="hidden md:inline-flex"
   >
     Join the Newsletter
   </Button>

   // AFTER
   <Link
     href="/#newsletter"
     className="hidden items-center gap-1.5 text-sm font-medium text-ink/75 transition-colors duration-200 hover:text-ink md:inline-flex"
   >
     <svg
       width="16"
       height="16"
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
   </Link>
   ```

3. Verify `Button` import is still needed (it is — Shop CTA still uses it). Leave import as-is.

4. Save file. No further changes.

## Success Criteria

- [x] Navbar logo renders unstretched at intrinsic 1.18:1 aspect.
- [x] Logo heights: 40 px (mobile), 48 px (md), 56 px (lg).
- [x] No `translate-y-*` classes on logo.
- [x] Newsletter link renders as text+icon, not a bordered pill.
- [x] Newsletter link is `hidden` below `md:` breakpoint (mobile uses hamburger).
- [x] Shop primary button untouched.
- [x] Drop-shadow visible but not heavy at smaller logo size.

## Risk Assessment

- **Risk:** Logo at 40px mobile may feel small.
  - **Mitigation:** Visual QA on dev server; if too small, bump mobile to `h-12` (48 px). One-line tune.
- **Risk:** "Newsletter" link visually lost between nav-links and Shop button.
  - **Mitigation:** If lost, bump `font-medium` → `font-semibold` or add an underline-on-hover.
- **Risk:** Removing `translate-y` exposes a different alignment issue.
  - **Mitigation:** Flex container has `items-center`. If alignment looks off, check `py-3 md:py-4` padding parity — but unlikely needed.
