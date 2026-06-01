---
phase: 2
title: Characters Page Dividers Removal
status: completed
priority: P2
effort: 10m
dependencies: []
---

# Phase 2: Characters Page Dividers Removal

## Overview

Remove all `<CloudDivider />` instances from the characters page so per-character tinted sections butt edge-to-edge — natural color-block transitions replace the explicit divider rows.

## Requirements

**Functional:**
- No visible cloud dividers between character sections
- No visible cloud divider between last section and newsletter CTA
- Per-character `surfaceTint` backgrounds remain (color blocks serve as separators)
- Section ordering and `flip` zig-zag preserved
- `priority` flag stays on the first character

**Non-functional:**
- `CloudDivider` component itself remains (still used on top-picks/shop/watch pages — out of scope)

## Architecture

`app/characters/page.tsx` currently wraps each character in `<Fragment>` with a `<CloudDivider />` sibling. Removing the divider also removes the need for `<Fragment>` (single child = `<ScrollReveal>`).

Each `<CharacterSection>` already provides `py-16 md:py-24` (64–96px) vertical padding internally → spacing intact after divider removal.

## Related Code Files

- **Modify:** `app/characters/page.tsx`

No create / no delete.

## Implementation Steps

1. **Open** `app/characters/page.tsx`.
2. **Update imports** — remove `CloudDivider` import (line 7) and `Fragment` import (line 2):

   ```diff
   - import { Fragment } from "react";
     import { CharacterSection } from "@/components/characters/character-section";
     import { FullBleedHero } from "@/components/home/full-bleed-hero";
     import { NewsletterCTA } from "@/components/home/newsletter-cta";
     import { ScrollReveal } from "@/components/motion/scroll-reveal";
   - import { CloudDivider } from "@/components/ui/cloud-divider";
   ```

3. **Replace** the character map (lines 47-59) and remove the trailing divider (line 61):

   ```diff
   - {ordered.map((character, i) => (
   -   <Fragment key={character.slug}>
   -     <CloudDivider />
   -     <ScrollReveal>
   -       <CharacterSection
   -         character={character}
   -         theme={getCharacterTheme(character.slug)}
   -         flip={i % 2 === 1}
   -         priority={i === 0}
   -       />
   -     </ScrollReveal>
   -   </Fragment>
   - ))}
   -
   - <CloudDivider />
   + {ordered.map((character, i) => (
   +   <ScrollReveal key={character.slug}>
   +     <CharacterSection
   +       character={character}
   +       theme={getCharacterTheme(character.slug)}
   +       flip={i % 2 === 1}
   +       priority={i === 0}
   +     />
   +   </ScrollReveal>
   + ))}
   ```

4. **Update the comment block** (lines 45-46) to drop "Alternating zig-zag layout" reference to dividers if any — current comment doesn't reference dividers, so likely no change needed.
5. **Save.**
6. **Typecheck + lint** — run `pnpm typecheck && pnpm lint`.

## Success Criteria

- [ ] No `<CloudDivider />` rendered between or after character sections on `/characters`
- [ ] `Fragment` + `CloudDivider` imports removed from the file
- [ ] All 5 characters (max → buddy → bella → oscar → rocky) still render in order
- [ ] Zig-zag flip pattern preserved (even indexes normal, odd flipped)
- [ ] First character pose still uses `priority` for LCP
- [ ] NewsletterCTA still renders below the last character section
- [ ] Typecheck + lint pass

## Risk Assessment

- **Risk:** Adjacent tinted backgrounds (e.g. warm → cool) create harsh visual jump. *Mitigation:* user explicitly chose "leave tints as-is" — accepted trade. Phase 3 captures live read; follow-up plan if needed.
- **Risk:** Removing `Fragment` wrapper changes React key location. *Mitigation:* `key` moves from `Fragment` to `ScrollReveal` — same effective uniqueness, no reconciliation issue.

## Security Considerations

None.
