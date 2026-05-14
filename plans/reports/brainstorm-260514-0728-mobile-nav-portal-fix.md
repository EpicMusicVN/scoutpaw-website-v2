# Brainstorm — Mobile Nav Drawer Portal Fix

**Date:** 2026-05-14
**Status:** Design approved (mechanical bugfix)
**Scope:** Move mobile nav drawer overlay into a React Portal so it escapes TopNav's stacking context.

---

## Root Cause

**TopNav has `backdrop-blur-md`.** CSS `backdrop-filter` creates a new stacking context. The MobileNav component renders the drawer overlay (`fixed inset-0 z-50`) AS A CHILD of TopNav. Result: drawer's z-50 is scoped to TopNav's stacking context (z-30 at page level). Anything in the page with z > 30 OR positioned AFTER TopNav in DOM with its own stacking context can paint over the drawer.

Specifically:
- TopNav at `z-30` with `backdrop-blur-md` → creates stacking context
- Drawer inside = trapped inside TopNav's context
- Body content (sections, etc.) → some have `z-10`, `z-20` inside their own contexts → render OVER trapped z-50

**Verified by audit:** `back-to-top.tsx` at z-40, `cookie-consent.tsx` at z-50, `scroll-progress.tsx` at z-50, `feature-banner.tsx` interior z-10, `featured-pup-spotlight.tsx` interior z-10. The latter two are inside their own stacking contexts (no overlap risk on z math). But ANY positioned ancestor with transform/filter/opacity can trap descendants.

---

## Fix

Use `createPortal` to render the drawer overlay to `document.body`. This moves it OUT of TopNav's DOM subtree → out of TopNav's stacking context → its `z-50` becomes effective at body level, above all in-flow content.

### `components/nav/mobile-nav.tsx`

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Character, NavItem } from "@/lib/content";
import { cn } from "@/lib/utils/cn";

export function MobileNav({ navItems, spotlight, logoText }: ...) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  // ... existing logic ...

  useEffect(() => setMounted(true), []);
  // ... existing open/close effect ...

  const drawer = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {/* ... same drawer body ... */}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-ink/5 active:scale-95 md:hidden"
      >
        <BurgerIcon open={open} />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
```

**Changes:**
- Add `useState(false)` for `mounted` + `useEffect(() => setMounted(true), [])` (SSR safety — only portal after mount)
- Wrap the `<AnimatePresence>` drawer in `createPortal(drawer, document.body)`
- Bump z-index `z-50` → `z-[100]` for headroom over any other z-50 elements (ScrollProgress, cookie consent)
- Hamburger button stays inline in TopNav (separate from portal)

---

## Effort

~10m. Single component edit.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Cookie consent (z-50) overlaps drawer | Low | Drawer at z-[100] now wins. Cookie consent stays at z-50 (still above content). |
| ScrollProgress (z-50 fixed top bar) covered by drawer | None | Drawer covers entire viewport when open; intended. |
| `mounted` flicker on first render | Low | Skip-portal on SSR — drawer doesn't exist in initial HTML. On mount, useEffect fires, mounted becomes true, drawer renders. Hamburger button is server-rendered and clickable. |
| Hydration mismatch | None | Drawer NEVER renders on first server pass (mounted is false). Hydration only sees portal after client effects. Safe pattern. |
| Body scroll-lock effect runs before portal mounted | None | scroll-lock is via `document.body.classList.add("nav-locked")` — works regardless of portal. |
| BackToTop button (z-40) appears over drawer | None | drawer z-[100] > 40. |

## Success Criteria

- Mobile drawer opens above ALL page content
- Hamburger button still works in TopNav
- ESC + route change close behaviors preserved
- Scroll-lock + spotlight image still work
- typecheck + lint clean

## Out of Scope

- Removing backdrop-blur from TopNav (preserves glass aesthetic; portal fixes the symptom)
- Refactoring other z-index conflicts (cookie consent, etc.)
- Tablet drawer (component is `md:hidden`, mobile-only)

## Unresolved Questions

None.
