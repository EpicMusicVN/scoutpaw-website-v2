# Scroll-Sun Architectural Reversal: Hero-Bound → Global Fixed

**Date**: 2026-05-13 06:22
**Severity**: Medium
**Component**: Home Hero & Page Layout (`components/home/`, `app/`)
**Status**: Resolved

## What Happened

User returned with feedback: sun "stuck on banner" during page scroll. Expected behavior: global page-wide parallax starting above the fold, sun tracking document scroll not hero-only scroll. Architectural reversal: rewrote hero-bound `useScroll({ target: ref })` to global `useScroll()` with `fixed` positioning, opacity fade as sun nears page bottom, and repositioned component from `full-bleed-hero.tsx` to `app/page.tsx` root.

**Files touched:**
- `components/home/scroll-sun.tsx` (rewrite: drop useRef + outer div, switch to global useScroll, fixed positioning, opacity transform)
- `components/home/full-bleed-hero.tsx` (remove sun import + render)
- `app/page.tsx` (add sun import, render at fragment top)

**Validation:** `pnpm typecheck` + `pnpm lint` both clean.

## The Brutal Truth

Previous session shipped exactly what the user *selected* in the brainstorm radio button ("hero-bound recommended"), but the user's *actual vocabulary* ("move naturally across the page", "parallax") was screaming global. That contradiction lived in the brainstorm choices themselves—we let the user pick A while their description matched B, then shipped A. The real frustration: user's vague description + our "recommended option" bias created misalignment that burned a session. 

Lesson: When stated vocabulary conflicts with selected option in a brainstorm, **surface that conflict explicitly** before they finalize. "You said 'move naturally across page' (global behavior) but clicked 'hero-bound'. Which do you actually want?" This session's fix is clean. The process failure is the real lesson.

## Technical Details

**Old pattern (hero-scoped):**
```tsx
const ref = useRef<HTMLDivElement>(null);
const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
const y = useTransform(scrollY, [0, scrollHeight], [0, 220]);
```
Issues: useRef bloat, outer container needed, tight coupling to hero section, z-index collision with bg.

**New pattern (global):**
```tsx
const { scrollY } = useScroll(); // document scroll, no target needed
const y = useTransform(scrollY, [0, documentHeight * 0.6], [0, 300]);
const opacity = useTransform(scrollY, [0, documentHeight * 0.7, documentHeight * 0.85], [1, 1, 0.3]);
```
Benefits: no refs, no target divs, generic pattern reusable for any global decoration, opacity fade solves visual conflict (warm decoration + dark footer bg) without removing decoration.

**z-index placement:** `z-[5]` = above main content, below navbar (`z-[10]`). Document this band in design tokens for future decorations.

**Repositioning to root:** Component now lives in `app/page.tsx` fragment top, not nested in hero. Cleaner DOM hierarchy, zero layout impact, natural stacking layer.

## What We Tried

1. **Keeping hero-scoped, adding viewport check** → wrong abstraction. Problem was architecture, not implementation detail.
2. **useScroll({ target: document.documentElement })** → useScroll() no args is idiom; explicitly passing document element adds noise.

## Root Cause Analysis

Why didn't the initial brainstorm catch this? **User chose "hero-bound (recommended)" but the description they gave matched global behavior.** We defaulted to the radio button, not the vocabulary. In ambiguous brainstorms, the *labeled option* wins over the *user's phrasing* in the developer's mental model. That's a process failure, not a code failure.

Why hero-scoped felt right in the first session? **Architectural bias toward encapsulation.** Hero-bound decoration *seemed* simpler (constrained scope) than global fixed (manage z-index, opacity curves, page-height math). It was simpler in isolation. It wasn't correct for the user's intent.

## Lessons Learned

1. **User vocabulary vs. selected option conflict = flag it.** In brainstorms, call out contradictions explicitly. "Your description says X, your selection says Y. Which is it?" Force alignment before code starts. Saves reversals.

2. **Architectural reversals are fixes, not regressions.** Building option A, shipping, then pivoting to option B in session two teaches us which fits. This wasn't a mistake; it was feedback iteration. Document it, don't apologize.

3. **Global fixed + document useScroll() beats scoped variants.** Smaller code (no useRef, no outer container, no offset config), generic pattern (reusable for future decorations), cleaner stacking (no per-section z-index tuning). Shipped with 15 fewer lines than hero version.

4. **Opacity fade as visual conflict solver.** Warm decoration over dark footer bg creates contrast fight. Three-stop opacity transform (`[1, 1, 0.3]`) fades sun near footer without removing it. Lets footer breathe, decoration still visible. Small, elegant pattern.

5. **z-index band documentation matters for global decorations.** Document: `z-[5]` = above content, below fixed navbar. Future contributors won't accidentally blow the layering.

6. **Repositioning to page root is DOM hygiene.** Decoration is semantically page-level, not hero-level. Root placement reflects that. No functional difference, but honest hierarchy.

## Next Steps

- **Visual QA**: Scroll full page, verify sun descent + opacity fade feel natural near footer, no layout shift
- **Opacity tuning**: Curve may be too aggressive if cream section feels choked; adjust stops if needed
- **Commit**: 8 plans uncommitted; batch commit after QA pass
- **Future**: Consider autonomous rotation independent of scroll; moon echo in dark sections (backlog)

No blockers. Reversal is integrated, types clean, linting clean.

**Status**: DONE
