---
type: brainstorm
date: 2026-05-13
slug: remove-scroll-sun
status: approved
---

# Brainstorm: Remove Sun Scroll Effect on Homepage

## Problem
Homepage decorative sun (fixed top-right, parallax-drifts on scroll) must be removed.

## Surface Area
- `app/page.tsx:7` — `import { ScrollSun } from "@/components/home/scroll-sun";`
- `app/page.tsx:14` — `<ScrollSun />` element (rendered above `<FullBleedHero>`)
- `components/home/scroll-sun.tsx` — component definition (52 lines, framer-motion based)

No other references in source. Plans/docs/.next mentions are historical, not source dependencies.

## Approaches Considered

| Option | Verdict |
|---|---|
| Delete file + unwire | **Chosen.** Clean removal. Git restores if needed. |
| Unwire only, keep file | Rejected. Dead code. No stated reuse plan. |
| Feature-flag toggle | Rejected. YAGNI — no A/B test requirement. |

## Final Solution
1. Edit `app/page.tsx`: remove line 7 import + line 14 `<ScrollSun />`
2. Delete `components/home/scroll-sun.tsx`
3. Validate: `pnpm typecheck` + `pnpm lint`

## Risks
None material. Component was `position: fixed z-[5]` decorative-only — no layout/CSS dependents.

## Success Criteria
- Homepage renders without sun overlay
- Typecheck passes
- Lint passes
- No orphan imports of ScrollSun anywhere in repo

## Next Steps
Handoff to direct implementation (cook). No formal plan doc — scope too small.

## Unresolved
None.
