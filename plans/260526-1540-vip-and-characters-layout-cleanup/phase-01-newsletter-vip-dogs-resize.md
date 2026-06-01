---
phase: 1
title: Newsletter VIP Dogs Resize
status: completed
priority: P2
effort: 15m
dependencies: []
---

# Phase 1: Newsletter VIP Dogs Resize

## Overview

Shrink the two decorative dog images (`golden1`, `husky2`) in the Become a VIP newsletter card so they stop overlapping form/social-proof content at desktop widths. Reposition outward and lower so they read as flanking decoratives.

## Requirements

**Functional:**
- Dog images must not overlap the email input, submit button, or social-proof line at any `lg`+ breakpoint
- Maintain `aria-hidden` decorative-only role
- Preserve `lg:block` gate — mobile/tablet stay clean

**Non-functional:**
- No new assets, no new dependencies
- No layout regression on home/shop/top-picks/characters (shared component)

## Architecture

Single component, single decorative block (`components/home/newsletter-cta.tsx:165-183`). The outer `<section>` is `max-w-3xl` (768px). Decorative dogs are absolutely positioned within that section.

**Math check (lg = 1024px):**
- Section width: capped at 768px, centered → ~128px margin each side
- Old: `w-72` (288px) at `-left-16` (−64px) → dog occupies x = −64 to 224 within section → ~224px overlaps card interior
- New: `w-48` (192px) at `-left-20` (−80px) → dog occupies x = −80 to 112 → ~112px overlaps card, sitting near bottom-left corner where social-proof line lives (low text density area)

## Related Code Files

- **Modify:** `components/home/newsletter-cta.tsx` (lines 165-183 only)

No create / no delete.

## Implementation Steps

1. **Open** `components/home/newsletter-cta.tsx`.
2. **Replace** the decoratives block (lines 165-183). Diff intent:

   ```diff
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <Image
        src={assetUrl("characters-position/golden1.png")}
        alt=""
        width={320}
        height={180}
   -    className="absolute bottom-4 -left-16 h-auto w-72 -rotate-6"
   +    className="absolute -bottom-2 -left-20 h-auto w-48 -rotate-6"
      />
      <Image
        src={assetUrl("characters-position/husky2.png")}
        alt=""
        width={320}
        height={180}
   -    className="absolute bottom-6 -right-16 h-auto w-72 rotate-6"
   +    className="absolute -bottom-1 -right-20 h-auto w-48 rotate-6"
      />
    </div>
   ```

3. **Save.** Update the comment above the block if needed to reflect the smaller flanking decorative intent.
4. **Typecheck** — run `pnpm typecheck` (or equivalent) to confirm no errors. No type changes expected.
5. **Lint** — `pnpm lint` on the file.

## Success Criteria

- [ ] Dog images render at `w-48` (192px) on `lg`+ breakpoints
- [ ] No overlap with email input, submit button, or social-proof line at lg/xl/2xl
- [ ] Dogs remain hidden on mobile/tablet
- [ ] Typecheck + lint pass
- [ ] Visual sanity check across home, characters, top-picks, shop pages (NewsletterCTA is shared)

## Risk Assessment

- **Risk:** Visual regression on shared pages (home/shop/top-picks). *Mitigation:* uniform change, no logic — Phase 3 verification covers all 4 pages.
- **Risk:** At very wide viewports (2xl+), dogs may feel disconnected from card. *Mitigation:* monitor in Phase 3; if needed, increase negative offset slightly (acceptable follow-up, not a blocker).

## Security Considerations

None. No data flow, no auth, decorative pixels only.
