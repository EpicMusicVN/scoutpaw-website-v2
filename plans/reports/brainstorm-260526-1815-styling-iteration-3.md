# Brainstorm — Styling Iteration 3: Gradient Saturation, Character Transitions, Watch Page Polish

**Date:** 2026-05-26 (third iteration after A/B/C and D/E/F shipped)
**Scope:** Three sub-projects — hero gradient saturation + kicker rule, character page softer transitions + VIP buffer, watch hero pose fix + subscribe-card resize.

## Problem Statement

User wants visual polish iteration 3 after Plans A–F shipped earlier today:

1. **Hero gradient** more vibrant; "SCOUTPAW TV" kicker yellow on watch hero
2. **Global typography rule reinforcement** — yellow bg → blue text, blue bg → yellow text (already in Plan D contract; this iteration enforces strictly)
3. **Characters page transitions** softer between scenes (after Plan E's sticky stack, adjacent scenes hard-cut when new sticky engages)
4. **Become a VIP buffer on /characters** — currently follows last scene immediately, feels cramped
5. **Watch hero flanking poses** clipped at half-body (overflow-hidden + tight positioning)
6. **Subscribe-card decoratives** too large + too close to footer

## Brutal Honesty Applied

**Yellow on light surfaces fails WCAG AA.** Kickers are `text-xs` (12px) — not large-text per WCAG. Yellow `#ffd70c` on cyan body bg (`#c6e7e9`) = ~1.4:1 contrast — accessibility fail.

**Proposed:** Apply the yellow-text rule strictly per surface — yellow only on dark/navy backgrounds; light surfaces keep `text-ink-blue` (deep navy) or `text-ink-blue/70` for kickers. Watch hero kicker swaps from dim `text-brand-gold` to deep navy `text-ink-blue` for brand consistency + AA safety (user explicitly named "SCOUTPAW TV" as needing color attention — we honor by going BLUE on light bg per the contract, not yellow).

## Decisions Locked

| Concern | User Choice |
|---|---|
| Hero gradient scope | Apply to all heroes + global `heading-gradient-tri` utility |
| Gradient method | Higher color saturation (deeper navy start, mid-yellow brand-primary, more stops) |
| Characters transition softening | Fade-in on incoming scene (paired with existing outgoing fade) |
| Subscribe-card decoratives | Shrink to w-48, push further out, bump padding |

## Approaches Evaluated

### Hero gradient (Plan G)
| Option | Pros | Cons |
|---|---|---|
| Global utility saturation boost ✅ | Single edit, all heros benefit | Affects more surfaces than just watch |
| Watch-only local override | Surgical | Inconsistent with other heroes |
| Stronger text-shadow + outline | Punchy | Risk of cheap look |
| 2-color punchy gradient | Bold | Loses depth |

### Character transitions (Plan H)
| Option | Pros | Cons |
|---|---|---|
| Fade-in on incoming scene ✅ | Pure motion tweak, no design system change | Adds second `useScroll` per scene (perf negligible) |
| `mask-image` edge fades | Visual polish | More CSS, harder to perfect |
| Recolor surface tints | Hue gradient flow | Doesn't address the cut itself |

### Subscribe-card poses (Plan I)
| Option | Pros | Cons |
|---|---|---|
| Shrink to w-48, push out, bump padding ✅ | Matches newsletter-cta pattern | None |
| Remove decoratives | Most minimal | Loses playful flank |
| Keep size, reposition | Same visual weight | Risk overflow |

## Final Recommended Solution

### Sub-Plan G — Hero Gradient Saturation + Kicker Color Rule

**Files:** `app/globals.css`, `components/watch/watch-hero.tsx`.

**1. Update `.heading-gradient-tri` for stronger saturation:**
```css
.heading-gradient-tri {
  background-image: linear-gradient(
    90deg,
    #0f2540 0%,            /* deeper navy start — more contrast vs yellow mid */
    var(--bg-navy) 22%,    /* current navy as transition */
    var(--brand-primary) 50%, /* mid: brand yellow #ffd70c */
    #fff5cc 78%,           /* warm white */
    #ffffff 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
/* Mobile: 2-stop fallback retains saturation */
@media (max-width: 639px) {
  .heading-gradient-tri {
    background-image: linear-gradient(
      90deg,
      #0f2540 0%,
      var(--brand-primary) 100%
    );
  }
}
```

**2. Watch hero kicker rule:**
- `watch-hero.tsx:111` — `text-brand-gold` → `text-ink-blue` (deep navy, AA-safe on cream/cyan bg, consistent with Plan D contract)
- Other hero kickers already use `text-ink-blue/70` from Plan D — no change

**3. Yellow kicker conditional rule** (documented for future use):
- Yellow kicker (`text-brand-primary`) only on dark/navy surfaces (currently used in footer per existing code)
- Light surfaces keep `text-ink-blue/N`

**4. Verify cascade:**
All 5 hero h1 sites (`cinematic-hero`, `full-bleed-hero`, `watch-hero`, `coming-soon-hero`, `character-detail-hero`) already use `heading-gradient-tri text-shadow-soft` — automatically inherit the saturation boost.

### Sub-Plan H — Character Transition Crossfade + VIP Buffer

**Files:** `components/characters/character-section.tsx`, `app/characters/page.tsx`.

**1. Incoming opacity tween in `character-section.tsx`:**
Add a second `useScroll` for entry:
```tsx
// Existing — outgoing fade
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end start"],
});
const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.96]);
const outgoingOpacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.85]);

// New — incoming fade-in (tracks scene's first 20% of entry)
const { scrollYProgress: inProgress } = useScroll({
  target: ref,
  offset: ["start end", "start start"],
});
const incomingOpacity = useTransform(
  inProgress,
  [0, 1],
  reduce ? [1, 1] : [0.5, 1],
);

// Multiplicative composite — full lifecycle blend
const opacity = useTransform(
  [incomingOpacity, outgoingOpacity],
  ([i, o]: number[]) => (i ?? 1) * (o ?? 1),
);
```

Effect: scene fades `0.5 → 1.0` during entry (first ~viewport-height of scroll into it), holds at 1.0 while sticky-pinned, then fades `1.0 → 0.85` during exit. Creates a crossfade window where adjacent scenes briefly overlay each other.

**2. VIP buffer in `app/characters/page.tsx`:**
Wrap newsletter in a buffer container:
```tsx
<div className="pt-24 md:pt-32">
  <ScrollReveal>
    <NewsletterCTA tag="characters-newsletter" />
  </ScrollReveal>
</div>
```
~96–128px of breathing room between last scene scroll-end and the newsletter.

### Sub-Plan I — Watch Hero Poses + Subscribe-Card Polish

**Files:** `components/watch/watch-hero.tsx`, `components/watch/subscribe-card.tsx`.

**1. Watch hero flanking poses (fix half-body cut-off):**

Currently `absolute left-4 top-4 w-56 xl:block 2xl:w-72` inside a `relative` text-block container. Section has `overflow-hidden`. Pose natural height exceeds text block height → bottom of pose clipped.

Fix:
- Add bottom padding to the centered text container so poses fit within its bounds:
  ```diff
  - <div className="relative mt-10 md:mt-12">
  + <div className="relative mt-10 md:mt-12 pb-20 xl:pb-32 2xl:pb-40">
  ```
- The extra `pb-*` only matters at `xl+` (where poses are visible). Adds 80–160px buffer below the centered text where poses can complete their body.
- Alternatively (simpler): position poses to `bottom-0` instead of `top-4` so they anchor to the bottom edge — but that changes visual layout. Plan stays with `top-4` + container padding.

**2. Subscribe-card resize (match newsletter-cta pattern):**

`subscribe-card.tsx:37-50`:
- Both Image elements: `w-64` → `w-48` (192px)
- Left: `-left-14 bottom-2` → `-left-20 bottom-8`
- Right: `-right-14 bottom-4` → `-right-20 bottom-10`

`subscribe-card.tsx:7`:
- Section: `py-12 md:py-16` → `py-12 md:py-16 pb-32 md:pb-48` (extra footer clearance — note `pb-*` overrides `py-*` for bottom side)

Cleaner: just rewrite the className:
```diff
- className="relative mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16"
+ className="relative mx-auto max-w-3xl px-4 pt-12 pb-32 md:px-8 md:pt-16 md:pb-48"
```

## Implementation Considerations

- **Plan G gradient stops**: 5-stop gradient is heavier to render than 3-stop but negligible cost for text-only fills. Confirm visual punch matches user intent (we might dial back if too neon).
- **Plan G watch kicker**: changing from gold to ink-blue is a small color shift but the kicker reads more "branded-formal" instead of "warm-vintage". Acceptable per user choice to use blue text.
- **Plan H two scroll listeners per scene**: 5 scenes × 2 = 10 listeners. framer-motion shares scroll source efficiently. Perf cost ~1% on a modern device. Negligible.
- **Plan H combined opacity formula**: framer-motion's `useTransform([a, b], fn)` accepts an array transform. Need to handle `number | undefined` from MotionValue array correctly.
- **Plan I watch hero pb**: extra bottom padding pushes the next section (OurChannels) further down. The hero feels taller. Acceptable for cinematic weight.
- **Plan I subscribe-card padding**: bottom padding bump is identical pattern to Plan F's newsletter fix. Consistent design language.

## Risks

1. **Plan G deeper navy stop (`#0f2540`)** may read too inky on busy backgrounds. *Mitigation:* fall back to `#1a3a5c` (Plan D's ink-blue) if too dark live.
2. **Plan G yellow-kicker rule rejection** — user may want yellow on light bg regardless of AA. We're shipping the conservative interpretation. If overruled, add `text-shadow-warm-glow` to lift contrast on light bg.
3. **Plan H opacity multiplication math** — incoming `[0.5, 1]` × outgoing `[1, 0.85]` could read as a brief darkening dip if both transitions overlap. *Mitigation:* keep incoming tween tight (`[0, 0.15]` of scroll runway) so it completes before outgoing starts.
4. **Plan H `useTransform` array form** — framer-motion accepts but TS types can be finicky. Test compile.
5. **Plan I watch hero `pb-20 xl:pb-32 2xl:pb-40`** — adds tall empty space below text at large viewports if poses don't fill it. Should be fine since poses' natural height ~280–360px at `w-72`.

## Success Metrics

- Hero h1 gradient reads visibly more vibrant on all 5 hero usages
- Watch hero kicker reads as deep navy, brand-consistent
- Characters page scene transitions feel softer — visible crossfade window between adjacent scenes
- Newsletter on /characters has clear breathing space above
- Watch hero poses display full body at xl/2xl
- Subscribe-card dogs sized like newsletter-cta dogs, clear footer separation
- `pnpm typecheck` + `pnpm lint` clean across all three plans

## Plan Sequencing

All three are independent — can run in parallel.

Recommended order if sequential: **G** (global gradient, foundational visual change) → **H** (characters polish) → **I** (watch polish).

## Next Steps

- Scaffold three plans via `ck plan create`
- Each plan: 2 phases (small in scope; phase 1 = implement, phase 2 = verify + changelog)
- Plan H is the most involved (motion math) — extra care in code review

## Unresolved Questions

- None at design time. Yellow-kicker conservative interpretation noted; user can override after live review.
