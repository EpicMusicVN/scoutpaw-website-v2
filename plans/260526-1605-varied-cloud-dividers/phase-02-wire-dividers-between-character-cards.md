---
phase: 2
title: Wire Dividers Between Character Cards
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 2: Wire Dividers Between Character Cards

## Overview

Re-add `CloudDivider` between character cards on `/characters`, cycling through the 4 variants by index for visual rhythm. Also place a closing divider before the newsletter CTA.

## Requirements

**Functional:**
- A `CloudDivider` with rotating variant sits between every pair of adjacent character cards on `/characters`
- A final `CloudDivider` sits between the last character card and `NewsletterCTA`
- Variant cycle: `["trio", "duo-big", "scatter", "stack"]` indexed by position
- Dividers do NOT appear before the first character card (the page hero already provides separation)
- All other pages using `CloudDivider` remain unchanged (still use default `trio`)

**Non-functional:**
- Adding dividers does not break the `space-y-*` gap from Plan B — but the divider visually fills the space, so we may need to reduce `space-y-*` or wrap each card+divider pair
- Mobile spacing remains comfortable (dividers should scale down naturally via their own internal `py-*`)

## Architecture

Two wiring approaches:

**Approach A (chosen — simplest):** Inject divider between map iterations using array-index logic.
```jsx
{ordered.map((character, i) => (
  <Fragment key={character.slug}>
    {i > 0 && <CloudDivider variant={VARIANTS[i % 4]} />}
    <ScrollReveal>
      <CharacterSection ... />
    </ScrollReveal>
  </Fragment>
))}
<CloudDivider variant={VARIANTS[ordered.length % 4]} />
<ScrollReveal>
  <NewsletterCTA ... />
</ScrollReveal>
```

Reintroduces `Fragment` (removed in earlier cleanup) — necessary trade since we need conditional rendering between siblings.

**Variant cycle:** `const VARIANTS = ["trio", "duo-big", "scatter", "stack"] as const;` lives at module top.

The `space-y-12 md:space-y-20` wrapper from Plan B is removed — dividers provide visual rhythm now; let the natural padding (divider's own `py-6 md:py-8` + card's own padding) handle spacing.

## Related Code Files

- **Modify:** `app/characters/page.tsx` — re-add `Fragment` + `CloudDivider` imports; wire variant cycle
- **Read only:** `components/ui/cloud-divider.tsx` (just extended in Phase 1)

## Implementation Steps

1. **Open** `app/characters/page.tsx`.
2. **Re-add imports:**
   ```tsx
   import { Fragment } from "react";
   import { CloudDivider } from "@/components/ui/cloud-divider";
   ```
3. **Add variant cycle constant** above `CharactersPage`:
   ```tsx
   const DIVIDER_VARIANTS = ["trio", "duo-big", "scatter", "stack"] as const;
   ```
4. **Replace the character map** (from Plan B's `space-y-*` wrapper):
   ```diff
   - <div className="space-y-12 py-12 md:space-y-20 md:py-20">
   -   {ordered.map((character, i) => (
   -     <ScrollReveal key={character.slug}>
   -       <CharacterSection ... />
   -     </ScrollReveal>
   -   ))}
   - </div>
   + {ordered.map((character, i) => (
   +   <Fragment key={character.slug}>
   +     {i > 0 && <CloudDivider variant={DIVIDER_VARIANTS[i % DIVIDER_VARIANTS.length]} />}
   +     <ScrollReveal>
   +       <CharacterSection ... />
   +     </ScrollReveal>
   +   </Fragment>
   + ))}
   ```
5. **Add closing divider** before newsletter:
   ```diff
   + <CloudDivider variant={DIVIDER_VARIANTS[ordered.length % DIVIDER_VARIANTS.length]} />
     <ScrollReveal>
       <NewsletterCTA tag="characters-newsletter" />
     </ScrollReveal>
   ```
6. **Typecheck + lint.**
7. **Visual check** at mobile/tablet/desktop — confirm dividers visible and varied, spacing comfortable.

## Success Criteria

- [ ] 5 dividers rendered (4 between cards + 1 before newsletter)
- [ ] Each divider uses a different variant in rotation
- [ ] No divider above the first character card
- [ ] Imports clean: `Fragment` and `CloudDivider` only re-added where used
- [ ] All other pages using `CloudDivider` still render correctly with default variant
- [ ] Mobile rendering comfortable, no horizontal overflow from scatter/stack
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** `scatter` or `stack` variants visually wider on mobile than the container. *Mitigation:* CloudDivider's outer wrapper has `max-w-md`; SVG sizing inside is bounded. Confirm during visual check.
- **Risk:** Rotation produces a repetitive pattern (5 dividers, 4 variants → first and fifth match). *Mitigation:* the first and fifth dividers are not visually adjacent (4 character cards between them); pattern won't read as repetitive.

## Security Considerations

None.
